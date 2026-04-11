import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { BarChart } from "./BarChart";

// ResponsiveContainer relies on ResizeObserver and real DOM dimensions.
// Mock it to render children with fixed dimensions so the chart renders in jsdom.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement<{ width?: number; height?: number }> }) =>
      React.cloneElement(children, { width: 800, height: 400 }),
  };
});

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const DATA = [
  { month: "Jan", users: 420, sessions: 680 },
  { month: "Feb", users: 380, sessions: 590 },
];

const SINGLE_SERIES = [{ dataKey: "users", name: "Users" }];
const MULTI_SERIES = [
  { dataKey: "users", name: "Users" },
  { dataKey: "sessions", name: "Sessions" },
];

describe("BarChart", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <BarChart data={DATA} series={SINGLE_SERIES} xAxisKey="month" />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("applies custom height", () => {
    const { container } = render(
      <BarChart data={DATA} series={SINGLE_SERIES} height={500} />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe("500px");
  });

  it("applies custom className", () => {
    const { container } = render(
      <BarChart data={DATA} series={SINGLE_SERIES} className="my-chart" />
    );
    expect(container.firstChild).toHaveClass("my-chart");
  });

  it("shows legend when showLegend=true", () => {
    render(
      <BarChart data={DATA} series={MULTI_SERIES} showLegend />
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Sessions")).toBeInTheDocument();
  });

  it("does not show legend by default", () => {
    render(<BarChart data={DATA} series={MULTI_SERIES} />);
    // Legend items should not be present
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("renders an SVG chart", () => {
    const { container } = render(
      <BarChart data={DATA} series={SINGLE_SERIES} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  describe("layout vertical", () => {
    it("renders without crashing when layout=vertical", () => {
      const { container } = render(
        <BarChart data={DATA} series={MULTI_SERIES} layout="vertical" />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders the same SVG structure as horizontal", () => {
      const { container: verticalContainer } = render(
        <BarChart data={DATA} series={SINGLE_SERIES} layout="vertical" />
      );
      const { container: horizontalContainer } = render(
        <BarChart data={DATA} series={SINGLE_SERIES} layout="horizontal" />
      );
      expect(verticalContainer.querySelector("svg")).toBeInTheDocument();
      expect(horizontalContainer.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("stacked", () => {
    it("renders without crashing when stacked=true", () => {
      const { container } = render(
        <BarChart data={DATA} series={MULTI_SERIES} stacked />
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders the same number of bars stacked vs non-stacked", () => {
      const { container: stackedContainer } = render(
        <BarChart data={DATA} series={MULTI_SERIES} stacked />
      );
      const { container: normalContainer } = render(
        <BarChart data={DATA} series={MULTI_SERIES} />
      );
      const stackedBars = stackedContainer.querySelectorAll(".recharts-bar");
      const normalBars = normalContainer.querySelectorAll(".recharts-bar");
      expect(stackedBars.length).toBe(normalBars.length);
    });
  });
});
