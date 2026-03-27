import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ShortcutsDialog } from "./ShortcutsDialog";
import type { ShortcutsSection } from "./ShortcutsDialog";
import { Button } from "../Button";

const meta: Meta<typeof ShortcutsDialog> = {
  title: "Components/ShortcutsDialog",
  component: ShortcutsDialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Modal dialog listing keyboard shortcuts grouped in sections, with integrated search.

Mirrors \`AdwShortcutsDialog\` (libadwaita 1.8 / GNOME 49) — the modern replacement for \`GtkShortcutsWindow\`.

- Search filters across all sections in real time (by description or key name).
- Renders into a portal; traps focus; Escape closes.
- Pass \`sections\` as a plain data array — no JSX needed for the shortcut entries.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ShortcutsDialog>;

const APP_SECTIONS: ShortcutsSection[] = [
  {
    title: "File",
    shortcuts: [
      { keys: ["Ctrl", "N"],       description: "New document" },
      { keys: ["Ctrl", "O"],       description: "Open file" },
      { keys: ["Ctrl", "S"],       description: "Save" },
      { keys: ["Ctrl", "Shift", "S"], description: "Save as…" },
      { keys: ["Ctrl", "W"],       description: "Close tab" },
      { keys: ["Ctrl", "Q"],       description: "Quit" },
    ],
  },
  {
    title: "Edit",
    shortcuts: [
      { keys: ["Ctrl", "Z"],       description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Ctrl", "X"],       description: "Cut" },
      { keys: ["Ctrl", "C"],       description: "Copy" },
      { keys: ["Ctrl", "V"],       description: "Paste" },
      { keys: ["Ctrl", "A"],       description: "Select all" },
      { keys: ["Ctrl", "F"],       description: "Find" },
      { keys: ["Ctrl", "H"],       description: "Find and replace" },
    ],
  },
  {
    title: "View",
    shortcuts: [
      { keys: ["Ctrl", "+"],       description: "Zoom in" },
      { keys: ["Ctrl", "-"],       description: "Zoom out" },
      { keys: ["Ctrl", "0"],       description: "Reset zoom" },
      { keys: ["F11"],             description: "Toggle fullscreen" },
      { keys: ["Ctrl", "\\"],      description: "Toggle sidebar" },
    ],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Alt", "←"],        description: "Go back" },
      { keys: ["Alt", "→"],        description: "Go forward" },
      { keys: ["Alt", "↑"],        description: "Go up" },
      { keys: ["Alt", "Home"],     description: "Go home" },
      { keys: ["Ctrl", "L"],       description: "Focus address bar" },
    ],
  },
];

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Shortcuts</Button>
        <ShortcutsDialog
          open={open}
          onClose={() => setOpen(false)}
          sections={APP_SECTIONS}
        />
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const CustomTitle: Story = {
  render: function CustomTitleStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Shortcuts</Button>
        <ShortcutsDialog
          open={open}
          onClose={() => setOpen(false)}
          title="Text Editor Shortcuts"
          sections={APP_SECTIONS.slice(0, 2)}
        />
      </>
    );
  },
  parameters: { controls: { disable: true } },
};
