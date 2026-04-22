import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AboutDialog } from "./AboutDialog";
import { Button } from "../Button";

const meta: Meta<typeof AboutDialog> = {
  title: "Components/AboutDialog",
  component: AboutDialog,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Standard app info dialog with details, credits, and legal tabs.
Mirrors \`AdwAboutDialog\`.

Provide \`applicationName\` plus any combination of \`version\`, \`comments\`,
\`developerName\`, \`website\`, \`developers\`, \`designers\`, \`artists\`,
\`copyright\`, \`licenseType\`, and \`licenseText\`.
Credits and Legal tabs appear automatically when their content is supplied.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AboutDialog>;

export const Default: Story = {
  render: function DefaultStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>About Files</Button>
        <AboutDialog
          open={open}
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
        story: "Full about dialog with Details, Credits, and Legal tabs.",
      },
    },
  },
};

export const DetailsOnly: Story = {
  render: function DetailsOnlyStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>About App</Button>
        <AboutDialog
          open={open}
          applicationName="My App"
          version="1.0.0"
          comments="A simple application."
          developerName="Jane Smith"
          onClose={() => setOpen(false)}
        />
      </>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: "Only the Details tab is shown — no credits or legal content supplied.",
      },
    },
  },
};
