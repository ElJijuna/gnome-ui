import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Carousel, CarouselIndicatorDots, CarouselIndicatorLines } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Components/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
Swipeable content carousel.

Mirrors \`AdwCarousel\`. Uses CSS scroll-snapping for smooth, native-feeling
page transitions. Supports keyboard navigation (←/→ or ↑/↓), touch, and mouse drag.

Pair with \`CarouselIndicatorDots\` or \`CarouselIndicatorLines\` for pagination UI.

### Guidelines
- Keep page count low (3–6). More pages need a compact indicator like lines.
- Use \`orientation="vertical"\` for feed-style layouts.
- Use \`loop\` for image galleries where wrap-around is expected.
        `,
      },
    },
  },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    loop: { control: "boolean" },
    spacing: { control: "number" },
  },
  args: {
    orientation: "horizontal",
    loop: false,
    spacing: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Carousel>;

const COLORS = ["#3584e4", "#e01b24", "#33d17a", "#ff7800", "#9141ac"];
const LABELS = ["Blue", "Red", "Green", "Orange", "Purple"];

function SlidePlaceholder({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        height: 200,
        background: color,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "1.25rem",
        fontWeight: 700,
        userSelect: "none",
      }}
    >
      {label}
    </div>
  );
}

// ─── With dots ─────────────────────────────────────────────────────────────────

export const WithDots: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    return (
      <div>
        <Carousel page={page} onPageChanged={setPage}>
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <CarouselIndicatorDots
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Horizontal carousel with `CarouselIndicatorDots`. Click dots or use ← → keys." },
    },
  },
};

// ─── With lines ────────────────────────────────────────────────────────────────

export const WithLines: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    return (
      <div>
        <Carousel page={page} onPageChanged={setPage}>
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <CarouselIndicatorLines
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Same carousel with `CarouselIndicatorLines` — preferred for longer decks." },
    },
  },
};

// ─── Vertical ─────────────────────────────────────────────────────────────────

export const Vertical: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Carousel orientation="vertical" page={page} onPageChanged={setPage} style={{ height: 200 }}>
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {COLORS.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              style={{
                width: 3,
                height: 24,
                border: "none",
                borderRadius: 2,
                background: i === page ? "#3584e4" : "rgba(0,0,0,0.2)",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "Vertical orientation — scroll up/down or press ↑ ↓." },
    },
  },
};

// ─── Loop ─────────────────────────────────────────────────────────────────────

export const Loop: Story = {
  render: () => {
    const [page, setPage] = useState(0);
    return (
      <div>
        <Carousel loop page={page} onPageChanged={setPage}>
          {COLORS.map((c, i) => (
            <SlidePlaceholder key={i} label={LABELS[i]} color={c} />
          ))}
        </Carousel>
        <CarouselIndicatorDots
          pages={COLORS.length}
          currentPage={page}
          onPageSelected={setPage}
        />
      </div>
    );
  },
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: "With `loop`: keyboard navigation wraps around on the last/first page." },
    },
  },
};
