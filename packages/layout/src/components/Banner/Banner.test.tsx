import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Banner } from "./Banner";

describe("Banner", () => {
  describe("rendering", () => {
    it("renders the message content", () => {
      render(<Banner>Working offline</Banner>);
      expect(screen.getByText("Working offline")).toBeInTheDocument();
    });

    it("renders an icon for typed variants", () => {
      render(<Banner type="warning">Low disk space</Banner>);
      expect(screen.getByLabelText("Warning")).toBeInTheDocument();
    });

    it("does not render an icon for the default variant", () => {
      render(<Banner type="default">Message</Banner>);
      expect(screen.queryByLabelText(/info|success|warning|error/i)).not.toBeInTheDocument();
    });
  });

  describe("action button", () => {
    it("renders the action button when provided", () => {
      render(
        <Banner action={{ label: "Reconnect", onClick: vi.fn() }}>Offline</Banner>,
      );
      expect(screen.getByRole("button", { name: "Reconnect" })).toBeInTheDocument();
    });

    it("calls action.onClick when the action button is clicked", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();
      render(
        <Banner action={{ label: "Retry", onClick }}>Error</Banner>,
      );
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(onClick).toHaveBeenCalledOnce();
    });

    it("does not render an action button when action is omitted", () => {
      render(<Banner>Message</Banner>);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("dismiss button", () => {
    it("renders the dismiss button when onDismiss is provided", () => {
      render(<Banner onDismiss={vi.fn()}>Message</Banner>);
      expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    });

    it("calls onDismiss when the dismiss button is clicked", async () => {
      const onDismiss = vi.fn();
      const user = userEvent.setup();
      render(<Banner onDismiss={onDismiss}>Message</Banner>);
      await user.click(screen.getByRole("button", { name: "Dismiss" }));
      expect(onDismiss).toHaveBeenCalledOnce();
    });

    it("does not render a dismiss button when onDismiss is omitted", () => {
      render(<Banner>Message</Banner>);
      expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    });
  });

  describe("type variants", () => {
    it.each(["info", "success", "warning", "error"] as const)(
      "applies typeXxx class for type='%s'",
      (type) => {
        const { container } = render(<Banner type={type}>Msg</Banner>);
        expect(container.firstChild as HTMLElement).toHaveClass(
          new RegExp(`type${type[0].toUpperCase() + type.slice(1)}`),
        );
      },
    );

    it("uses role='alert' for error banners", () => {
      render(<Banner type="error">Failure</Banner>);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("uses role='status' for non-error banners", () => {
      render(<Banner type="info">Info</Banner>);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(<Banner className="my-banner">Msg</Banner>);
      expect(container.firstChild).toHaveClass("my-banner");
    });

    it("forwards data attributes to the root element", () => {
      const { container } = render(
        <Banner data-testid="the-banner">Msg</Banner>,
      );
      expect(container.firstChild).toHaveAttribute("data-testid", "the-banner");
    });
  });
});
