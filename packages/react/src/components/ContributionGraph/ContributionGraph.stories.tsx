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
A responsive activity heatmap calendar styled with Adwaita design tokens.
Colour intensity represents activity count per day.

**Guidelines (GNOME HIG):**
- Use inside a \`Card\` to frame the graph on a dashboard or profile page.
- Cells use the named accent colour token family from \`GnomeProvider\`; CSS accent values without token variants fall back to green.
- Cells expand to use available width and narrow layouts show fewer recent weeks before cells become too small.
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

export const LargerCells: Story = {
  args: {
    data: SAMPLE_DATA,
    responsive: false,
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
