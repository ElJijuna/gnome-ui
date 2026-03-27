import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "./Text";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Typography component mirroring all [Adwaita text style classes](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/style-classes.html).

### Variants

| Variant | Element | Use case |
|---------|---------|----------|
| \`large-title\` | \`h1\` | Display heading with lots of whitespace |
| \`title-1\` | \`h1\` | Primary page/view title |
| \`title-2\` | \`h2\` | Section title |
| \`title-3\` | \`h3\` | Sub-section title |
| \`title-4\` | \`h4\` | Minor heading |
| \`heading\` | \`h3\` | UI labels, boxed list headers |
| \`body\` | \`p\` | Default UI text, descriptions |
| \`document\` | \`p\` | Reading content (chat, articles) |
| \`caption\` | \`span\` | Sub-text, metadata |
| \`caption-heading\` | \`span\` | Small group labels (uppercase) |
| \`monospace\` | \`code\` | Code, logs, shell commands |
| \`numeric\` | \`span\` | Aligned numbers, counters |

Use the \`as\` prop to override the rendered HTML element without changing the visual style.
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "large-title",
        "title-1",
        "title-2",
        "title-3",
        "title-4",
        "heading",
        "body",
        "document",
        "caption",
        "caption-heading",
        "monospace",
        "numeric",
      ],
    },
    color: {
      control: "select",
      options: ["default", "dim", "accent", "destructive", "success", "warning", "error"],
    },
    children: { control: "text" },
  },
  args: {
    variant: "body",
    color: "default",
    children: "The quick brown fox jumps over the lazy dog",
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

// ─── Playground ───────────────────────────────────────────────────────────────

export const Playground: Story = {};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px" }}>
      <Text variant="large-title">Large Title</Text>
      <Text variant="title-1">Title 1</Text>
      <Text variant="title-2">Title 2</Text>
      <Text variant="title-3">Title 3</Text>
      <Text variant="title-4">Title 4</Text>
      <Text variant="heading">Heading</Text>
      <Text variant="body">Body — The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="document">Document — Longer reading content with slightly more line height for comfortable reading of paragraphs.</Text>
      <Text variant="caption">Caption — supplementary text</Text>
      <Text variant="caption-heading">Caption Heading</Text>
      <Text variant="monospace">monospace: console.log("hello world")</Text>
      <Text variant="numeric">1,234,567.89</Text>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Colors ───────────────────────────────────────────────────────────────────

export const Colors: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Text variant="body" color="default">Default</Text>
      <Text variant="body" color="dim">Dim — secondary information</Text>
      <Text variant="body" color="accent">Accent — interactive or highlighted</Text>
      <Text variant="body" color="destructive">Destructive — danger or error action</Text>
      <Text variant="body" color="success">Success — positive outcome</Text>
      <Text variant="body" color="warning">Warning — cautionary state</Text>
      <Text variant="body" color="error">Error — problem state</Text>
    </div>
  ),
  parameters: { controls: { disable: true } },
};

// ─── Polymorphic `as` prop ────────────────────────────────────────────────────

export const PolymorphicAs: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Text variant="body" as="span">body rendered as &lt;span&gt; (inline)</Text>
      <Text variant="title-1" as="h2">title-1 rendered as &lt;h2&gt; (semantic override)</Text>
      <Text variant="caption" color="dim" as="label">caption rendered as &lt;label&gt;</Text>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Use `as` to override the HTML element without changing the visual style. Useful for correct document semantics.",
      },
    },
  },
};
