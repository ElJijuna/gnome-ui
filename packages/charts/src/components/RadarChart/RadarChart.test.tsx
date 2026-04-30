import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { RadarChart } from "./RadarChart";

const DATA = [
  { skill: "TypeScript", alice: 90, bob: 70 },
  { skill: "React", alice: 85, bob: 80 },
  { skill: "CSS", alice: 60, bob: 75 },
];
const SERIES = [{ dataKey: "alice", name: "Alice" }];

describe("RadarChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(
        <RadarChart data={DATA} series={SERIES} angleKey="skill" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(
        <RadarChart data={DATA} series={SERIES} height={350} />,
      );
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "350px" });
    });

    it("uses 400px as default height", () => {
      const { container } = render(<RadarChart data={DATA} series={SERIES} />);
      expect(container.querySelector("[role='img']")).toHaveStyle({ height: "400px" });
    });
  });

  describe("accessibility", () => {
    it("has role=img on the wrapper", () => {
      const { container } = render(<RadarChart data={DATA} series={SERIES} />);
      expect(container.querySelector("[role='img']")).toBeInTheDocument();
    });

    it("generates an aria-label that includes each series name", () => {
      const { container } = render(
        <RadarChart
          data={DATA}
          series={[
            { dataKey: "alice", name: "Alice" },
            { dataKey: "bob", name: "Bob" },
          ]}
        />,
      );
      const el = container.querySelector("[role='img']");
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("Alice"));
      expect(el).toHaveAttribute("aria-label", expect.stringContaining("Bob"));
    });

    it("falls back to dataKey in aria-label when name is omitted", () => {
      const { container } = render(
        <RadarChart data={DATA} series={[{ dataKey: "alice" }]} />,
      );
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("alice"),
      );
    });

    it("uses the custom aria-label when provided", () => {
      const { container } = render(
        <RadarChart data={DATA} series={SERIES} aria-label="Skill radar" />,
      );
      expect(container.querySelector("[role='img']")).toHaveAttribute(
        "aria-label",
        "Skill radar",
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <RadarChart data={DATA} series={SERIES} className="radar-cls" />,
      );
      expect(container.querySelector("[role='img']")).toHaveClass("radar-cls");
    });
  });

  describe("props", () => {
    it("renders without crashing with filled and showLegend", () => {
      const { container } = render(
        <RadarChart
          data={DATA}
          series={[
            { dataKey: "alice", name: "Alice" },
            { dataKey: "bob", name: "Bob" },
          ]}
          filled
          showLegend
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
