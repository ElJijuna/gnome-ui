import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CountDownTimer } from "./CountDownTimer";

describe("CountDownTimer", () => {
  describe("rendering", () => {
    it("renders with time format", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      render(<CountDownTimer start={new Date()} end={futureDate} format="time" />);
      // Allow for some variance in rendering
      const elements = screen.queryAllByText(/\d+:\d+:\d+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it("renders with date format", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      render(<CountDownTimer start={new Date()} end={futureDate} format="date" />);
      const dateText = screen.getByText(/\d+\/\d+\/\d+/);
      expect(dateText).toBeInTheDocument();
    });

    it("renders with datetime format", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={futureDate} format="datetime" />
      );
      const textContent = container.textContent || "";
      expect(textContent).toMatch(/\d+\/\d+\/\d+/);
    });

    it("renders with default time format when format is not specified", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      render(<CountDownTimer start={new Date()} end={futureDate} />);
      const elements = screen.queryAllByText(/\d+:\d+:\d+/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe("variants", () => {
    it("applies accent variant class", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={futureDate} variant="accent" />
      );
      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("accent");
    });

    it("applies success variant class", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={futureDate} variant="success" />
      );
      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("success");
    });

    it("applies warning variant class", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={futureDate} variant="warning" />
      );
      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("warning");
    });
  });

  describe("countdown behavior", () => {
    it("should update timer state correctly", async () => {
      const futureDate = new Date(Date.now() + 60 * 1000); // 60 seconds from now
      const { container } = render(
        <CountDownTimer start={new Date()} end={futureDate} format="time" />
      );

      await waitFor(
        () => {
          const textContent = container.textContent || "";
          expect(textContent).toMatch(/\d+:\d+:\d+/);
        },
        { timeout: 3000 }
      );
    });

    it("shows 00:00:00 when end date is in the past", () => {
      const pastDate = new Date(Date.now() - 1000);
      render(<CountDownTimer start={new Date()} end={pastDate} format="time" />);

      expect(screen.getByText(/00:00:00/)).toBeInTheDocument();
    });

    it("applies finished class when end date is in the past", () => {
      const pastDate = new Date(Date.now() - 1000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={pastDate} />
      );

      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("finished");
    });

    it("switches to destructive variant when countdown finishes", () => {
      const pastDate = new Date(Date.now() - 1000);
      const { container } = render(
        <CountDownTimer
          start={new Date()}
          end={pastDate}
          variant="accent"
        />
      );

      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("destructive");
    });
  });

  describe("callback", () => {
    it("calls the action callback when countdown finishes", async () => {
      const mockAction = vi.fn();
      const pastDate = new Date(Date.now() - 100);
      render(
        <CountDownTimer
          start={new Date()}
          end={pastDate}
          action={mockAction}
        />
      );

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });

  describe("time format display", () => {
    it("displays time in HH:MM:SS format", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const { container } = render(
        <CountDownTimer
          start={new Date()}
          end={futureDate}
          format="time"
        />
      );

      const textContent = container.textContent || "";
      expect(textContent).toMatch(/\d+:\d+:\d+/);
    });

    it("displays days when countdown exceeds 24 hours", () => {
      const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
      const { container } = render(
        <CountDownTimer
          start={new Date()}
          end={futureDate}
          format="time"
        />
      );

      const textContent = container.textContent || "";
      expect(textContent).toMatch(/d.*h.*m/);
    });
  });

  describe("edge cases", () => {
    it("handles end date in the past gracefully", () => {
      const pastDate = new Date(Date.now() - 5000);
      const { container } = render(
        <CountDownTimer start={new Date()} end={pastDate} />
      );

      expect(screen.getByText(/00:00:00/)).toBeInTheDocument();
      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("finished");
    });

    it("accepts custom className", () => {
      const futureDate = new Date(Date.now() + 60 * 1000);
      const { container } = render(
        <CountDownTimer
          start={new Date()}
          end={futureDate}
          className="custom-class"
        />
      );

      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("custom-class");
    });

    it("renders correctly with all props", () => {
      const futureDate = new Date(Date.now() + 60 * 1000);
      const mockAction = vi.fn();
      const { container } = render(
        <CountDownTimer
          start={new Date()}
          end={futureDate}
          format="datetime"
          variant="success"
          action={mockAction}
          className="test-class"
        />
      );

      const className = (container.firstChild as HTMLElement)?.className || "";
      expect(className).toContain("success");
      expect(className).toContain("test-class");
    });
  });
});
