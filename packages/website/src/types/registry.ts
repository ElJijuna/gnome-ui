/** One row of a parsed `### Props` markdown table, keyed by column header. */
export type PropRow = Record<string, string>;

export type VisualPackageId = 'react' | 'layout' | 'charts';

export interface ComponentEntry {
  slug: string;
  package: VisualPackageId;
  name: string;
  description: string;
  /** First ```tsx block from the component's README, if any. */
  example?: string;
  /** Parsed `### Props` table rows, if the README has one. */
  props?: PropRow[];
  /** Best-effort deep link into the package's deployed Storybook. */
  storybookUrl: string;
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
