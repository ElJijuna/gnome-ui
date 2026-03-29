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
Blocking modal dialog — three modes in one component.

**Standard** — \`title\` + \`children\` + \`buttons[]\`.

**Alert** (\`role="alertdialog"\` + \`responses[]\` + \`onResponse\`) — for confirmations
and destructive-action warnings. Screen readers announce it immediately.
Escape / backdrop fire the first non-destructive response. Mirrors \`AdwAlertDialog\`.

**About** (\`variant="about"\` + \`applicationName\` + info props) — standard app info
dialog with details, credits, and legal tabs. Mirrors \`AdwAboutDialog\`.

All modes share the same portal, focus-trap, and card/backdrop styles.
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

// ─── Alert — destructive confirmation ─────────────────────────────────────────

export const AlertDestructive: Story = {
  render: function AlertStory() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    return (
      <>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button variant="destructive" onClick={() => setOpen(true)}>Delete file…</Button>
          {result && <Text variant="caption" color="dim">Response: <strong>{result}</strong></Text>}
        </div>
        <Dialog
          open={open}
          role="alertdialog"
          title="Delete File?"
          responses={[
            { id: "cancel", label: "Cancel",  variant: "default" },
            { id: "delete", label: "Delete",  variant: "destructive" },
          ]}
          onResponse={(id) => { setResult(id); setOpen(false); }}
        >
          The file will be permanently deleted and cannot be recovered.
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`role=\"alertdialog\"` + `responses` + `onResponse`. Escape fires the non-destructive response.",
      },
    },
  },
};

// ─── Alert — save changes ──────────────────────────────────────────────────────

export const AlertSaveChanges: Story = {
  render: function SaveStory() {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    return (
      <>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Button onClick={() => setOpen(true)}>Close document…</Button>
          {result && <Text variant="caption" color="dim">Response: <strong>{result}</strong></Text>}
        </div>
        <Dialog
          open={open}
          role="alertdialog"
          title="Save Changes?"
          responses={[
            { id: "discard", label: "Discard", variant: "destructive" },
            { id: "cancel",  label: "Cancel",  variant: "default" },
            { id: "save",    label: "Save",    variant: "suggested" },
          ]}
          onResponse={(id) => { setResult(id); setOpen(false); }}
        >
          If you close without saving, your changes will be lost.
        </Dialog>
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Three-response alert: destructive · cancel · suggested." },
    },
  },
};

// ─── About ────────────────────────────────────────────────────────────────────

export const About: Story = {
  render: function AboutStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>About Files</Button>
        <Dialog
          open={open}
          variant="about"
          applicationName="Files"
          version="45.0"
          comments="A file manager for the GNOME desktop."
          developerName="GNOME Project"
          website="https://apps.gnome.org/Nautilus/"
          websiteLabel="Files on GNOME Apps"
          developers={["Carlos Soriano", "António Fernandes", "Corey Berla"]}
          designers={["Allan Day", "Jakub Steiner"]}
          copyright="© 2024 The GNOME Project"
          licenseType="GPL-3.0-or-later"
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "`variant=\"about\"` renders app name, version, details, and Credits / Legal tabs.",
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
