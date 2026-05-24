import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileCard } from "./ProfileCard";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ProfileCard", () => {
  describe("identity", () => {
    it("renders the display name", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(screen.getByText("rcronald")).toBeInTheDocument();
    });

    it("renders the username", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(screen.getByText("@rcronald")).toBeInTheDocument();
    });
  });

  describe("status dot", () => {
    it("does not render a status dot when status is omitted", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(screen.queryByRole("img", { name: /online|offline|away|busy/i })).toBeNull();
    });

    it.each(["online", "offline", "away", "busy"] as const)(
      "renders a status dot with aria-label '%s'",
      (status) => {
        render(<ProfileCard name="rcronald" username="@rcronald" status={status} />);
        expect(screen.getByRole("img", { name: status })).toBeInTheDocument();
      },
    );
  });

  describe("stats", () => {
    it("does not render stats when omitted", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(screen.queryByText("posts")).toBeNull();
    });

    it("renders stat values and labels", () => {
      render(
        <ProfileCard
          name="rcronald"
          username="@rcronald"
          stats={[
            { label: "posts", value: 127 },
            { label: "followers", value: "2.4k" },
          ]}
        />,
      );
      expect(screen.getByText("127")).toBeInTheDocument();
      expect(screen.getByText("posts")).toBeInTheDocument();
      expect(screen.getByText("2.4k")).toBeInTheDocument();
      expect(screen.getByText("followers")).toBeInTheDocument();
    });
  });

  describe("backgroundChart", () => {
    it("does not render the chart wrapper when backgroundChart is omitted", () => {
      const { container } = render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(container.querySelector("div[aria-hidden='true']")).toBeNull();
    });

    it("renders the chart wrapper with aria-hidden when backgroundChart is provided", () => {
      const { container } = render(
        <ProfileCard
          name="rcronald"
          username="@rcronald"
          backgroundChart={<svg data-testid="chart" />}
        />,
      );
      expect(container.querySelector("div[aria-hidden='true']")).not.toBeNull();
    });
  });

  describe("loading", () => {
    it("renders with aria-busy='true' when loading", () => {
      const { container } = render(
        <ProfileCard name="rcronald" username="@rcronald" loading />,
      );
      expect(container.firstChild).toHaveAttribute("aria-busy", "true");
    });

    it("does not render name or username when loading", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" loading />);
      expect(screen.queryByText("rcronald")).toBeNull();
      expect(screen.queryByText("@rcronald")).toBeNull();
    });

    it("renders skeleton by default when loading={true}", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" loading />);
      expect(screen.queryByRole("status")).toBeNull();
    });

    it("renders spinner when loadingType='spinner'", () => {
      render(
        <ProfileCard name="rcronald" username="@rcronald" loading loadingType="spinner" />,
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("does not render spinner when not loading", () => {
      render(<ProfileCard name="rcronald" username="@rcronald" loadingType="spinner" />);
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.getByText("rcronald")).toBeInTheDocument();
    });
  });

  describe("interactive", () => {
    it("renders as div by default (non-interactive)", () => {
      const { container } = render(<ProfileCard name="rcronald" username="@rcronald" />);
      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("renders as button when interactive={true}", () => {
      const { container } = render(
        <ProfileCard name="rcronald" username="@rcronald" interactive />,
      );
      expect(container.firstChild?.nodeName).toBe("BUTTON");
    });

    it("calls onClick when the interactive card is clicked", async () => {
      const handleClick = vi.fn();
      render(
        <ProfileCard
          name="rcronald"
          username="@rcronald"
          interactive
          onClick={handleClick}
        />,
      );
      await userEvent.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledOnce();
    });

    it("does not call onClick when not interactive and card is clicked", async () => {
      const handleClick = vi.fn();
      const { container } = render(
        <ProfileCard name="rcronald" username="@rcronald" onClick={handleClick} />,
      );
      await userEvent.click(container.firstChild as HTMLElement);
      expect(handleClick).toHaveBeenCalledOnce();
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the root element", () => {
      const { container } = render(
        <ProfileCard name="rcronald" username="@rcronald" className="custom" />,
      );
      expect(container.firstChild).toHaveClass("custom");
    });

    it("forwards arbitrary HTML attributes to the root element", () => {
      const { container } = render(
        <ProfileCard
          name="rcronald"
          username="@rcronald"
          data-testid="profile-card"
          aria-label="User profile"
        />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-testid", "profile-card");
      expect(root).toHaveAttribute("aria-label", "User profile");
    });
  });
});
