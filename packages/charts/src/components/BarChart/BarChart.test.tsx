import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BarChart } from "./BarChart";

const DATA = [
  { month: "Jan", sales: 100, returns: 20 },
  { month: "Feb", sales: 150, returns: 30 },
];
const SERIES = [{ dataKey: "sales", name: "Sales" }];

describe("BarChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} xAxisKey="month" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(
        <BarChart data={DATA} series={SERIES} height={500} />,
      );
      const div = container.querySelector("div");
      expect(div).toHaveStyle({ height: "500px" });
    });

    it("uses 300px as default height", () => {
      const { container } = render(<BarChart data={DATA} series={SERIES} />);
      const div = container.querySelector("div");
      expect(div).toHaveStyle({ height: "300px" });
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <BarChart data={DATA} series={SERIES} className="custom-bar" />,
      );
      expect(container.querySelector("div")).toHaveClass("custom-bar");
    });
  });

  describe("multi-series", () => {
    it("renders without crashing with multiple series", () => {
      const { container } = render(
        <BarChart
          data={DATA}
          series={[
            { dataKey: "sales", name: "Sales" },
            { dataKey: "returns", name: "Returns" },
          ]}
          xAxisKey="month"
          showLegend
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
