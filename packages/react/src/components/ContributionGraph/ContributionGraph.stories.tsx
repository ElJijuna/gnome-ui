import type { Meta, StoryObj } from "@storybook/react";
import { ContributionGraph } from "./ContributionGraph";
import type { ContributionDay } from "./ContributionGraph";

const meta: Meta<typeof ContributionGraph> = {
  title: "Data Display/ContributionGraph",
  component: ContributionGraph,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A 52-week activity heatmap calendar styled with Adwaita design tokens.
Colour intensity (Adwaita green palette) represents activity count per day.

**Guidelines (GNOME HIG):**
- Use inside a \`Card\` to frame the graph on a dashboard or profile page.
- The default green scale follows the Adwaita success/positive colour meaning.
- Dark mode is handled automatically via CSS custom properties — no extra configuration needed.
- Keyboard users can navigate every cell with arrow keys (\`role="grid"\`).
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContributionGraph>;

function generateData(days = 365): ContributionDay[] {
  const result: ContributionDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Use a simple deterministic pattern so the story is stable across renders
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    // ~40 % of days have activity; count varies by weekday and week
    const seed = (i * 7 + i % 13) % 10;
    if (seed > 5) {
      result.push({ date: iso, count: (seed * 3) % 14 + 1 });
    }
  }
  return result;
}

const SAMPLE_DATA = generateData(365);

export const Default: Story = {
  args: {
    data: SAMPLE_DATA,
  },
};

export const SundayStart: Story = {
  args: {
    data: SAMPLE_DATA,
    weekStartDay: 0,
  },
  parameters: {
    docs: {
      description: { story: "Week columns start on Sunday instead of Monday." },
    },
  },
};

export const CustomColors: Story = {
  args: {
    data: SAMPLE_DATA,
    colorScale: [
      "var(--gnome-card-shade-color, rgba(0,0,0,0.07))",
      "var(--gnome-blue-1, #99c1f1)",
      "var(--gnome-blue-2, #62a0ea)",
      "var(--gnome-blue-3, #3584e4)",
      "var(--gnome-blue-4, #1c71d8)",
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom `colorScale` using the Adwaita blue palette — useful when green implies a different meaning in context.",
      },
    },
  },
};

export const LargerCells: Story = {
  args: {
    data: SAMPLE_DATA,
    cellSize: 16,
    cellGap: 4,
  },
  parameters: {
    docs: {
      description: {
        story: "Larger cells for touch-friendly or high-density displays.",
      },
    },
  },
};

export const NoLabels: Story = {
  args: {
    data: SAMPLE_DATA,
    showMonthLabels: false,
    showDayLabels: false,
    showLegend: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All labels hidden — suitable for compact inline usage where surrounding context provides the date range.",
      },
    },
  },
};

export const WithClickHandler: Story = {
  args: {
    data: SAMPLE_DATA,
    onDayClick: (day) => alert(`${day.count} contributions on ${day.date}`),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pass `onDayClick` to make cells interactive. Keyboard users can activate cells with Enter or Space.",
      },
    },
  },
};
