import type { Meta, StoryObj } from "@storybook/react";
import { CountDownTimer } from "./CountDownTimer";

const meta: Meta<typeof CountDownTimer> = {
    title: "Components/CountDownTimer",
    component: CountDownTimer,
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
Displays a countdown timer showing the remaining time until a specified end date.

### Guidelines
- Use \`format="time"\` to display countdown in HH:MM:SS format.
- Use \`format="date"\` to display the target end date.
- Provide an \`action\` callback that executes when the countdown reaches zero.
- Choose the \`variant\` that matches the urgency: \`accent\` → neutral, \`success\` → positive, \`warning\` → caution, \`destructive\` → urgent.
- The component automatically switches to destructive styling when time runs out.
        `,
            },
        },
    },
    argTypes: {
        start: { control: "date" },
        end: { control: "date" },
        format: { control: "select", options: ["time", "date", "datetime"] },
        variant: { control: "select", options: ["accent", "success", "warning", "destructive"] },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Get dates for examples
const now = new Date();
const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

export const Default: Story = {
    args: {
        start: now,
        end: endTime,
        format: "time",
        variant: "accent",
    },
};

export const DateFormat: Story = {
    args: {
        start: now,
        end: endTime,
        format: "date",
        variant: "accent",
    },
};

export const DateTimeFormat: Story = {
    args: {
        start: now,
        end: endTime,
        format: "datetime",
        variant: "accent",
    },
};

export const SuccessVariant: Story = {
    args: {
        start: now,
        end: endTime,
        format: "time",
        variant: "success",
    },
};

export const WarningVariant: Story = {
    args: {
        start: now,
        end: new Date(now.getTime() + 5 * 60 * 1000), // 5 minutes
        format: "time",
        variant: "warning",
    },
};

export const LongCountdown: Story = {
    args: {
        start: now,
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours
        format: "time",
        variant: "accent",
    },
};

export const WithCallback: Story = {
    args: {
        start: now,
        end: endTime,
        format: "time",
        variant: "accent",
        action: () => {
            console.log("Countdown finished!");
        },
    },
};
