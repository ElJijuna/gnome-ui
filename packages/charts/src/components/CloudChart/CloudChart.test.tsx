import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CloudChart } from "./CloudChart";

const DATA = [
  { text: "TypeScript", value: 95 },
  { text: "React", value: 60 },
  { text: "CSS", value: 30 },
];

describe("CloudChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<CloudChart data={DATA} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders a span for each data item", () => {
      render(<CloudChart data={DATA} />);
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("CSS")).toBeInTheDocument();
    });

    it("applies minHeight to the wrapper", () => {
      const { container } = render(<CloudChart data={DATA} height={400} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({
        minHeight: "400px",
      });
    });

    it("uses 300px as default minHeight", () => {
      const { container } = render(<CloudChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({
        minHeight: "300px",
      });
    });
  });

  describe("font size scaling", () => {
    it("gives the highest-value word the largest font size", () => {
      render(<CloudChart data={DATA} minFontSize={12} maxFontSize={48} />);
      const top = screen.getByText("TypeScript");
      const bottom = screen.getByText("CSS");
      const topSize = parseFloat(top.style.fontSize);
      const bottomSize = parseFloat(bottom.style.fontSize);
      expect(topSize).toBeGreaterThan(bottomSize);
    });

    it("applies the max font size to the highest-value word", () => {
      render(<CloudChart data={DATA} minFontSize={12} maxFontSize={48} />);
      expect(parseFloat(screen.getByText("TypeScript").style.fontSize)).toBe(48);
    });

    it("applies the min font size to the lowest-value word", () => {
      render(<CloudChart data={DATA} minFontSize={12} maxFontSize={48} />);
      expect(parseFloat(screen.getByText("CSS").style.fontSize)).toBe(12);
    });

    it("applies the midpoint font size when all values are equal", () => {
      const equalData = [
        { text: "A", value: 5 },
        { text: "B", value: 5 },
      ];
      render(<CloudChart data={equalData} minFontSize={10} maxFontSize={50} />);
      expect(parseFloat(screen.getByText("A").style.fontSize)).toBe(30);
    });
  });

  describe("accessibility", () => {
    it("has role=img on the wrapper", () => {
      const { container } = render(<CloudChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates a default aria-label with item count", () => {
      const { container } = render(<CloudChart data={DATA} />);
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        "Word cloud with 3 terms",
      );
    });

    it("uses a custom aria-label when provided", () => {
      const { container } = render(
        <CloudChart data={DATA} aria-label="Technology popularity" />,
      );
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        "Technology popularity",
      );
    });

    it("adds aria-label with value to each word span", () => {
      render(<CloudChart data={DATA} />);
      expect(screen.getByText("TypeScript")).toHaveAttribute(
        "aria-label",
        "TypeScript 95",
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper", () => {
      const { container } = render(<CloudChart data={DATA} className="my-cloud" />);
      expect(container.querySelector("[role='img']")).toHaveClass("my-cloud");
    });
  });

  describe("custom colors", () => {
    it("applies per-item color override", () => {
      render(
        <CloudChart
          data={[{ text: "Rust", value: 50, color: "#ff0000" }]}
        />,
      );
      expect(screen.getByText("Rust")).toHaveStyle({ color: "#ff0000" });
    });
  });
});
