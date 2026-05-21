import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SparkBarChart } from "./SparkBarChart";

const NUMBERS = [42, 58, 35, 72, 61];
const OBJECTS = NUMBERS.map((v, i) => ({ day: `D${i}`, sessions: v }));

describe("SparkBarChart", () => {
  describe("rendering", () => {
    it("renders without crashing with number array", () => {
      const { container } = render(<SparkBarChart data={NUMBERS} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with object array and dataKey", () => {
      const { container } = render(
        <SparkBarChart data={OBJECTS} dataKey="sessions" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("renders without crashing with empty data", () => {
      const { container } = render(<SparkBarChart data={[]} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies custom height to wrapper", () => {
      const { container } = render(
        <SparkBarChart data={NUMBERS} height={56} />,
      );
      expect(container.querySelector("div")).toHaveStyle({ height: "56px" });
    });

    it("uses 40px as default height", () => {
      const { container } = render(<SparkBarChart data={NUMBERS} />);
      expect(container.querySelector("div")).toHaveStyle({ height: "40px" });
    });

    it("renders with explicit barSize", () => {
      const { container } = render(
        <SparkBarChart data={NUMBERS} barSize={6} />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("sets role=img and aria-label when aria-label is provided", () => {
      const { container } = render(
        <SparkBarChart data={NUMBERS} aria-label="Error count" />,
      );
      const wrapper = container.querySelector("div");
      expect(wrapper).toHaveAttribute("role", "img");
      expect(wrapper).toHaveAttribute("aria-label", "Error count");
    });

    it("sets aria-hidden when no aria-label is provided", () => {
      const { container } = render(<SparkBarChart data={NUMBERS} />);
      const wrapper = container.querySelector("div");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the wrapper div", () => {
      const { container } = render(
        <SparkBarChart data={NUMBERS} className="my-spark" />,
      );
      expect(container.querySelector("div")).toHaveClass("my-spark");
    });
  });
});
