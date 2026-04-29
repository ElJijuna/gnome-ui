import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TreeMap } from "./TreeMap";

const DATA = [
  { label: "React", value: 4200, group: "Frontend" },
  { label: "Vue", value: 2100, group: "Frontend" },
  { label: "Node.js", value: 3800, group: "Backend" },
];

describe("TreeMap", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<TreeMap data={DATA} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(<TreeMap data={DATA} height={500} />);
      expect(container.querySelector("div")).toHaveStyle({ height: "500px" });
    });

    it("uses 400px as default height", () => {
      const { container } = render(<TreeMap data={DATA} />);
      expect(container.querySelector("div")).toHaveStyle({ height: "400px" });
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <TreeMap data={DATA} className="treemap-cls" />,
      );
      expect(container.querySelector("div")).toHaveClass("treemap-cls");
    });
  });

  describe("props", () => {
    it("renders without crashing with showLabels disabled", () => {
      const { container } = render(<TreeMap data={DATA} showLabels={false} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with ungrouped data", () => {
      const { container } = render(
        <TreeMap data={[{ label: "A", value: 100 }, { label: "B", value: 200 }]} />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
