import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AreaChart } from "./AreaChart";

const DATA = [
  { week: "W1", downloads: 320, installs: 210 },
  { week: "W2", downloads: 480, installs: 310 },
];
const SERIES = [{ dataKey: "downloads", name: "Downloads" }];

describe("AreaChart", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} xAxisKey="week" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies height to the wrapper div", () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} height={350} />,
      );
      expect(container.querySelector("div")).toHaveStyle({ height: "350px" });
    });

    it("uses 300px as default height", () => {
      const { container } = render(<AreaChart data={DATA} series={SERIES} />);
      expect(container.querySelector("div")).toHaveStyle({ height: "300px" });
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} className="area-custom" />,
      );
      expect(container.querySelector("div")).toHaveClass("area-custom");
    });
  });

  describe("stacked", () => {
    it("renders without crashing when stacked", () => {
      const { container } = render(
        <AreaChart
          data={DATA}
          series={[
            { dataKey: "downloads", name: "Downloads" },
            { dataKey: "installs", name: "Installs" },
          ]}
          xAxisKey="week"
          stacked
          showLegend
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("gradient", () => {
    it("renders without crashing when gradient is enabled", () => {
      const { container } = render(
        <AreaChart data={DATA} series={SERIES} gradient />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
