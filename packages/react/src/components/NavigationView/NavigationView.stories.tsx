import type { Meta, StoryObj } from "@storybook/react";
import { NavigationView, NavigationPage, useNavigation } from "./NavigationView";
import { Button } from "../Button";
import { Text } from "../Text";
import { BoxedList } from "../BoxedList";
import { ActionRow } from "../ActionRow";

const meta: Meta<typeof NavigationView> = {
  title: "Components/NavigationView",
  component: NavigationView,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Single-pane push/pop navigation stack.

Mirrors \`AdwNavigationView\` — the mobile-first counterpart to \`NavigationSplitView\`.
Compose \`NavigationPage\` children and use \`useNavigation()\` inside them to push/pop pages.

### Usage
- Each \`NavigationPage\` has a unique \`tag\` and a \`title\`.
- Call \`navigate(tag)\` to push a new page onto the stack.
- Call \`pop()\` to go back one page.
- \`canGoBack\` is \`true\` when there is a page to return to.
        `,
      },
    },
  },
  argTypes: {
    initialPage: { control: "text" },
  },
  args: {
    initialPage: "home",
  },
};

export default meta;
type Story = StoryObj<typeof NavigationView>;

// ─── Inner pages (use hook) ────────────────────────────────────────────────────

function HomePage() {
  const { navigate } = useNavigation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text variant="body" color="dim">Select an item to navigate to its detail page.</Text>
      <BoxedList>
        <ActionRow title="Inbox" subtitle="12 unread messages" onClick={() => navigate("inbox")} />
        <ActionRow title="Sent" subtitle="42 messages" onClick={() => navigate("sent")} />
        <ActionRow title="Drafts" subtitle="3 drafts" onClick={() => navigate("drafts")} />
      </BoxedList>
    </div>
  );
}

function DetailPage({ name }: { name: string }) {
  const { pop, canGoBack } = useNavigation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text variant="body" color="dim">Viewing {name}.</Text>
      {canGoBack && (
        <Button variant="flat" onClick={pop} style={{ alignSelf: "flex-start" }}>
          ← Go back
        </Button>
      )}
    </div>
  );
}

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div style={{ height: 400, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
      <NavigationView initialPage="home">
        <NavigationPage tag="home"   title="Mail"><HomePage /></NavigationPage>
        <NavigationPage tag="inbox"  title="Inbox"><DetailPage name="Inbox" /></NavigationPage>
        <NavigationPage tag="sent"   title="Sent"><DetailPage name="Sent" /></NavigationPage>
        <NavigationPage tag="drafts" title="Drafts"><DetailPage name="Drafts" /></NavigationPage>
      </NavigationView>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Click a row to push a new page. Use the back button to pop the stack.",
      },
    },
  },
};

// ─── Deep stack ────────────────────────────────────────────────────────────────

function LevelPage({ level }: { level: number }) {
  const { navigate, pop, canGoBack } = useNavigation();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text variant="body">Level {level}</Text>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="suggested" onClick={() => navigate(`level-${level + 1}`)}>Go deeper</Button>
        {canGoBack && <Button variant="flat" onClick={pop}>← Back</Button>}
      </div>
    </div>
  );
}

export const DeepStack: Story = {
  render: () => (
    <div style={{ height: 320, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden" }}>
      <NavigationView initialPage="level-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <NavigationPage key={n} tag={`level-${n}`} title={`Level ${n}`}>
            <LevelPage level={n} />
          </NavigationPage>
        ))}
      </NavigationView>
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Push multiple levels deep then pop back." },
    },
  },
};
