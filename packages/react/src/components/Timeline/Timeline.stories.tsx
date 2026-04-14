import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { Text } from "../Text";
import { Card } from "../Card";
import {
  Check,
  Edit,
  Share,
  DocumentOpen,
  Delete,
  Information,
  Add,
  GoNext,
} from "@gnome-ui/icons";
import { Timeline } from "./Timeline";
import type { TimelineItem } from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Ordered sequence of events connected by a visual timeline.

Supports two orientations — **vertical** (activity feed, history log) and
**horizontal** (stepper, progress indicator) — and three connector styles.

\`\`\`tsx
import { Timeline } from "@gnome-ui/react";

<Timeline
  items={[
    {
      leading: <Text variant="caption" color="dim">10:32</Text>,
      icon: <Icon icon={Check} />,
      content: <Text variant="body">Document approved</Text>,
    },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

// ─── Shared sample data ───────────────────────────────────────────────────────

const activityItems: TimelineItem[] = [
  {
    leading: <Text variant="caption" color="dim" style={{ whiteSpace: "nowrap" }}>10:32</Text>,
    icon: <Icon icon={DocumentOpen} size="sm" />,
    content: (
      <div>
        <Text variant="body">Document created</Text>
        <Text variant="caption" color="dim">Ada uploaded "report.pdf"</Text>
      </div>
    ),
  },
  {
    leading: <Text variant="caption" color="dim" style={{ whiteSpace: "nowrap" }}>10:45</Text>,
    icon: <Icon icon={Edit} size="sm" />,
    content: (
      <div>
        <Text variant="body">Edited</Text>
        <Text variant="caption" color="dim">3 changes in section 2</Text>
      </div>
    ),
  },
  {
    leading: <Text variant="caption" color="dim" style={{ whiteSpace: "nowrap" }}>11:02</Text>,
    icon: <Icon icon={Share} size="sm" />,
    content: (
      <div>
        <Text variant="body">Shared</Text>
        <Text variant="caption" color="dim">Sent to review team</Text>
      </div>
    ),
  },
  {
    leading: (
      <Text variant="caption" color="dim" style={{ whiteSpace: "nowrap" }}>
        11:30
      </Text>
    ),
    icon: <Icon icon={Check} size="sm" />,
    content: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Text variant="body">Approved</Text>
        <Badge variant="accent">Today</Badge>
      </div>
    ),
  },
];

const stepperItems: TimelineItem[] = [
  {
    icon: <Icon icon={Check} size="sm" />,
    content: <Text variant="caption">Account</Text>,
  },
  {
    icon: <Icon icon={Check} size="sm" />,
    content: <Text variant="caption">Profile</Text>,
  },
  {
    icon: <Icon icon={Information} size="sm" />,
    content: <Text variant="caption" style={{ fontWeight: 600 }}>Review</Text>,
  },
  {
    content: <Text variant="caption" color="dim">Done</Text>,
  },
];

// ─── Vertical (default) ───────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => (
    <Card style={{ width: 360, padding: "16px 20px" }}>
      <Timeline items={activityItems} />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Default vertical orientation — ideal for activity feeds, file history, and audit logs.",
      },
    },
  },
};

// ─── Vertical dotted ──────────────────────────────────────────────────────────

export const VerticalDotted: Story = {
  render: () => (
    <Card style={{ width: 360, padding: "16px 20px" }}>
      <Timeline
        items={[
          ...activityItems.slice(0, 2),
          {
            leading: <Text variant="caption" color="dim">Soon</Text>,
            icon: <Icon icon={GoNext} size="sm" />,
            content: (
              <div>
                <Text variant="body" color="dim">Pending review</Text>
                <Text variant="caption" color="dim">Waiting for approval</Text>
              </div>
            ),
          },
          {
            leading: <Text variant="caption" color="dim">Future</Text>,
            content: (
              <Text variant="body" color="dim">Archive</Text>
            ),
          },
        ]}
        variant="dotted"
      />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`variant=\"dotted\"` — use for pending or future events that haven't happened yet.",
      },
    },
  },
};

// ─── Vertical no connector ────────────────────────────────────────────────────

export const VerticalNoConnector: Story = {
  render: () => (
    <Card style={{ width: 360, padding: "16px 20px" }}>
      <Timeline items={activityItems} variant="none" />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "`variant=\"none\"` — nodes stand alone without a connecting line.",
      },
    },
  },
};

// ─── Vertical no leading ──────────────────────────────────────────────────────

export const VerticalNoLeading: Story = {
  render: () => (
    <Card style={{ width: 320, padding: "16px 20px" }}>
      <Timeline
        items={[
          { icon: <Icon icon={Add} size="sm" />, content: <Text variant="body">Item created</Text> },
          { icon: <Icon icon={Edit} size="sm" />, content: <Text variant="body">Item updated</Text> },
          { icon: <Icon icon={Delete} size="sm" />, content: <Text variant="body">Item deleted</Text> },
        ]}
      />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When `leading` is omitted the layout collapses to two columns: node track + content.",
      },
    },
  },
};

// ─── Horizontal stepper ───────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Timeline items={stepperItems} orientation="horizontal" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`orientation=\"horizontal\"` — stepper / progress pattern. Items stretch equally across the container.",
      },
    },
  },
};

// ─── Horizontal dotted ────────────────────────────────────────────────────────

export const HorizontalDotted: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Timeline
        items={stepperItems}
        orientation="horizontal"
        variant="dotted"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Horizontal stepper with dotted connectors for pending steps.",
      },
    },
  },
};

// ─── Horizontal with leading ──────────────────────────────────────────────────

export const HorizontalWithLeading: Story = {
  render: () => (
    <div style={{ width: 520 }}>
      <Timeline
        orientation="horizontal"
        items={[
          {
            leading: <Badge variant="success">Done</Badge>,
            icon: <Icon icon={Check} size="sm" />,
            content: <Text variant="caption">Create account</Text>,
          },
          {
            leading: <Badge variant="success">Done</Badge>,
            icon: <Icon icon={Check} size="sm" />,
            content: <Text variant="caption">Verify email</Text>,
          },
          {
            leading: <Badge variant="accent">Active</Badge>,
            icon: <Icon icon={Information} size="sm" />,
            content: <Text variant="caption" style={{ fontWeight: 600 }}>Setup profile</Text>,
          },
          {
            leading: <Badge>Pending</Badge>,
            content: <Text variant="caption" color="dim">Invite team</Text>,
          },
        ]}
        variant="dotted"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal with `leading` showing status badges above each node — ideal for onboarding flows.",
      },
    },
  },
};

// ─── Minimal (no icons, no leading) ──────────────────────────────────────────

export const Minimal: Story = {
  render: () => (
    <Card style={{ width: 280, padding: "16px 20px" }}>
      <Timeline
        items={[
          { content: <Text variant="body">First step completed</Text> },
          { content: <Text variant="body">Review in progress</Text> },
          { content: <Text variant="body" color="dim">Awaiting sign-off</Text> },
        ]}
      />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Minimal usage — only `content` is required per item.",
      },
    },
  },
};
