import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner } from "./Banner";

describe("Banner", () => {
  describe("rendering", () => {
    it("renders the message", () => {
      render(<Banner>Update available</Banner>);
      expect(screen.getByText("Update available")).toBeInTheDocument();
    });

    it("renders with role=status and aria-live=polite", () => {
      render(<Banner>Message</Banner>);
      const banner = screen.getByRole("status");
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveAttribute("aria-live", "polite");
    });

    it("does not render action button when actionLabel is omitted", () => {
      render(<Banner>Message</Banner>);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders action button when actionLabel is provided", () => {
      render(<Banner actionLabel="Retry">Failed</Banner>);
      expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    });

    it("renders dismiss button when dismissible is true", () => {
      render(<Banner dismissible>Message</Banner>);
      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("does not render dismiss button by default", () => {
      render(<Banner>Message</Banner>);
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it.each(["info", "warning", "error", "success"] as const)(
      "applies %s variant class",
      (variant) => {
        render(<Banner variant={variant}>Message</Banner>);
        expect(screen.getByRole("status").className).toMatch(new RegExp(variant));
      },
    );

    it("defaults to info variant", () => {
      render(<Banner>Message</Banner>);
      expect(screen.getByRole("status").className).toMatch(/info/);
    });
  });

  describe("interactions", () => {
    it("calls onAction when action button is clicked", async () => {
      const onAction = vi.fn();
      render(<Banner actionLabel="Retry" onAction={onAction}>Failed</Banner>);
      await userEvent.click(screen.getByRole("button", { name: "Retry" }));
      expect(onAction).toHaveBeenCalledOnce();
    });

    it("calls onDismiss when dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      render(<Banner dismissible onDismiss={onDismiss}>Message</Banner>);
      await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      render(<Banner className="custom">Message</Banner>);
      expect(screen.getByRole("status")).toHaveClass("custom");
    });

    it("forwards data attributes", () => {
      render(<Banner data-testid="my-banner">Message</Banner>);
      expect(screen.getByTestId("my-banner")).toBeInTheDocument();
    });
  });
});
