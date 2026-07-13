import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';

import styles from './CveIdentifier.module.css';
import { type CveLinkSource, getCveUrl, isCveId, normalizeCveId } from './cve';

type CveIdentifierBaseProps = {
  /** CVE identifier, for example `CVE-2024-3094`. */
  cveId: string;
};

export type CveIdentifierProps =
  | (CveIdentifierBaseProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & {
        /** Whether to render as a link. Defaults to `true`. */
        link?: true;
        /** Vulnerability database used when `href` is omitted. */
        source?: CveLinkSource;
      })
  | (CveIdentifierBaseProps &
      HTMLAttributes<HTMLSpanElement> & {
        /** Render as static text instead of a link. */
        link: false;
        href?: never;
        source?: never;
      });

/**
 * Monospace CVE identifier with optional link to CVE.org or NVD.
 */
export const CveIdentifier = ({
  cveId,
  link = true,
  source = 'cve',
  className,
  'aria-label': ariaLabel,
  ...props
}: CveIdentifierProps) => {
  const normalized = normalizeCveId(cveId);
  const valid = isCveId(normalized);
  const classes = [styles.identifier, valid ? null : styles.invalid, className]
    .filter(Boolean)
    .join(' ');

  if (!link) {
    return (
      <span
        {...props}
        aria-label={ariaLabel ?? `${normalized} vulnerability identifier`}
        className={classes}
        data-valid={valid ? 'true' : 'false'}
      >
        {normalized}
      </span>
    );
  }

  const {
    href: customHref,
    rel,
    target,
    ...anchorProps
  } = props as AnchorHTMLAttributes<HTMLAnchorElement>;
  const href = customHref ?? getCveUrl(normalized, source);

  return (
    <a
      {...anchorProps}
      aria-label={ariaLabel ?? `${normalized} vulnerability identifier`}
      className={classes}
      data-valid={valid ? 'true' : 'false'}
      href={href}
      rel={target === '_blank' ? 'noopener noreferrer' : rel}
      target={target}
    >
      {normalized}
    </a>
  );
};
