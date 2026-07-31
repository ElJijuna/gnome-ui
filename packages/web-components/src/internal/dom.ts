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

interface ManagedInertState {
  wasInert: boolean;
}

const managedInertStates = new WeakMap<HTMLElement, ManagedInertState>();
const managedInertElements = new Set<HTMLElement>();
const modalStack: HTMLElement[] = [];
let modalObserver: MutationObserver | null = null;

function manageInert(element: HTMLElement) {
  if (managedInertStates.has(element)) {
    return;
  }

  managedInertStates.set(element, {
    wasInert: Boolean(element.inert),
  });
  managedInertElements.add(element);
  element.inert = true;
}

function restoreInert(element: HTMLElement) {
  const state = managedInertStates.get(element);

  if (!state) {
    return;
  }

  element.inert = state.wasInert;
  managedInertStates.delete(element);
  managedInertElements.delete(element);
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

function refreshModalIsolation() {
  for (let index = modalStack.length - 1; index >= 0; index -= 1) {
    if (!modalStack[index].isConnected) {
      modalStack.splice(index, 1);
    }
  }

  const topModal = modalStack[modalStack.length - 1];
  const outsideBranches = new Set(topModal ? getOutsideBranches(topModal) : []);

  for (const element of managedInertElements) {
    if (!outsideBranches.has(element)) {
      restoreInert(element);
    }
  }

  for (const branch of outsideBranches) {
    manageInert(branch);
  }

  for (const modal of modalStack) {
    modal.toggleAttribute('data-modal-top', modal === topModal);
  }
}

export function isTopModal(modal: HTMLElement) {
  return modalStack[modalStack.length - 1] === modal;
}

/**
 * Makes every branch outside a modal inert until the returned cleanup runs.
 * A shared stack keeps only the topmost modal interactive while preserving
 * pre-existing inert state.
 */
export function isolateModal(modal: HTMLElement) {
  modalStack.push(modal);
  refreshModalIsolation();

  if (!modalObserver) {
    modalObserver = new MutationObserver(refreshModalIsolation);
    modalObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    const modalIndex = modalStack.lastIndexOf(modal);

    if (modalIndex >= 0) {
      modalStack.splice(modalIndex, 1);
    }

    modal.removeAttribute('data-modal-top');
    refreshModalIsolation();

    if (modalStack.length === 0) {
      modalObserver?.disconnect();
      modalObserver = null;
    }
  };
}
