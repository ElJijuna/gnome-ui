import {
  useEffect,
  useRef,
  useCallback,
  useId,
  useState,
  type KeyboardEvent,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.css";

// ─── Shared focus trap ────────────────────────────────────────────────────────

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(e: KeyboardEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) {
  if (e.key !== "Tab") return;
  const focusable = Array.from(ref.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// ─── AlertDialog types ────────────────────────────────────────────────────────

export type AlertDialogResponseVariant = "default" | "suggested" | "destructive";

export interface AlertDialogResponse {
  /**
   * Unique identifier returned via `onResponse`.
   * Use `"cancel"` by convention for the dismissive action.
   */
  id: string;
  /** Button label. */
  label: string;
  /** Visual emphasis. Defaults to `"default"`. */
  variant?: AlertDialogResponseVariant;
  /** Disables the button. */
  disabled?: boolean;
}

// ─── AboutDialog types ────────────────────────────────────────────────────────

export interface AboutDialogLink {
  label: string;
  url: string;
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export interface DialogButton {
  /** Button label. */
  label: string;
  /** Visual variant. Defaults to `"default"`. */
  variant?: "default" | "suggested" | "destructive";
  /** Called when the button is clicked. */
  onClick: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
}

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the dialog is visible. */
  open: boolean;

  // ── Standard dialog ──────────────────────────────────────────────────────

  /** Dialog heading. */
  title?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Action buttons (standard dialog API). */
  buttons?: DialogButton[];
  /** Called on Escape or backdrop click. */
  onClose?: () => void;
  /** Whether clicking the backdrop closes the dialog. Defaults to `true`. */
  closeOnBackdrop?: boolean;

  // ── AlertDialog extension ─────────────────────────────────────────────────

  /**
   * ARIA role. Use `"alertdialog"` for confirmations and destructive warnings —
   * screen readers announce it immediately. Defaults to `"dialog"`.
   *
   * When using `role="alertdialog"`, prefer the `responses`/`onResponse` API
   * over `buttons`/`onClick` for semantic clarity.
   */
  role?: "dialog" | "alertdialog";

  /**
   * Response buttons (AlertDialog API). Alternative to `buttons` — each
   * response has a semantic `id` returned via `onResponse`.
   * Escape and backdrop click fire the first non-destructive response.
   */
  responses?: AlertDialogResponse[];

  /**
   * Called with the `id` of the response button clicked.
   * Required when `responses` is provided.
   */
  onResponse?: (id: string) => void;

  // ── AboutDialog extension ─────────────────────────────────────────────────

  /**
   * Set to `"about"` to render as an application info dialog.
   * When `variant="about"`, `title`/`buttons`/`children` are ignored in favour
   * of the about-specific props below.
   */
  variant?: "about";

  /** Application name (required when `variant="about"`). */
  applicationName?: string;
  /** Icon rendered above the app name. */
  applicationIcon?: ReactNode;
  /** Version string (e.g. `"1.0.0"`). */
  version?: string;
  /** One-sentence description. */
  comments?: string;
  /** Developer or organisation name. */
  developerName?: string;
  /** Application website URL. */
  website?: string;
  /** Label for the website link. Defaults to the URL. */
  websiteLabel?: string;
  /** Developer names shown in the Credits tab. */
  developers?: string[];
  /** Designer names shown in the Credits tab. */
  designers?: string[];
  /** Artist names shown in the Credits tab. */
  artists?: string[];
  /** Copyright notice (e.g. `"© 2024 Jane Smith"`). */
  copyright?: string;
  /** SPDX identifier or short name (e.g. `"GPL-3.0"`). */
  licenseType?: string;
  /** Full license text shown in the Legal tab. */
  licenseText?: string;
  /** Extra links shown in the Details section. */
  links?: AboutDialogLink[];
}

// ─── About tab internals ──────────────────────────────────────────────────────

type AboutTab = "details" | "credits" | "legal";
const ABOUT_TAB_LABEL: Record<AboutTab, string> = {
  details: "Details",
  credits: "Credits",
  legal: "Legal",
};

/**
 * Blocking modal dialog following the Adwaita pattern.
 *
 * Three modes in one component:
 *
 * **Standard** — `title` + `children` + `buttons[]`.
 *
 * **Alert** — add `role="alertdialog"` + `responses[]` + `onResponse`.
 * Uses a semantic response id instead of per-button `onClick`.
 * Escape / backdrop fire the first non-destructive response.
 * Mirrors `AdwAlertDialog`.
 *
 * **About** — add `variant="about"` + `applicationName` + info props.
 * Renders app icon, version, details/credits/legal tabs.
 * Mirrors `AdwAboutDialog`.
 *
 * All modes share the same portal, focus-trap, and card/backdrop styles.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.Dialog.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.AlertDialog.html
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.AboutDialog.html
 */
export function Dialog({
  open,
  title,
  children,
  buttons = [],
  onClose,
  closeOnBackdrop = true,
  role = "dialog",
  responses,
  onResponse,
  variant,
  applicationName,
  applicationIcon,
  version,
  comments,
  developerName,
  website,
  websiteLabel,
  developers,
  designers,
  artists,
  copyright,
  licenseType,
  licenseText,
  links,
  className,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);
  const [aboutTab, setAboutTab] = useState<AboutTab>("details");

  const isAlert = !!responses;
  const isAbout = variant === "about";

  // ── Focus management ───────────────────────────────────────────────────────
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
      if (isAbout) setAboutTab("details");
    }
  }, [open, isAbout]);

  // ── Dismiss helpers ────────────────────────────────────────────────────────
  const dismissAlert = useCallback(() => {
    const cancel = responses?.find((r) => r.variant !== "destructive" && !r.disabled);
    if (cancel) onResponse?.(cancel.id);
  }, [responses, onResponse]);

  const handleBackdrop = isAlert ? dismissAlert : closeOnBackdrop ? onClose : undefined;

  // ── Keyboard ───────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isAlert) dismissAlert();
        else onClose?.();
        return;
      }
      trapFocus(e, dialogRef);
    },
    [isAlert, dismissAlert, onClose]
  );

  if (!open) return null;

  // ── About tabs ─────────────────────────────────────────────────────────────
  const hasCredits = !!(developers?.length || designers?.length || artists?.length);
  const hasLegal = !!(copyright || licenseType || licenseText);
  const aboutTabs = (
    ["details", hasCredits && "credits", hasLegal && "legal"] as (AboutTab | false)[]
  ).filter(Boolean) as AboutTab[];

  // ── Render buttons (standard or alert) ────────────────────────────────────
  const renderButtons = () => {
    if (isAbout) {
      return (
        <div className={styles.footer}>
          <button type="button" className={[styles.btn, styles["btn-default"]].join(" ")} onClick={onClose}>
            Close
          </button>
        </div>
      );
    }
    if (isAlert && responses) {
      return (
        <div className={styles.footer}>
          {responses.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={r.disabled}
              className={[styles.btn, styles[`btn-${r.variant ?? "default"}`]].filter(Boolean).join(" ")}
              onClick={() => onResponse?.(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      );
    }
    if (buttons.length > 0) {
      return (
        <div className={styles.footer}>
          {buttons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              disabled={btn.disabled}
              className={[styles.btn, styles[`btn-${btn.variant ?? "default"}`]].filter(Boolean).join(" ")}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  // ── About content ──────────────────────────────────────────────────────────
  const renderAboutContent = () => (
    <>
      <div className={styles.aboutHeader}>
        {applicationIcon && <div className={styles.aboutIcon}>{applicationIcon}</div>}
        <div id={titleId} className={styles.aboutAppName}>{applicationName}</div>
        {version && <div className={styles.aboutVersion}>{version}</div>}
      </div>

      {aboutTabs.length > 1 && (
        <div className={styles.aboutTabBar} role="tablist">
          {aboutTabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={aboutTab === t}
              className={[styles.aboutTabBtn, aboutTab === t ? styles.aboutTabBtnActive : null]
                .filter(Boolean).join(" ")}
              onClick={() => setAboutTab(t)}
            >
              {ABOUT_TAB_LABEL[t]}
            </button>
          ))}
        </div>
      )}

      <div className={styles.aboutTabContent}>
        {aboutTab === "details" && (
          <div className={styles.aboutSection}>
            {comments && <p className={styles.aboutComments}>{comments}</p>}
            {(developerName || website || links?.length) && (
              <dl className={styles.aboutInfoList}>
                {developerName && (
                  <><dt className={styles.aboutInfoLabel}>Developer</dt><dd className={styles.aboutInfoValue}>{developerName}</dd></>
                )}
                {website && (
                  <><dt className={styles.aboutInfoLabel}>Website</dt><dd className={styles.aboutInfoValue}>
                    <a href={website} target="_blank" rel="noopener noreferrer" className={styles.aboutLink}>
                      {websiteLabel ?? website}
                    </a>
                  </dd></>
                )}
                {links?.map((l) => (
                  <><dt key={`${l.label}-dt`} className={styles.aboutInfoLabel}>{l.label}</dt>
                    <dd key={`${l.label}-dd`} className={styles.aboutInfoValue}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.aboutLink}>{l.url}</a>
                    </dd></>
                ))}
              </dl>
            )}
          </div>
        )}

        {aboutTab === "credits" && (
          <div className={styles.aboutSection}>
            {[
              { heading: "Developers", list: developers },
              { heading: "Designers", list: designers },
              { heading: "Artists", list: artists },
            ].filter((g) => g.list?.length).map(({ heading, list }) => (
              <div key={heading} className={styles.aboutCreditGroup}>
                <h4 className={styles.aboutCreditTitle}>{heading}</h4>
                <ul className={styles.aboutCreditList}>
                  {list!.map((name) => <li key={name} className={styles.aboutCreditItem}>{name}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {aboutTab === "legal" && (
          <div className={styles.aboutSection}>
            {copyright && <p className={styles.aboutCopyright}>{copyright}</p>}
            {licenseType && <p className={styles.aboutLicenseType}>{licenseType}</p>}
            {licenseText && <pre className={styles.aboutLicenseText}>{licenseText}</pre>}
          </div>
        )}
      </div>
    </>
  );

  const node = (
    <div
      className={styles.backdrop}
      onClick={handleBackdrop}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          styles.dialog,
          isAbout ? styles.dialogAbout : null,
          className,
        ].filter(Boolean).join(" ")}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {isAbout ? (
          renderAboutContent()
        ) : (
          <>
            {title && <div id={titleId} className={styles.title}>{title}</div>}
            {children && <div className={styles.body}>{children}</div>}
          </>
        )}
        {renderButtons()}
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
