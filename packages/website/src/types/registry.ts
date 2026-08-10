/** One row of a parsed `### Props` markdown table, keyed by column header. */
export type PropRow = Record<string, string>;

export type VisualPackageId = 'react' | 'layout' | 'charts' | 'web-components' | 'react-native';

/**
 * The framework/target a package belongs to, for the cross-framework
 * availability matrix. `react`, `layout`, and `charts` are all "react" —
 * different sub-libraries of the same React ecosystem. `angular` never
 * appears on a `ComponentEntry` — no package implements it yet; it's shown
 * as "coming soon" wherever the matrix is rendered.
 */
export type FrameworkId = 'react' | 'web-components' | 'react-native' | 'angular';

export interface ComponentEntry {
  slug: string;
  package: VisualPackageId;
  name: string;
  description: string;
  /** First ```tsx block from the component's README, if any. */
  example?: string;
  /** Parsed `### Props` table rows, if the README has one. */
  props?: PropRow[];
  /** Best-effort deep link into the package's deployed Storybook docs page. Absent for `react-native` — no Storybook is built for it. */
  storybookUrl?: string;
  /** Bare-canvas Storybook iframe embed (no app chrome) of the component's first story, for a live preview when there's no `example` to run through react-live. */
  storybookEmbedUrl?: string;
}

export interface HookEntry {
  slug: string;
  name: string;
  description: string;
  example?: string;
}

export interface PackageEntry {
  id: string;
  packageName: string;
  version: string;
  description: string;
  installCommand?: string;
  storybookUrl?: string;
  componentCount?: number;
}
