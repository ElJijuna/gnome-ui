export const HTMLElementBase: typeof HTMLElement =
  typeof HTMLElement === 'undefined' ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

let generatedId = 0;
let scrollLockCount = 0;
let previousBodyOverflow = '';

export function defineCustomElement(name: string, constructor: CustomElementConstructor) {
  if (typeof customElements !== 'undefined' && !customElements.get(name)) {
    customElements.define(name, constructor);
  }
}

export function emit<T>(
  target: EventTarget,
  name: string,
  detail: T,
  options: { cancelable?: boolean } = {},
) {
  return target.dispatchEvent(
    new CustomEvent<T>(name, {
      bubbles: true,
      cancelable: options.cancelable,
      composed: true,
      detail,
    }),
  );
}

export function ensureId(element: HTMLElement, prefix: string) {
  if (!element.id) {
    generatedId += 1;
    element.id = `${prefix}-${generatedId}`;
  }

  return element.id;
}

export function getFocusableElements(root: ParentNode) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      !element.hidden &&
      element.getAttribute('aria-hidden') !== 'true',
  );
}

export function focusFirst(root: HTMLElement) {
  const autofocus = root.querySelector<HTMLElement>('[autofocus]');
  const target = autofocus ?? getFocusableElements(root)[0] ?? root;

  if (!target.hasAttribute('tabindex') && target === root) {
    target.tabIndex = -1;
  }

  target.focus();
}

export function trapFocus(event: KeyboardEvent, root: HTMLElement) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(root);

  if (focusable.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }

  const [first] = focusable;
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function lockBodyScroll() {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  scrollLockCount += 1;
  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    scrollLockCount = Math.max(0, scrollLockCount - 1);

    if (scrollLockCount === 0) {
      document.body.style.overflow = previousBodyOverflow;
    }
  };
}

interface InertState {
  count: number;
  wasInert: boolean;
}

const inertStates = new WeakMap<HTMLElement, InertState>();

function acquireInert(element: HTMLElement) {
  const state = inertStates.get(element);

  if (state) {
    state.count += 1;
    return;
  }

  inertStates.set(element, {
    count: 1,
    wasInert: Boolean(element.inert),
  });
  element.inert = true;
}

function releaseInert(element: HTMLElement) {
  const state = inertStates.get(element);

  if (!state) {
    return;
  }

  state.count -= 1;

  if (state.count > 0) {
    return;
  }

  element.inert = state.wasInert;
  inertStates.delete(element);
}

function getOutsideBranches(modal: HTMLElement) {
  const branches = new Set<HTMLElement>();
  let current: HTMLElement | null = modal;

  while (current?.parentElement) {
    const parent: HTMLElement = current.parentElement;

    for (const sibling of parent.children) {
      if (sibling !== current && sibling instanceof HTMLElement) {
        branches.add(sibling);
      }
    }

    if (parent === document.body) {
      break;
    }

    current = parent;
  }

  return [...branches];
}

/**
 * Makes every branch outside a modal inert until the returned cleanup runs.
 * Reference counting preserves pre-existing inert state and supports nesting.
 */
export function isolateModal(modal: HTMLElement) {
  const isolated = new Set<HTMLElement>();

  const refresh = () => {
    const outsideBranches = new Set(getOutsideBranches(modal));

    for (const branch of isolated) {
      if (!outsideBranches.has(branch)) {
        releaseInert(branch);
        isolated.delete(branch);
      }
    }

    for (const branch of outsideBranches) {
      if (!isolated.has(branch)) {
        acquireInert(branch);
        isolated.add(branch);
      }
    }
  };

  refresh();

  const observer = new MutationObserver(refresh);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    observer.disconnect();

    for (const branch of isolated) {
      releaseInert(branch);
    }

    isolated.clear();
  };
}
