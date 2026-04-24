import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TerminalView } from "./TerminalView";

const meta: Meta<typeof TerminalView> = {
  title: "Components/TerminalView",
  component: TerminalView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
Scrollable terminal-style output area styled after GNOME Terminal.
Intended for displaying logs, command output, or read-only text content.

\`\`\`tsx
import { TerminalView } from "@gnome-ui/react";

<TerminalView lines={["$ npm install", "added 42 packages"]} />
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TerminalView>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    lines: [
      "$ git clone https://github.com/gnome-ui/gnome-ui.git",
      "Cloning into 'gnome-ui'...",
      "remote: Enumerating objects: 1482, done.",
      "remote: Counting objects: 100% (1482/1482), done.",
      "remote: Compressing objects: 100% (612/612), done.",
      "Receiving objects: 100% (1482/1482), 4.21 MiB | 3.8 MiB/s, done.",
      "Resolving deltas: 100% (804/804), done.",
      "$ cd gnome-ui && npm install",
      "",
      "added 312 packages in 8.4s",
    ],
  },
  parameters: {
    docs: {
      description: { story: "Default variant — neutral monospace output." },
    },
  },
};

// ─── Long output (maxLines) ────────────────────────────────────────────────────

const LONG_LINES = Array.from({ length: 200 }, (_, i) =>
  `[${String(i + 1).padStart(3, "0")}] Processing file-${i + 1}.ts...`,
);

export const WithLongOutput: Story = {
  args: {
    lines: LONG_LINES,
    maxLines: 50,
  },
  parameters: {
    docs: {
      description: {
        story: "`maxLines={50}` — only the last 50 of 200 lines are rendered. `autoScroll` scrolls to the bottom on mount.",
      },
    },
  },
};

// ─── Success ───────────────────────────────────────────────────────────────────

export const SuccessVariant: Story = {
  args: {
    variant: "success",
    lines: [
      "$ npm test",
      "",
      " PASS  src/components/Button/Button.test.tsx",
      " PASS  src/components/Card/Card.test.tsx",
      " PASS  src/components/Badge/Badge.test.tsx",
      "",
      "Test Suites: 3 passed, 3 total",
      "Tests:       47 passed, 47 total",
      "Snapshots:   0 total",
      "Time:        2.41 s",
      "",
      "✓ All tests passed.",
    ],
  },
  parameters: {
    docs: {
      description: { story: "`variant=\"success\"` — green text for successful output." },
    },
  },
};

// ─── Warning ───────────────────────────────────────────────────────────────────

export const WarningVariant: Story = {
  args: {
    variant: "warning",
    lines: [
      "$ npm run build",
      "",
      "⚠ Warning: 'foo' is defined but never used  (Button.tsx:14)",
      "⚠ Warning: React Hook useEffect has missing dependency  (Card.tsx:32)",
      "⚠ Warning: Image is missing required 'alt' prop  (Avatar.tsx:8)",
      "",
      "Build completed with 3 warnings.",
    ],
  },
  parameters: {
    docs: {
      description: { story: "`variant=\"warning\"` — amber text for warnings." },
    },
  },
};

// ─── Destructive / Error ───────────────────────────────────────────────────────

export const ErrorVariant: Story = {
  args: {
    variant: "destructive",
    lines: [
      "$ npm run build",
      "",
      "✗ Error: Cannot find module '@gnome-ui/react'",
      "    at Object.<anonymous> (src/App.tsx:1:1)",
      "    at Module._compile (node:internal/modules/cjs/loader:1356:14)",
      "",
      "✗ Error: Type 'string' is not assignable to type 'number'",
      "    at CounterCard.tsx:42:18",
      "",
      "Build failed with 2 errors.",
    ],
  },
  parameters: {
    docs: {
      description: { story: "`variant=\"destructive\"` — red text for errors." },
    },
  },
};

// ─── AutoScroll disabled ───────────────────────────────────────────────────────

export const AutoScrollDisabled: Story = {
  args: {
    lines: LONG_LINES,
    autoScroll: false,
  },
  parameters: {
    docs: {
      description: {
        story: "`autoScroll={false}` — the terminal starts at the top even when many lines are present.",
      },
    },
  },
};

// ─── Live streaming ────────────────────────────────────────────────────────────

const STREAM_LINES = [
  "$ npm run deploy",
  "Building project...",
  "Compiling TypeScript...",
  "Bundling assets...",
  "Running tests...",
  "All tests passed.",
  "Uploading to CDN...",
  "Invalidating cache...",
  "Deploy complete! 🚀",
];

export const LiveStreaming: Story = {
  render: function LiveStreamingStory() {
    const [lines, setLines] = useState<string[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function start() {
      setLines([]);
      let i = 0;
      function next() {
        if (i >= STREAM_LINES.length) return;
        setLines((prev) => [...prev, STREAM_LINES[i++]]);
        timerRef.current = setTimeout(next, 600);
      }
      next();
    }

    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 500 }}>
        <TerminalView lines={lines} style={{ minHeight: 200 }} />
        <button
          onClick={start}
          style={{
            alignSelf: "flex-start",
            padding: "6px 14px",
            borderRadius: 6,
            border: "1px solid var(--gnome-light-3, #deddda)",
            background: "var(--gnome-card-bg-color, #fff)",
            cursor: "pointer",
            fontFamily: "var(--gnome-font-family)",
          }}
        >
          Run deploy
        </button>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Lines streamed one at a time — `autoScroll` keeps the view pinned to the latest output.",
      },
    },
  },
};
