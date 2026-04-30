import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LineChart } from "./LineChart";

const DATA = [
  { day: "Mon", cpu: 42, memory: 68 },
  { day: "Tue", cpu: 55, memory: 72 },
];
const SERIES = [{ dataKey: "cpu", name: "CPU" }];

describe("LineChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(
        <LineChart data={DATA} series={SERIES} xAxisKey="day" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(
        <LineChart data={DATA} series={SERIES} height={450} />,
      );
      expect(container.querySelector("div")).toHaveStyle({ height: "450px" });
    });

    it("uses 300px as default height", () => {
      const { container } = render(<LineChart data={DATA} series={SERIES} />);
      expect(container.querySelector("div")).toHaveStyle({ height: "300px" });
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <LineChart data={DATA} series={SERIES} className="my-line" />,
      );
      expect(container.querySelector("div")).toHaveClass("my-line");
    });
  });

  describe("multi-series", () => {
    it("renders without crashing with multiple series and legend", () => {
      const { container } = render(
        <LineChart
          data={DATA}
          series={[
            { dataKey: "cpu", name: "CPU" },
            { dataKey: "memory", name: "Memory" },
          ]}
          xAxisKey="day"
          showLegend
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
