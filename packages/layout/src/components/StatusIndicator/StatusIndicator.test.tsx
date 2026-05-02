import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusIndicator } from "./StatusIndicator";

describe("StatusIndicator", () => {
  describe("label", () => {
    it("renders the label", () => {
      render(<StatusIndicator status="online" label="Database" />);
      expect(screen.getByText("Database")).toBeInTheDocument();
    });
  });

  describe("description", () => {
    it("renders description when provided", () => {
      render(
        <StatusIndicator status="warning" label="API" description="High latency" />,
      );
      expect(screen.getByText("High latency")).toBeInTheDocument();
    });

    it("does not render description when omitted", () => {
      render(<StatusIndicator status="online" label="Database" />);
      expect(screen.queryByText("High latency")).toBeNull();
    });
  });

  describe("dot aria-label", () => {
    it.each([
      ["online",  "Online"],
      ["offline", "Offline"],
      ["warning", "Warning"],
      ["error",   "Error"],
      ["loading", "Loading"],
    ] as const)("status '%s' gives dot aria-label '%s'", (status, expected) => {
      render(<StatusIndicator status={status} label="Service" />);
      expect(screen.getByRole("img", { name: expected })).toBeInTheDocument();
    });
  });

  describe("status class", () => {
    it.each(["online", "offline", "warning", "error", "loading"] as const)(
      "applies '%s' class to the dot",
      (status) => {
        const { container } = render(
          <StatusIndicator status={status} label="Service" />,
        );
        const dot = container.querySelector("[role='img']");
        expect(dot?.className).toMatch(status);
      },
    );
  });

  describe("size class", () => {
    it("applies 'md' class by default", () => {
      const { container } = render(
        <StatusIndicator status="online" label="Service" />,
      );
      const dot = container.querySelector("[role='img']");
      expect(dot?.className).toMatch("md");
    });

    it("applies 'sm' class when size='sm'", () => {
      const { container } = render(
        <StatusIndicator status="online" label="Service" size="sm" />,
      );
      const dot = container.querySelector("[role='img']");
      expect(dot?.className).toMatch("sm");
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <StatusIndicator status="online" label="DB" className="my-status" />,
      );
      expect(container.firstChild).toHaveClass("my-status");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <StatusIndicator status="online" label="DB" data-testid="status" />,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "status");
    });
  });
});
