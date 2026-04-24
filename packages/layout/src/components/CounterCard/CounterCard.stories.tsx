import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@gnome-ui/react";
import { Applications, Person, Refresh, Heart } from "@gnome-ui/icons";
import { CounterCard } from "./CounterCard";

const meta: Meta<typeof CounterCard> = {
  title: "Layout/CounterCard",
  component: CounterCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Metric card with an animated numeric counter.

Wraps \`Card\` from \`@gnome-ui/react\` and counts up to \`value\` using an
ease-out cubic curve on mount and whenever \`value\` changes.
Respects \`prefers-reduced-motion\`.

\`\`\`tsx
import { CounterCard } from "@gnome-ui/layout";

<CounterCard label="Documents" value={1248} suffix=" files" />
<CounterCard label="Revenue"   value={9420} prefix="$" accent duration={1500} />
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CounterCard>;

// ─── Basic ────────────────────────────────────────────────────────────────────

export const Basic: Story = {
  args: {
    label: "Documents",
    value: 1248,
    suffix: " files",
  },
  parameters: {
    docs: {
      description: { story: "A single counter card. Reload the page to watch the animation." },
    },
  },
};

// ─── Accent ───────────────────────────────────────────────────────────────────

export const Accent: Story = {
  args: {
    label: "Starred",
    value: 3,
    accent: true,
  },
  parameters: {
    docs: {
      description: { story: "`accent` renders the value in the theme accent color." },
    },
  },
};

// ─── Prefix and suffix ────────────────────────────────────────────────────────

export const PrefixSuffix: Story = {
  args: {
    label: "Revenue",
    value: 9420.5,
    prefix: "$",
    suffix: " USD",
    decimals: 2,
    accent: true,
    duration: 1500,
  },
  parameters: {
    docs: {
      description: { story: "`prefix` and `suffix` flank the number. `decimals` controls precision." },
    },
  },
};

// ─── Custom formatter ─────────────────────────────────────────────────────────

export const CustomFormat: Story = {
  args: {
    label: "Disk used",
    value: 48.3,
    format: (n) => `${n.toFixed(1)} GB`,
    duration: 1200,
  },
  parameters: {
    docs: {
      description: { story: "Pass a `format` function for full control over the displayed string." },
    },
  },
};

// ─── Grid of cards ────────────────────────────────────────────────────────────

export const Grid: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 180px)",
        gap: 16,
      }}
    >
      <CounterCard label="Documents" value={1248}  suffix=" files"                  duration={900}  />
      <CounterCard label="Starred"   value={3}                      accent           duration={700}  />
      <CounterCard label="Shared"    value={24}     suffix=" items"                  duration={1000} />
      <CounterCard label="Disk used" value={48.3}   format={(n) => `${n.toFixed(1)} GB`} duration={1100} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "Typical dashboard grid — each card gets a slightly different duration for a staggered feel." },
    },
  },
};

// ─── Live value change ────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Low",    value: 42    },
  { label: "Medium", value: 1248  },
  { label: "High",   value: 99999 },
];

export const LiveChange: Story = {
  render: function LiveChangeStory() {
    const [value, setValue] = useState(1248);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <CounterCard
          label="Documents"
          value={value}
          suffix=" files"
          accent
          duration={900}
          style={{ width: 200 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {PRESETS.map((p) => (
            <Button key={p.label} variant="flat" onClick={() => setValue(p.value)}>
              {p.label}
            </Button>
          ))}
        </div>
        <Button variant="suggested" onClick={() => setValue(Math.floor(Math.random() * 100000))}>
          Random
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "When `value` changes while a previous animation is still running, the counter " +
          "re-animates **from its current mid-point** — no jump, no restart from 0.",
      },
    },
  },
};

// ─── Dashboard stats (icon + color + trend) ───────────────────────────────────

const STATS = [
  { label: "Published Apps",  value: 3,     format: undefined as ((v: number) => string) | undefined, icon: Applications, color: "#3584e4", trend: "↑ 1 this month" },
  { label: "Total Downloads", value: 25700, format: (v: number) => `${(v / 1000).toFixed(1)}k`,       icon: Person,       color: "#33d17a", trend: "↑ 12% this week" },
  { label: "API Calls Today", value: 1482,  format: undefined as ((v: number) => string) | undefined, icon: Refresh,      color: "#ff7800", trend: "↑ 340 from yesterday" },
  { label: "Followers",       value: 128,   format: undefined as ((v: number) => string) | undefined, icon: Heart,        color: "#e01b24", trend: "↑ 8 this week" },
];

export const DashboardStats: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 180px)", gap: 12 }}>
      {STATS.map((s) => (
        <CounterCard
          key={s.label}
          label={s.label}
          value={s.value}
          format={s.format}
          icon={s.icon}
          color={s.color}
          trend={s.trend}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "`icon`, `color`, and `trend` props — mirrors the Developer Portal Dashboard STATS grid." },
    },
  },
};

// ─── No animation ─────────────────────────────────────────────────────────────

export const NoAnimation: Story = {
  args: {
    label: "Cached items",
    value: 5000,
    animated: false,
  },
  parameters: {
    docs: {
      description: { story: "`animated={false}` shows the value instantly — useful inside tables or lists." },
    },
  },
};
