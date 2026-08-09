import { GoPrevious } from '@gnome-ui/icons';
import { Button, HeaderBar, Icon, NavigationSplitView, useBreakpoint } from '@gnome-ui/react';
import type { ReactNode } from 'react';

import styles from './SplitLayout.module.css';

export interface SplitLayoutProps {
  /** Title shown in the sidebar/list pane's header bar. */
  sidebarTitle?: ReactNode;
  /** Sidebar / list pane body content. */
  sidebar: ReactNode;
  /** Trailing actions in the sidebar pane's header bar. */
  sidebarActions?: ReactNode;
  /** Title shown in the detail pane's header bar. */
  detailTitle?: ReactNode;
  /** Detail / content pane body content. */
  detail: ReactNode;
  /** Trailing actions in the detail pane's header bar. */
  detailActions?: ReactNode;
  /**
   * Whether the detail pane is showing on narrow screens (≤ 400 px).
   * `false` (default) shows the sidebar/list. Has no effect on wide screens,
   * where both panes are always visible side by side.
   */
  showDetail?: boolean;
  /**
   * Called when the automatic mobile back button is pressed. The back
   * button only renders (in the detail pane's header, narrow screens only)
   * when this is provided.
   */
  onBack?: () => void;
  /** Minimum sidebar width in px. Defaults to `180`. */
  minSidebarWidth?: number;
  /** Maximum sidebar width in px. Defaults to `280`. */
  maxSidebarWidth?: number;
  /** Fraction of total width given to the sidebar (0–1). Defaults to `0.25`. */
  sidebarWidthFraction?: number;
  className?: string;
}

/**
 * List/master + detail shell following the Adwaita `AdwNavigationSplitView`
 * pattern, with a `HeaderBar` for each pane — the way real Adwaita apps
 * (Settings, Files, Contacts) actually look, versus the bare pane-toggle
 * mechanics of `NavigationSplitView` (react) that this composes.
 *
 * On narrow screens the detail pane's header grows an automatic back
 * button (wired to `onBack`) instead of requiring every consumer to build
 * their own.
 *
 * @example
 * const [selected, setSelected] = useState<string | null>(null);
 * <SplitLayout
 *   sidebarTitle="Mail"
 *   sidebar={<MailList onSelect={setSelected} />}
 *   detailTitle={selected ?? undefined}
 *   detail={selected ? <MailDetail id={selected} /> : <EmptyState title="No message selected" />}
 *   showDetail={selected !== null}
 *   onBack={() => setSelected(null)}
 * />
 */
export const SplitLayout = ({
  sidebarTitle,
  sidebar,
  sidebarActions,
  detailTitle,
  detail,
  detailActions,
  showDetail = false,
  onBack,
  minSidebarWidth,
  maxSidebarWidth,
  sidebarWidthFraction,
  className,
}: SplitLayoutProps) => {
  // Must match the breakpoint NavigationSplitView collapses at internally
  // (libadwaita's `isNarrow`, ≤ 400 px) so the back button and the pane
  // switch appear in lockstep — not @gnome-ui/hooks's useBreakpoint, which
  // uses different (480/1024 px) thresholds for an unrelated mobile/tablet/
  // desktop split.
  const { isNarrow } = useBreakpoint();
  const showBack = isNarrow && showDetail && Boolean(onBack);

  const sidebarHeader = (sidebarTitle || sidebarActions) && (
    <HeaderBar title={sidebarTitle} end={sidebarActions} />
  );

  const detailHeader = (detailTitle || detailActions || showBack) && (
    <HeaderBar
      title={detailTitle}
      start={
        showBack && (
          <Button variant="flat" onClick={onBack} aria-label="Back">
            <Icon icon={GoPrevious} size="sm" aria-hidden />
          </Button>
        )
      }
      end={detailActions}
    />
  );

  return (
    <NavigationSplitView
      className={className}
      showContent={showDetail}
      minSidebarWidth={minSidebarWidth}
      maxSidebarWidth={maxSidebarWidth}
      sidebarWidthFraction={sidebarWidthFraction}
      sidebar={
        <div className={styles.pane}>
          {sidebarHeader}
          <div className={styles.paneBody}>{sidebar}</div>
        </div>
      }
      content={
        <div className={styles.pane}>
          {detailHeader}
          <div className={styles.paneBody}>{detail}</div>
        </div>
      }
    />
  );
};
