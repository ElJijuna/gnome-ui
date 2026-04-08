import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Bottom bar with leading/trailing slots and optional center content.

Mirrors the \`HeaderBar\` pattern at the bottom of a view or window.

### Guidelines
- Use **flat** buttons (\`variant="flat"\`) for actions inside the footer.
- Keep content minimal — copyright, secondary links, status info.
- Place primary info (copyright, version) on the **leading** side.
- Place secondary actions (links, settings) on the **trailing** side.
- Use \`flat\` when the footer is visually separated from content by another boundary.
        `,
      },
    },
  },
  argTypes: {
    flat: { control: "boolean" },
  },
  args: {
    flat: false,
  },
};

export default meta;
type Story = StoryObj<typeof Footer>;

// ─── Default ───────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    start: <Text variant="caption">© 2024 GNOME Foundation</Text>,
  },
};

// ─── With links ────────────────────────────────────────────────────────────────

export const WithLinks: Story = {
  args: {
    start: <Text variant="caption">© 2024 GNOME Foundation</Text>,
    end: (
      <>
        <a href="#">Privacy</a>
        <a href="#">License</a>
        <a href="#">Contact</a>
      </>
    ),
  },
};

// ─── With center content ───────────────────────────────────────────────────────

export const WithCenter: Story = {
  args: {
    start: <Text variant="caption">v1.0.0</Text>,
    children: <Text variant="caption">Made with GNOME UI</Text>,
    end: <a href="#">Docs</a>,
  },
  parameters: {
    docs: {
      description: {
        story: "Use `children` for centered content alongside the leading/trailing slots.",
      },
    },
  },
};

// ─── With actions ─────────────────────────────────────────────────────────────

export const WithActions: Story = {
  args: {
    start: <Text variant="caption">© 2024 GNOME Foundation</Text>,
    end: (
      <>
        <Button variant="flat" size="sm">Help</Button>
        <Button variant="flat" size="sm">About</Button>
      </>
    ),
  },
};

// ─── Flat variant ─────────────────────────────────────────────────────────────

export const Flat: Story = {
  args: {
    flat: true,
    start: <Text variant="caption">© 2024 GNOME Foundation</Text>,
    end: <a href="#">License</a>,
  },
  parameters: {
    docs: {
      description: {
        story: "Use `flat` to remove the top border when the footer is visually separated by another element.",
      },
    },
  },
};

// ─── In a full layout ─────────────────────────────────────────────────────────

export const InLayout: Story = {
  render: () => (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: 480,
      }}
    >
      <div style={{ padding: 24, fontFamily: "sans-serif", opacity: 0.4, minHeight: 120 }}>
        View content area
      </div>
      <Footer
        start={<Text variant="caption">© 2024 GNOME Foundation</Text>}
        end={
          <>
            <a href="#">Privacy</a>
            <a href="#">License</a>
          </>
        }
      />
    </div>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "The footer sits at the bottom of a view, spanning its full width.",
      },
    },
  },
};
