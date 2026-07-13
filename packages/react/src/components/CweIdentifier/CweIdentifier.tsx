import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';

import styles from './CweIdentifier.module.css';
import { type CweLinkSource, getCweUrl, isCweId, normalizeCweId } from './cwe';

type CweIdentifierBaseProps = {
  /** CWE identifier, for example `CWE-79`. Numeric strings are normalized. */
  cweId: string;
};

export type CweIdentifierProps =
  | (CweIdentifierBaseProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & {
        /** Whether to render as a link. Defaults to `true`. */
        link?: true;
        /** Weakness database used when `href` is omitted. */
        source?: CweLinkSource;
      })
  | (CweIdentifierBaseProps &
      HTMLAttributes<HTMLSpanElement> & {
        /** Render as static text instead of a link. */
        link: false;
        href?: never;
        source?: never;
      });

/**
 * Monospace CWE identifier with optional link to MITRE CWE.
 */
export const CweIdentifier = ({
  cweId,
  link = true,
  source = 'mitre',
  className,
  'aria-label': ariaLabel,
  ...props
}: CweIdentifierProps) => {
  const normalized = normalizeCweId(cweId);
  const valid = isCweId(normalized);
  const classes = [styles.identifier, valid ? null : styles.invalid, className]
    .filter(Boolean)
    .join(' ');

  if (!link) {
    return (
      <span
        {...props}
        aria-label={ariaLabel ?? `${normalized} weakness identifier`}
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
  const href = customHref ?? getCweUrl(normalized, source);

  return (
    <a
      {...anchorProps}
      aria-label={ariaLabel ?? `${normalized} weakness identifier`}
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
