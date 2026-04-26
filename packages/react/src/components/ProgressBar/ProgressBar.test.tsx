import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  describe("rendering", () => {
    it("renders with role=progressbar", () => {
      render(<ProgressBar aria-label="Loading" />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("determinate mode", () => {
    it("sets aria-valuenow as percentage of value", () => {
      render(<ProgressBar value={0.6} aria-label="Progress" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "60",
      );
    });

    it("sets aria-valuemin=0 and aria-valuemax=100", () => {
      render(<ProgressBar value={0.5} aria-label="Progress" />);
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("clamps value above 1 to 100%", () => {
      render(<ProgressBar value={1.5} aria-label="Progress" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "100",
      );
    });

    it("clamps value below 0 to 0%", () => {
      render(<ProgressBar value={-0.5} aria-label="Progress" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    });
  });

  describe("indeterminate mode", () => {
    it("does not set aria-valuenow when value is omitted", () => {
      render(<ProgressBar aria-label="Loading" />);
      expect(screen.getByRole("progressbar")).not.toHaveAttribute(
        "aria-valuenow",
      );
    });

    it("does not set aria-valuemin/max in indeterminate mode", () => {
      render(<ProgressBar aria-label="Loading" />);
      const bar = screen.getByRole("progressbar");
      expect(bar).not.toHaveAttribute("aria-valuemin");
      expect(bar).not.toHaveAttribute("aria-valuemax");
    });

    it("applies indeterminate class to fill", () => {
      const { container } = render(<ProgressBar aria-label="Loading" />);
      const fill = container.querySelector("[class*='fill']");
      expect(fill!.className).toMatch(/indeterminate/);
    });
  });

  describe("variants", () => {
    it.each(["accent", "success", "warning", "error"] as const)(
      "applies %s variant class to fill",
      (variant) => {
        const { container } = render(
          <ProgressBar value={0.5} variant={variant} aria-label="Progress" />,
        );
        const fill = container.querySelector("[class*='fill']");
        expect(fill!.className).toMatch(new RegExp(variant));
      },
    );

    it("defaults to accent variant", () => {
      const { container } = render(
        <ProgressBar value={0.5} aria-label="Progress" />,
      );
      const fill = container.querySelector("[class*='fill']");
      expect(fill!.className).toMatch(/accent/);
    });
  });

  describe("accessibility", () => {
    it("sets aria-label", () => {
      render(<ProgressBar aria-label="Uploading file" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        "Uploading file",
      );
    });

    it("sets aria-labelledby", () => {
      render(<ProgressBar aria-labelledby="label-id" />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-labelledby",
        "label-id",
      );
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<ProgressBar aria-label="Progress" className="custom" />);
      expect(screen.getByRole("progressbar")).toHaveClass("custom");
    });
  });
});
