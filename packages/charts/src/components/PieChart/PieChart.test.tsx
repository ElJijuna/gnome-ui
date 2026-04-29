import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PieChart } from "./PieChart";

const DATA = [
  { label: "Chrome", value: 62 },
  { label: "Firefox", value: 18 },
  { label: "Safari", value: 11 },
];

describe("PieChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<PieChart data={DATA} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(<PieChart data={DATA} height={300} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "300px" });
    });

    it("uses 400px as default height", () => {
      const { container } = render(<PieChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "400px" });
    });
  });

  describe("accessibility", () => {
    it("has role=img on the wrapper", () => {
      const { container } = render(<PieChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates an aria-label that includes each item's label and value", () => {
      const { container } = render(<PieChart data={DATA} />);
      const el = container.querySelector("[role='img']");
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("Chrome"));
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("62"));
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("Firefox"));
    });

    it("uses the custom aria-label when provided", () => {
      const { container } = render(
        <PieChart data={DATA} aria-label="Browser market share" />,
      );
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        "Browser market share",
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(<PieChart data={DATA} className="pie-cls" />);
      expect(container.querySelector("[role='img']")).toHaveClass("pie-cls");
    });
  });

  describe("props", () => {
    it("renders without crashing in donut mode", () => {
      const { container } = render(<PieChart data={DATA} donut />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with showLabels and showLegend", () => {
      const { container } = render(
        <PieChart data={DATA} showLabels showLegend />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
