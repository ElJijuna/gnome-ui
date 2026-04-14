import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserCard } from "./UserCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultActions = [
  { label: "View Profile",     onClick: vi.fn() },
  { label: "Account Settings", onClick: vi.fn() },
  { label: "Sign Out",         onClick: vi.fn(), variant: "destructive" as const },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("UserCard", () => {
  describe("identity header", () => {
    it("renders the display name", () => {
      render(<UserCard name="Ada Lovelace" />);
      expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    });

    it("renders the email when provided", () => {
      render(<UserCard name="Ada Lovelace" email="ada@gnome.org" />);
      expect(screen.getByText("ada@gnome.org")).toBeInTheDocument();
    });

    it("does not render an email element when email is omitted", () => {
      render(<UserCard name="Ada Lovelace" />);
      expect(screen.queryByText(/@/)).toBeNull();
    });
  });

  describe("actions", () => {
    it("does not render the actions section when no actions are provided", () => {
      const { container } = render(<UserCard name="Ada Lovelace" />);
      expect(container.querySelector("[role='list']")).toBeNull();
      expect(container.querySelectorAll("hr")).toHaveLength(0);
    });

    it("renders each action as a button with the correct label", () => {
      render(<UserCard name="Ada Lovelace" actions={defaultActions} />);
      expect(screen.getByRole("button", { name: "View Profile" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Account Settings" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    });

    it("calls onClick when an action button is clicked", () => {
      const onClick = vi.fn();
      render(
        <UserCard
          name="Ada Lovelace"
          actions={[{ label: "View Profile", onClick }]}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "View Profile" }));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("renders the actions container with role='list'", () => {
      const { container } = render(
        <UserCard name="Ada Lovelace" actions={defaultActions} />,
      );
      expect(container.querySelector("[role='list']")).not.toBeNull();
    });

    it("renders each action item with role='listitem'", () => {
      const { container } = render(
        <UserCard name="Ada Lovelace" actions={defaultActions} />,
      );
      const items = container.querySelectorAll("[role='listitem']");
      expect(items).toHaveLength(defaultActions.length);
    });
  });

  describe("separator logic", () => {
    it("renders one separator (after header) when there are only non-destructive actions", () => {
      const { container } = render(
        <UserCard
          name="Ada Lovelace"
          actions={[
            { label: "View Profile"     },
            { label: "Account Settings" },
          ]}
        />,
      );
      expect(container.querySelectorAll("hr")).toHaveLength(1);
    });

    it("inserts an extra separator before a destructive action that follows non-destructive ones", () => {
      const { container } = render(
        <UserCard
          name="Ada Lovelace"
          actions={[
            { label: "View Profile" },
            { label: "Sign Out", variant: "destructive" },
          ]}
        />,
      );
      // 1 separator after header + 1 separator before destructive action
      expect(container.querySelectorAll("hr")).toHaveLength(2);
    });

    it("does not insert an extra separator between consecutive destructive actions", () => {
      const { container } = render(
        <UserCard
          name="Ada Lovelace"
          actions={[
            { label: "Sign Out",       variant: "destructive" },
            { label: "Delete Account", variant: "destructive" },
          ]}
        />,
      );
      // Only the separator after the header
      expect(container.querySelectorAll("hr")).toHaveLength(1);
    });

    it("does not insert an extra separator when the first action is destructive", () => {
      const { container } = render(
        <UserCard
          name="Ada Lovelace"
          actions={[{ label: "Sign Out", variant: "destructive" }]}
        />,
      );
      // Only the separator after the header
      expect(container.querySelectorAll("hr")).toHaveLength(1);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <UserCard name="Ada Lovelace" className="custom-card" />,
      );
      expect(container.firstChild).toHaveClass("custom-card");
    });

    it("applies minWidth as inline style (defaults to 200)", () => {
      const { container } = render(<UserCard name="Ada Lovelace" />);
      expect((container.firstChild as HTMLElement).style.minWidth).toBe("200px");
    });

    it("applies a custom minWidth", () => {
      const { container } = render(<UserCard name="Ada Lovelace" minWidth={320} />);
      expect((container.firstChild as HTMLElement).style.minWidth).toBe("320px");
    });

    it("merges custom style with the minWidth default", () => {
      const { container } = render(
        <UserCard name="Ada Lovelace" style={{ padding: "8px" }} />,
      );
      const el = container.firstChild as HTMLElement;
      expect(el.style.minWidth).toBe("200px");
      expect(el.style.padding).toBe("8px");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <UserCard name="Ada Lovelace" data-testid="user-card" aria-label="User panel" />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-testid", "user-card");
      expect(root).toHaveAttribute("aria-label", "User panel");
    });
  });
});
