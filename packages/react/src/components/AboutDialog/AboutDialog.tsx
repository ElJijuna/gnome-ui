import {
  useEffect,
  useRef,
  useCallback,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FOCUSABLE, trapFocus, useVisualViewport } from "../Dialog/dialogUtils";
import styles from "./AboutDialog.module.css";

export interface AboutDialogLink {
  label: string;
  url: string;
}

export interface AboutDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called on Escape or close button click. */
  onClose?: () => void;
  /** Application name. */
  applicationName: string;
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

type AboutTab = "details" | "credits" | "legal";
const ABOUT_TAB_LABEL: Record<AboutTab, string> = {
  details: "Details",
  credits: "Credits",
  legal: "Legal",
};

/**
 * Standard app info dialog with details, credits, and legal tabs.
 * Mirrors `AdwAboutDialog`.
 *
 * @see https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.AboutDialog.html
 */
export function AboutDialog({
  open,
  onClose,
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
}: AboutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<Element | null>(null);
  const viewportStyle = useVisualViewport();
  const [activeTab, setActiveTab] = useState<AboutTab>("details");

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement;
      const el = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    } else {
      (previouslyFocused.current as HTMLElement | null)?.focus();
      setActiveTab("details");
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      trapFocus(e, dialogRef);
    },
    [onClose]
  );

  if (!open) return null;

  const hasCredits = !!(developers?.length || designers?.length || artists?.length);
  const hasLegal = !!(copyright || licenseType || licenseText);
  const tabs = (
    ["details", hasCredits && "credits", hasLegal && "legal"] as (AboutTab | false)[]
  ).filter(Boolean) as AboutTab[];

  const node = (
    <div className={styles.backdrop} style={viewportStyle} onClick={onClose} aria-hidden="true">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.dialog}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {applicationIcon && <div className={styles.icon}>{applicationIcon}</div>}
          <div id={titleId} className={styles.appName}>{applicationName}</div>
          {version && <div className={styles.version}>{version}</div>}
        </div>

        {tabs.length > 1 && (
          <div className={styles.tabBar} role="tablist">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeTab === t}
                className={[styles.tabBtn, activeTab === t ? styles.tabBtnActive : null]
                  .filter(Boolean).join(" ")}
                onClick={() => setActiveTab(t)}
              >
                {ABOUT_TAB_LABEL[t]}
              </button>
            ))}
          </div>
        )}

        <div className={styles.tabContent}>
          {activeTab === "details" && (
            <div className={styles.section}>
              {comments && <p className={styles.comments}>{comments}</p>}
              {(developerName || website || links?.length) && (
                <dl className={styles.infoList}>
                  {developerName && (
                    <><dt className={styles.infoLabel}>Developer</dt><dd className={styles.infoValue}>{developerName}</dd></>
                  )}
                  {website && (
                    <><dt className={styles.infoLabel}>Website</dt><dd className={styles.infoValue}>
                      <a href={website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        {websiteLabel ?? website}
                      </a>
                    </dd></>
                  )}
                  {links?.map((l) => (
                    <><dt key={`${l.label}-dt`} className={styles.infoLabel}>{l.label}</dt>
                      <dd key={`${l.label}-dd`} className={styles.infoValue}>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.link}>{l.url}</a>
                      </dd></>
                  ))}
                </dl>
              )}
            </div>
          )}

          {activeTab === "credits" && (
            <div className={styles.section}>
              {[
                { heading: "Developers", list: developers },
                { heading: "Designers", list: designers },
                { heading: "Artists", list: artists },
              ].filter((g) => g.list?.length).map(({ heading, list }) => (
                <div key={heading} className={styles.creditGroup}>
                  <h4 className={styles.creditTitle}>{heading}</h4>
                  <ul className={styles.creditList}>
                    {list!.map((name) => <li key={name} className={styles.creditItem}>{name}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "legal" && (
            <div className={styles.section}>
              {copyright && <p className={styles.copyright}>{copyright}</p>}
              {licenseType && <p className={styles.licenseType}>{licenseType}</p>}
              {licenseText && <pre className={styles.licenseText}>{licenseText}</pre>}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={[styles.btn, styles.btnDefault].join(" ")} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return node;
  return createPortal(node, document.body);
}
