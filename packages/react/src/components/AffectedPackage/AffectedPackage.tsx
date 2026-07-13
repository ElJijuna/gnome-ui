import type { HTMLAttributes, ReactNode } from 'react';

import styles from './AffectedPackage.module.css';
import { formatPackageCoordinate, getPackageUrl, type PackageEcosystem } from './package';

export interface AffectedPackageProps extends HTMLAttributes<HTMLElement> {
  /** Package ecosystem, for example `npm`, `pypi`, `deb`, or `maven`. */
  ecosystem: PackageEcosystem | string;
  /** Package, image, library, or module name. */
  name: ReactNode;
  /** Vulnerable version or version range. */
  version?: ReactNode;
  /** Fixed version or remediation target. */
  fixedVersion?: ReactNode;
  /** Optional package digest, image digest, or lockfile hash. */
  digest?: ReactNode;
  /** Optional Package URL. Generated automatically when omitted and name/version are strings. */
  purl?: string;
}

const isText = (value: ReactNode): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

/**
 * Package coordinate summary for vulnerability findings, SBOMs, and scan reports.
 */
export const AffectedPackage = ({
  ecosystem,
  name,
  version,
  fixedVersion,
  digest,
  purl,
  className,
  'aria-label': ariaLabel,
  ...props
}: AffectedPackageProps) => {
  const generatedPurl =
    purl ??
    (isText(name) && (version === undefined || isText(version))
      ? getPackageUrl({
          ecosystem,
          name: String(name),
          version: version === undefined ? undefined : String(version),
        })
      : undefined);
  const accessibleLabel =
    ariaLabel ??
    (isText(name)
      ? `Affected package ${formatPackageCoordinate({
          ecosystem,
          name: String(name),
          version: isText(version) ? String(version) : undefined,
        })}`
      : undefined);

  return (
    <article
      {...props}
      aria-label={accessibleLabel}
      className={[styles.package, className].filter(Boolean).join(' ')}
      data-ecosystem={ecosystem}
    >
      <div className={styles.surface}>
        <div className={styles.header}>
          <span className={styles.ecosystem}>{ecosystem}</span>
          <span className={styles.name}>{name}</span>
        </div>

        <dl className={styles.meta}>
          {version ? (
            <div className={styles.metaItem}>
              <dt>Version</dt>
              <dd>{version}</dd>
            </div>
          ) : null}
          {fixedVersion ? (
            <div className={styles.metaItem}>
              <dt>Fixed in</dt>
              <dd>{fixedVersion}</dd>
            </div>
          ) : null}
          {digest ? (
            <div className={styles.metaItem}>
              <dt>Digest</dt>
              <dd>{digest}</dd>
            </div>
          ) : null}
          {generatedPurl ? (
            <div className={styles.metaItem}>
              <dt>PURL</dt>
              <dd>
                <code className={styles.purl}>{generatedPurl}</code>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </article>
  );
};
