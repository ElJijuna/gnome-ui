import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RadialBarChart } from "./RadialBarChart";

const DATA = [
  { label: "CPU", value: 72 },
  { label: "Memory", value: 58 },
  { label: "Disk", value: 41 },
];

describe("RadialBarChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<RadialBarChart data={DATA} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(<RadialBarChart data={DATA} height={300} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "300px" });
    });

    it("uses 400px as default height", () => {
      const { container } = render(<RadialBarChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "400px" });
    });
  });

  describe("accessibility", () => {
    it("has role=img on the wrapper", () => {
      const { container } = render(<RadialBarChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates an aria-label that includes each item's label and value", () => {
      const { container } = render(<RadialBarChart data={DATA} />);
      const el = container.querySelector("[role='img']");
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("CPU"));
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("72"));
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("Memory"));
    });

    it("uses the custom aria-label when provided", () => {
      const { container } = render(
        <RadialBarChart data={DATA} aria-label="System resource usage" />,
      );
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        "System resource usage",
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <RadialBarChart data={DATA} className="radial-cls" />,
      );
      expect(container.querySelector("[role='img']")).toHaveClass("radial-cls");
    });
  });

  describe("props", () => {
    it("renders without crashing with showLabels and showLegend", () => {
      const { container } = render(
        <RadialBarChart data={DATA} showLabels showLegend />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with custom innerRadius", () => {
      const { container } = render(
        <RadialBarChart data={DATA} innerRadius="40%" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with per-item custom colors", () => {
      const { container } = render(
        <RadialBarChart
          data={[
            { label: "A", value: 80, color: "#3584e4" },
            { label: "B", value: 50, color: "#2ec27e" },
          ]}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
