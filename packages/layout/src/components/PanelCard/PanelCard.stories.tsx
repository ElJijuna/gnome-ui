import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Text, Badge } from "@gnome-ui/react";
import { DocumentOpen, Settings, Star, Information } from "@gnome-ui/icons";
import { Icon } from "@gnome-ui/react";
import { PanelCard } from "./PanelCard";
import type { PanelCardHandle } from "./PanelCard";

const meta: Meta<typeof PanelCard> = {
  title: "Layout/PanelCard",
  component: PanelCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Card with a structured **header / body / footer** layout and built-in
collapse/expand behaviour.

The expanded state lives inside the component. Use a \`ref\` to drive it
imperatively from the outside:

\`\`\`tsx
import { useRef } from "react";
import { PanelCard } from "@gnome-ui/layout";
import type { PanelCardHandle } from "@gnome-ui/layout";

const ref = useRef<PanelCardHandle>(null);

<button onClick={() => ref.current?.toggle()}>Toggle</button>

<PanelCard
  ref={ref}
  icon={<Icon icon={DocumentOpen} />}
  title="My Panel"
  headerActions={<Button variant="flat">Edit</Button>}
  onExpandedChange={(open) => console.log(open)}
  footer={<Text variant="caption" color="dim">Saved 2 min ago</Text>}
  footerActions={<Button variant="suggested">Save</Button>}
>
  Panel body content
</PanelCard>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PanelCard>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    title: "Panel Title",
    children: (
      <Text variant="body" color="dim">
        Panel body content. Collapse and expand using the chevron in the header.
      </Text>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal panel: title + body + chevron. Starts expanded.",
      },
    },
  },
};

// ─── Full ─────────────────────────────────────────────────────────────────────

export const Full: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <PanelCard
        icon={<Icon icon={DocumentOpen} />}
        title="Project Files"
        headerActions={
          <>
            <Button variant="flat" size="sm">Rename</Button>
            <Button variant="flat" size="sm">Delete</Button>
          </>
        }
        footer={
          <Text variant="caption" color="dim">
            Last modified: 2 min ago
          </Text>
        }
        footerActions={
          <Button variant="suggested" size="sm">
            Save
          </Button>
        }
      >
        <Text variant="body" color="dim">
          All four zones are populated: header icon, title, header actions,
          body content, footer feedback, and footer actions.
        </Text>
      </PanelCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "All four zones populated: icon, title, header actions, body, footer feedback, and footer actions.",
      },
    },
  },
};

// ─── DefaultCollapsed ─────────────────────────────────────────────────────────

export const DefaultCollapsed: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <PanelCard
        title="Collapsed by default"
        icon={<Icon icon={Settings} />}
        defaultExpanded={false}
        footer={<Text variant="caption" color="dim">Ready</Text>}
      >
        <Text variant="body">This content starts hidden.</Text>
      </PanelCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`defaultExpanded={false}` starts the panel collapsed. Click the chevron to reveal the body.",
      },
    },
  },
};

// ─── WithoutFooter ────────────────────────────────────────────────────────────

export const WithoutFooter: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <PanelCard
        icon={<Icon icon={Star} />}
        title="Starred Items"
        headerActions={<Button variant="flat" size="sm">Edit</Button>}
      >
        <Text variant="body" color="dim">
          No footer zone — omit both `footer` and `footerActions` and the
          footer bar is not rendered.
        </Text>
      </PanelCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "When neither `footer` nor `footerActions` is provided the footer bar is not rendered.",
      },
    },
  },
};

// ─── NonCollapsible ───────────────────────────────────────────────────────────

export const NonCollapsible: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <PanelCard
        title="Always visible"
        collapsible={false}
        footer={<Text variant="caption" color="dim">Read-only panel</Text>}
      >
        <Text variant="body" color="dim">
          `collapsible={false}` hides the chevron toggle — the body is always
          visible.
        </Text>
      </PanelCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`collapsible={false}` removes the chevron and locks the panel open.",
      },
    },
  },
};

// ─── ImperativeControl ────────────────────────────────────────────────────────

export const ImperativeControl: Story = {
  render: function ImperativeControlStory() {
    const ref = useRef<PanelCardHandle>(null);
    const [log, setLog] = useState<string[]>([]);

    const push = (msg: string) =>
      setLog((prev) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...prev.slice(0, 4)]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 480 }}>
        {/* External controls */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="flat"
            onClick={() => {
              ref.current?.expand();
              push("expand()");
            }}
          >
            Expand
          </Button>
          <Button
            variant="flat"
            onClick={() => {
              ref.current?.collapse();
              push("collapse()");
            }}
          >
            Collapse
          </Button>
          <Button
            variant="suggested"
            onClick={() => {
              ref.current?.toggle();
              push("toggle()");
            }}
          >
            Toggle
          </Button>
        </div>

        <PanelCard
          ref={ref}
          icon={<Icon icon={Information} />}
          title="Imperatively controlled"
          onExpandedChange={(open) => push(`onExpandedChange(${open})`)}
          footer={
            <Text variant="caption" color="dim">
              {log[0] ?? "No events yet"}
            </Text>
          }
        >
          <Text variant="body" color="dim">
            The buttons above call <code>ref.current?.expand()</code>,{" "}
            <code>collapse()</code>, and <code>toggle()</code>. The
            `onExpandedChange` callback logs each state transition in the
            footer.
          </Text>
        </PanelCard>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "External buttons drive the panel via `ref.current.expand/collapse/toggle()`. " +
          "`onExpandedChange` fires on every transition and is displayed in the footer.",
      },
    },
  },
};

// ─── WithBadgeInFooter ────────────────────────────────────────────────────────

export const WithBadgeInFooter: Story = {
  render: () => (
    <div style={{ width: 440 }}>
      <PanelCard
        icon={<Icon icon={Information} />}
        title="Notifications"
        footer={
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Badge variant="accent">3 new</Badge>
            <Text variant="caption" color="dim">Last checked just now</Text>
          </div>
        }
        footerActions={
          <>
            <Button variant="flat" size="sm">Dismiss</Button>
            <Button variant="suggested" size="sm">View all</Button>
          </>
        }
      >
        <Text variant="body" color="dim">
          The `footer` slot accepts any ReactNode — here a `Badge` combined
          with a caption provides rich feedback at a glance.
        </Text>
      </PanelCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The `footer` slot accepts any `ReactNode` — use `Badge`, `Spinner`, or rich markup for contextual feedback.",
      },
    },
  },
};
