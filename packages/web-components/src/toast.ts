import { defineCustomElement, emit, HTMLElementBase } from './internal/dom';

export type GnomeToastDismissReason =
  | 'action'
  | 'attribute'
  | 'dismiss'
  | 'programmatic'
  | 'timeout';

export interface GnomeToastOpenChangeDetail {
  open: boolean;
}

export interface GnomeToastDismissDetail {
  reason: GnomeToastDismissReason;
}

/**
 * Timed, accessible notification with pause-on-hover and pause-on-focus.
 *
 * Descendants marked with `data-action` emit `gnome-action`; descendants
 * marked with `data-dismiss` dismiss the toast.
 */
export class GnomeToastElement extends HTMLElementBase {
  static readonly observedAttributes = ['duration', 'open'];

  #connected = false;
  #isOpen = false;
  #pendingDismissReason: GnomeToastDismissReason = 'attribute';
  #remaining = 0;
  #startedAt = 0;
  #timer: ReturnType<typeof setTimeout> | null = null;

  connectedCallback() {
    this.#connected = true;

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'status');
    }

    if (!this.hasAttribute('aria-live')) {
      this.setAttribute('aria-live', 'polite');
    }

    this.setAttribute('aria-atomic', 'true');
    this.addEventListener('click', this.#handleClick);
    this.addEventListener('focusin', this.#pause);
    this.addEventListener('focusout', this.#handleFocusOut);
    this.addEventListener('pointerenter', this.#pause);
    this.addEventListener('pointerleave', this.#resume);
    this.#syncOpen(false);
  }

  disconnectedCallback() {
    this.#connected = false;
    this.removeEventListener('click', this.#handleClick);
    this.removeEventListener('focusin', this.#pause);
    this.removeEventListener('focusout', this.#handleFocusOut);
    this.removeEventListener('pointerenter', this.#pause);
    this.removeEventListener('pointerleave', this.#resume);
    this.#clearTimer();
    this.#isOpen = false;
  }

  attributeChangedCallback(name: string) {
    if (!this.#connected) {
      return;
    }

    if (name === 'open') {
      this.#syncOpen(true);
    } else if (name === 'duration' && this.open) {
      this.#startTimer(this.duration);
    }
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value: boolean) {
    this.toggleAttribute('open', value);
  }

  get duration() {
    const value = Number(this.getAttribute('duration') ?? 5000);
    return Number.isFinite(value) && value >= 0 ? value : 5000;
  }

  set duration(value: number) {
    this.setAttribute('duration', String(Math.max(0, value)));
  }

  show() {
    if (this.open) {
      this.#startTimer(this.duration);
      return;
    }

    this.open = true;
  }

  dismiss(reason: GnomeToastDismissReason = 'programmatic') {
    if (!this.open) {
      return;
    }

    const shouldDismiss = emit<GnomeToastDismissDetail>(
      this,
      'gnome-before-dismiss',
      { reason },
      { cancelable: true },
    );

    if (shouldDismiss) {
      this.#pendingDismissReason = reason;
      this.open = false;
    }
  }

  #syncOpen(emitChange: boolean) {
    const { open } = this;

    this.dataset.state = open ? 'open' : 'closed';
    this.hidden = !open;

    if (open === this.#isOpen) {
      return;
    }

    this.#isOpen = open;

    if (open) {
      this.#startTimer(this.duration);
    } else {
      this.#clearTimer();

      if (emitChange) {
        emit<GnomeToastDismissDetail>(this, 'gnome-dismiss', {
          reason: this.#pendingDismissReason,
        });
      }

      this.#pendingDismissReason = 'attribute';
    }

    if (emitChange) {
      emit<GnomeToastOpenChangeDetail>(this, 'gnome-open-change', { open });
    }
  }

  #startTimer(duration: number) {
    this.#clearTimer();
    this.#remaining = duration;

    if (duration === 0) {
      return;
    }

    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => this.dismiss('timeout'), duration);
  }

  #clearTimer() {
    if (this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

  #pause = () => {
    if (!this.#timer) {
      return;
    }

    this.#remaining = Math.max(0, this.#remaining - (Date.now() - this.#startedAt));
    this.#clearTimer();
  };

  #resume = () => {
    if (!this.open || this.duration === 0 || this.#timer) {
      return;
    }

    this.#startedAt = Date.now();
    this.#timer = setTimeout(() => this.dismiss('timeout'), this.#remaining);
  };

  #handleFocusOut = (event: FocusEvent) => {
    if (!(event.relatedTarget instanceof Node) || !this.contains(event.relatedTarget)) {
      this.#resume();
    }
  };

  #handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const control = event.target.closest<HTMLElement>('[data-action], [data-dismiss]');

    if (!control || !this.contains(control)) {
      return;
    }

    if (control.hasAttribute('data-action')) {
      const shouldDismiss = emit(
        this,
        'gnome-action',
        {
          action: control.dataset.action || 'default',
        },
        {
          cancelable: true,
        },
      );

      if (shouldDismiss) {
        this.dismiss('action');
      }

      return;
    }

    this.dismiss('dismiss');
  };
}

export function registerGnomeToast() {
  defineCustomElement('gnome-toast', GnomeToastElement);
}

registerGnomeToast();

declare global {
  interface HTMLElementTagNameMap {
    'gnome-toast': GnomeToastElement;
  }
}
