import type { Meta, StoryObj } from "@storybook/react";
import { BreakpointBin } from "./BreakpointBin";
import { GNOME_BREAKPOINTS } from "../../hooks/useBreakpoint";
import { Text } from "../Text";
import { Button } from "../Button";
import { ActionRow } from "../ActionRow";
import { BoxedList } from "../BoxedList";
import { Switch } from "../Switch";

const meta: Meta<typeof BreakpointBin> = {
  title: "Adaptive/BreakpointBin",
  component: BreakpointBin,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Container that fires layout changes when **its own width** crosses defined
thresholds — the CSS container-query equivalent of \`AdwBreakpointBin\`
(libadwaita 1.9 / GNOME 50).

### vs \`useBreakpoint\`
| | \`useBreakpoint\` | \`BreakpointBin\` |
|---|---|---|
| Watches | Viewport (\`window.innerWidth\`) | Container (\`ResizeObserver\`) |
| Use when | Layout depends on screen size | Layout depends on available space |
| Pattern | Hook — use inside components | Component — wraps content |

### How it works
- Breakpoints are sorted by \`maxWidth\` ascending.
- The **active breakpoint** is the smallest \`maxWidth\` ≥ the container's current width.
- Exposed as \`data-breakpoint\` on the wrapper \`<div>\` for CSS targeting.
- When wider than all thresholds, \`activeBreakpoint\` is \`null\`.

### CSS targeting
\`\`\`css
.myCard[data-breakpoint="compact"] .layout { flex-direction: column; }
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BreakpointBin>;

const BREAKPOINTS = [
  { name: "compact", maxWidth: 320 },
  { name: "narrow",  maxWidth: 480 },
  { name: "regular", maxWidth: 700 },
];

// ─── Active breakpoint indicator ──────────────────────────────────────────────

export const NarrowViewport: Story = {
  render: () => (
    <BreakpointBin
      breakpoints={[
        { name: "compact", maxWidth: GNOME_BREAKPOINTS.narrow },
        { name: "medium",  maxWidth: GNOME_BREAKPOINTS.medium },
      ]}
      style={{ width: "100%" }}
    >
      {({ activeBreakpoint, width }) => (
        <div style={{ padding: 16, background: "var(--gnome-card-bg-color)", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }}>
          <Text variant="title-4">
            {activeBreakpoint === "compact"
              ? "Compact (≤ 400 px)"
              : activeBreakpoint === "medium"
              ? "Medium (≤ 550 px)"
              : "Regular (> 550 px)"}
          </Text>
          <Text variant="body" color="dim" style={{ marginTop: 4 }}>
            Container width: {Math.round(width)} px · breakpoint: <strong>{activeBreakpoint ?? "none"}</strong>
          </Text>
        </div>
      )}
    </BreakpointBin>
  ),
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Uses the canonical GNOME breakpoints (`narrow` = 400 px, `medium` = 550 px). " +
          "On this mobile viewport the container is in `compact` mode.",
      },
    },
  },
};

export const ActiveBreakpoint: Story = {
  render: () => (
    <BreakpointBin breakpoints={BREAKPOINTS} style={{ resize: "horizontal", overflow: "hidden", minWidth: 100, maxWidth: "100%" }}>
      {({ activeBreakpoint, width }) => (
        <div style={{ padding: 16, border: "2px dashed rgba(0,0,0,0.15)", borderRadius: 8, background: "var(--gnome-card-bg-color)" }}>
          <Text variant="title-4">Width: {Math.round(width)} px</Text>
          <Text variant="body" color="dim" style={{ marginTop: 4 }}>
            Active breakpoint:{" "}
            <strong>{activeBreakpoint ?? "none (wider than all)"}</strong>
          </Text>
          <Text variant="caption" color="dim" style={{ marginTop: 8 }}>
            Drag the resize handle (bottom-right corner) to change the container width.
            Breakpoints: compact ≤ 320 · narrow ≤ 480 · regular ≤ 700
          </Text>
        </div>
      )}
    </BreakpointBin>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Adaptive card layout ─────────────────────────────────────────────────────

export const AdaptiveCard: Story = {
  render: () => (
    <BreakpointBin
      breakpoints={[{ name: "stacked", maxWidth: 420 }]}
      style={{ resize: "horizontal", overflow: "hidden", minWidth: 200, maxWidth: "100%" }}
    >
      {({ activeBreakpoint }) => {
        const stacked = activeBreakpoint === "stacked";
        return (
          <div style={{
            display: "flex",
            flexDirection: stacked ? "column" : "row",
            gap: 16,
            padding: 16,
            background: "var(--gnome-card-bg-color)",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
          }}>
            <div style={{
              width: stacked ? "100%" : 120,
              height: 80,
              borderRadius: 8,
              background: "var(--gnome-accent-bg-color)",
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <Text variant="title-4">Adaptive Card</Text>
              <Text variant="body" color="dim" style={{ marginTop: 4 }}>
                {stacked
                  ? "Narrow: image stacked above text."
                  : "Wide: image beside text."}
              </Text>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Button variant="suggested" size="sm">Open</Button>
                <Button size="sm">Share</Button>
              </div>
            </div>
          </div>
        );
      }}
    </BreakpointBin>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Settings panel ───────────────────────────────────────────────────────────

export const SettingsPanel: Story = {
  render: () => (
    <BreakpointBin
      breakpoints={[{ name: "compact", maxWidth: 480 }]}
      style={{ resize: "horizontal", overflow: "hidden", minWidth: 200, maxWidth: "100%" }}
    >
      {({ activeBreakpoint, width }) => (
        <div style={{ padding: 16 }}>
          <Text variant="caption" color="dim" style={{ marginBottom: 12 }}>
            {Math.round(width)} px — {activeBreakpoint ?? "wide"} layout
          </Text>
          {activeBreakpoint === "compact" ? (
            /* Compact: full-width BoxedList */
            <BoxedList>
              <ActionRow title="Wi-Fi" subtitle="Connected" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
              <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
              <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane mode" />} />
            </BoxedList>
          ) : (
            /* Wide: two columns */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <BoxedList>
                <ActionRow title="Wi-Fi" subtitle="Connected" trailing={<Switch defaultChecked aria-label="Wi-Fi" />} />
                <ActionRow title="Bluetooth" trailing={<Switch aria-label="Bluetooth" />} />
              </BoxedList>
              <BoxedList>
                <ActionRow title="Airplane Mode" trailing={<Switch aria-label="Airplane mode" />} />
                <ActionRow title="VPN" trailing={<Switch aria-label="VPN" />} />
              </BoxedList>
            </div>
          )}
        </div>
      )}
    </BreakpointBin>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Side by side with viewport ───────────────────────────────────────────────

export const ContainerVsViewport: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {/* Narrow container */}
      <BreakpointBin
        breakpoints={[{ name: "compact", maxWidth: 400 }]}
        style={{ flex: "1 1 200px", minWidth: 200, maxWidth: 300 }}
      >
        {({ activeBreakpoint, width }) => (
          <div style={{ padding: 16, background: "var(--gnome-card-bg-color)", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Text variant="caption" color="dim">Container A — {Math.round(width)} px</Text>
            <Text variant="body" style={{ marginTop: 4 }}>
              {activeBreakpoint === "compact" ? "📦 Compact layout" : "📐 Regular layout"}
            </Text>
          </div>
        )}
      </BreakpointBin>

      {/* Wide container */}
      <BreakpointBin
        breakpoints={[{ name: "compact", maxWidth: 400 }]}
        style={{ flex: "1 1 500px" }}
      >
        {({ activeBreakpoint, width }) => (
          <div style={{ padding: 16, background: "var(--gnome-card-bg-color)", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }}>
            <Text variant="caption" color="dim">Container B — {Math.round(width)} px</Text>
            <Text variant="body" style={{ marginTop: 4 }}>
              {activeBreakpoint === "compact" ? "📦 Compact layout" : "📐 Regular layout"}
            </Text>
          </div>
        )}
      </BreakpointBin>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Two `BreakpointBin` instances with the same breakpoint (400 px) side by side. Each reacts to its own width, not the viewport — A is compact, B is regular, regardless of viewport size.",
      },
    },
  },
};
