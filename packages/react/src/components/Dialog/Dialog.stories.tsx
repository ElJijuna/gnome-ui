import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./Dialog";
import { Button } from "../Button";
import { Text } from "../Text";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Blocking modal dialog following the Adwaita \`AdwDialog\` / \`AdwAlertDialog\` pattern.

### Guidelines
- Use for actions that require confirmation before proceeding (delete, discard, sign out).
- Keep the title short — a noun or verb phrase, no period.
- Body text is optional — omit it for simple confirmations.
- Provide at most one \`suggested\` or \`destructive\` button.
- Always include a cancel/dismiss path (Cancel button or Escape key).
- Do not use for complex forms — open a full page instead.
- Focus is trapped inside while open; Escape and backdrop click call \`onClose\`.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dialog>;

// ─── Alert (confirm destructive) ──────────────────────────────────────────────

export const AlertDialog: Story = {
  render: function AlertStory() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    return (
      <>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            Delete file
          </Button>
          {result && (
            <Text variant="caption" color="dim">{result}</Text>
          )}
        </div>
        <Dialog
          open={open}
          title="Delete File?"
          buttons={[
            {
              label: "Cancel",
              onClick: () => { setOpen(false); setResult("Cancelled"); },
            },
            {
              label: "Delete",
              variant: "destructive",
              onClick: () => { setOpen(false); setResult("Deleted"); },
            },
          ]}
          onClose={() => { setOpen(false); setResult("Dismissed"); }}
        />
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Confirmation dialog for a destructive action. Cancel is always the safe default.",
      },
    },
  },
};

// ─── With body text ───────────────────────────────────────────────────────────

export const WithBody: Story = {
  render: function WithBodyStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Discard changes</Button>
        <Dialog
          open={open}
          title="Discard Changes?"
          buttons={[
            { label: "Cancel",  onClick: () => setOpen(false) },
            { label: "Discard", variant: "destructive", onClick: () => setOpen(false) },
          ]}
          onClose={() => setOpen(false)}
        >
          All unsaved changes will be permanently lost. This action cannot be undone.
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
  },
};

// ─── Informational ────────────────────────────────────────────────────────────

export const Informational: Story = {
  render: function InfoStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>About this app</Button>
        <Dialog
          open={open}
          title="About Files"
          buttons={[
            { label: "Close", variant: "suggested", onClick: () => setOpen(false) },
          ]}
          onClose={() => setOpen(false)}
        >
          Files is a file manager for the GNOME desktop.
          Version 45.0 · Licensed under GPL-3.0.
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Single-button informational dialog. The suggested variant highlights the primary close action.",
      },
    },
  },
};

// ─── Multiple buttons ─────────────────────────────────────────────────────────

export const MultipleButtons: Story = {
  render: function MultiStory() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const close = (r: string) => { setOpen(false); setResult(r); };

    return (
      <>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button onClick={() => setOpen(true)}>Close document</Button>
          {result && (
            <Text variant="caption" color="dim">Chose: {result}</Text>
          )}
        </div>
        <Dialog
          open={open}
          title="Save Changes?"
          buttons={[
            { label: "Cancel",           onClick: () => close("Cancel") },
            { label: "Discard",          variant: "destructive", onClick: () => close("Discard") },
            { label: "Save",             variant: "suggested",   onClick: () => close("Save") },
          ]}
          onClose={() => close("Dismissed")}
        >
          Do you want to save your changes before closing?
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Three-button dialog: cancel · destructive · suggested. Each button occupies a full-width row.",
      },
    },
  },
};

// ─── No backdrop close ────────────────────────────────────────────────────────

export const NoBackdropClose: Story = {
  render: function NoBackdropStory() {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open strict dialog</Button>
        <Dialog
          open={open}
          title="Action Required"
          closeOnBackdrop={false}
          buttons={[
            { label: "Acknowledge", variant: "suggested", onClick: () => setOpen(false) },
          ]}
          onClose={() => setOpen(false)}
        >
          You must acknowledge this notice to continue. Clicking outside will not close this dialog.
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`closeOnBackdrop={false}` — the user must click a button. Escape still works.",
      },
    },
  },
};
