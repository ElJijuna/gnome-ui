import styles from './StorybookEmbed.module.css';

export interface StorybookEmbedProps {
  url: string;
  title: string;
}

/**
 * Live component preview for entries with no extracted code example to run
 * through react-live (most `web-components` entries, and any `react`/
 * `layout`/`charts` component whose README has no ```tsx block) — a
 * bare-canvas embed of the component's own first Storybook story, using
 * Storybook's documented embed URL pattern
 * (https://storybook.js.org/docs/sharing/embed). Still genuinely live: it's
 * the real component, rendered by the package's own deployed Storybook.
 */
export const StorybookEmbed = ({ url, title }: StorybookEmbedProps) => (
  <iframe className={styles.frame} src={url} title={title} loading="lazy" />
);
