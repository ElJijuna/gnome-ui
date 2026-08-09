import { describe, expect, it } from 'vitest';

import {
  buildStorybookUrl,
  extractDescription,
  extractExample,
  extractInstallCommand,
  extractPackageDescription,
  extractPropsTable,
  extractStorybookMeta,
  slugify,
} from './generate-registry.mjs';

describe('slugify', () => {
  it('matches a real Storybook id for a simple two-segment title', () => {
    expect(slugify('Components/Kbd')).toBe('components-kbd');
  });

  it('matches a real Storybook id for a multi-word segment', () => {
    expect(slugify('Data Display/ColumnView')).toBe('data-display-columnview');
  });

  it('matches a real Storybook id for a title with spaces on both segments', () => {
    expect(slugify('Adaptive/NavigationSplitView')).toBe('adaptive-navigationsplitview');
  });
});

describe('extractDescription', () => {
  it('takes the leading paragraph when there is no code block or heading', () => {
    const markdown = 'A button component.\n\n### Guidelines\n- Do this.\n';

    expect(extractDescription(markdown)).toBe('A button component.');
  });

  it('stops before a leading code block when there is no heading first', () => {
    const markdown = 'Standalone key-cap.\n\n```tsx\n<Kbd>Enter</Kbd>\n```\n';

    expect(extractDescription(markdown)).toBe('Standalone key-cap.');
  });

  it('returns an empty string when the README has no leading prose', () => {
    expect(extractDescription('### Props\n')).toBe('');
  });
});

describe('extractPackageDescription', () => {
  it('skips the H1, the centered image block, and badges to find the real paragraph', () => {
    const markdown = [
      '# @gnome-ui/react',
      '',
      '<p align="center">',
      '  <img src="logo.png" />',
      '</p>',
      '',
      'Component library for GNOME-style desktop apps.',
      '',
      '[![npm](badge.svg)](url)',
      '',
      '## Installation',
    ].join('\n');

    expect(extractPackageDescription(markdown)).toBe(
      'Component library for GNOME-style desktop apps.',
    );
  });
});

describe('extractExample', () => {
  it('extracts the first tsx fenced block', () => {
    const markdown = '```tsx\nimport { Kbd } from "@gnome-ui/react";\n<Kbd>Enter</Kbd>\n```\n';

    expect(extractExample(markdown)).toBe(
      'import { Kbd } from "@gnome-ui/react";\n<Kbd>Enter</Kbd>',
    );
  });

  it('returns undefined when there is no tsx block', () => {
    expect(extractExample('Just prose, no code.')).toBeUndefined();
  });

  it('ignores a bash code block and only matches tsx', () => {
    const markdown = '```bash\nnpm install\n```\n';

    expect(extractExample(markdown)).toBeUndefined();
  });
});

describe('extractPropsTable', () => {
  it('parses a standard props table into row objects', () => {
    const markdown = [
      '### Props',
      '',
      '| Prop | Type | Default | Description |',
      '|------|------|---------|-------------|',
      '| `children` | `string` | — | The key name |',
      '| `symbols` | `boolean` | `true` | Normalise the key |',
    ].join('\n');

    expect(extractPropsTable(markdown)).toEqual([
      { Prop: '`children`', Type: '`string`', Default: '—', Description: 'The key name' },
      { Prop: '`symbols`', Type: '`boolean`', Default: '`true`', Description: 'Normalise the key' },
    ]);
  });

  it('un-escapes pipes inside a union-type cell instead of splitting on them', () => {
    const markdown = [
      '### Props',
      '',
      '| Prop | Type | Default | Description |',
      '|------|------|---------|-------------|',
      '| `variant` | `"info" \\| "warning" \\| "tip"` | `"info"` | Visual emphasis |',
    ].join('\n');

    const [row] = extractPropsTable(markdown);

    expect(row.Type).toBe('`"info" | "warning" | "tip"`');
  });

  it('handles a table missing the Default column', () => {
    const markdown = [
      '### Props',
      '',
      '| Prop | Type | Description |',
      '|------|------|-------------|',
      '| `title` | `ReactNode` | Header title |',
    ].join('\n');

    expect(extractPropsTable(markdown)).toEqual([
      { Prop: '`title`', Type: '`ReactNode`', Description: 'Header title' },
    ]);
  });

  it('returns undefined when there is no Props heading', () => {
    expect(extractPropsTable('### Guidelines\n- Do this.\n')).toBeUndefined();
  });
});

describe('extractInstallCommand', () => {
  it('extracts the bash block under an Installation heading', () => {
    const markdown = '## Installation\n\n```bash\nnpm install @gnome-ui/react\n```\n';

    expect(extractInstallCommand(markdown)).toBe('npm install @gnome-ui/react');
  });

  it('returns undefined when there is no Installation heading', () => {
    expect(extractInstallCommand('## Usage\n\n```bash\nnpm test\n```\n')).toBeUndefined();
  });
});

describe('extractStorybookMeta', () => {
  it('extracts the title and detects the autodocs tag', () => {
    const source = "  title: 'Components/Kbd',\n  tags: ['autodocs'],\n";

    expect(extractStorybookMeta(source)).toEqual({ title: 'Components/Kbd', hasAutodocs: true });
  });

  it('detects a missing autodocs tag', () => {
    const source = "  title: 'Components/CvssVector',\n";

    expect(extractStorybookMeta(source)).toEqual({
      title: 'Components/CvssVector',
      hasAutodocs: false,
    });
  });

  it('returns undefined when there is no title', () => {
    expect(extractStorybookMeta('export default {};')).toBeUndefined();
  });
});

describe('buildStorybookUrl', () => {
  it('builds a docs deep link when the story is tagged autodocs', () => {
    const source = "title: 'Components/Kbd',\ntags: ['autodocs'],";

    expect(buildStorybookUrl('react', source)).toBe(
      'https://eljijuna.github.io/gnome-ui/react/?path=/docs/components-kbd--docs',
    );
  });

  it('falls back to the package root when there is no autodocs tag', () => {
    const source = "title: 'Components/CvssVector',";

    expect(buildStorybookUrl('react', source)).toBe('https://eljijuna.github.io/gnome-ui/react/');
  });

  it('falls back to the package root when there is no story file at all', () => {
    expect(buildStorybookUrl('react', undefined)).toBe(
      'https://eljijuna.github.io/gnome-ui/react/',
    );
  });
});
