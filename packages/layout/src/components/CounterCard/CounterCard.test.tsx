import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { CounterCard } from "./CounterCard";

// jsdom does not implement window.matchMedia — stub it so useCountUp works.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CounterCard", () => {
  describe("label", () => {
    it("renders the label text", () => {
      render(<CounterCard label="Documents" value={0} animated={false} />);
      expect(screen.getByText("Documents")).toBeInTheDocument();
    });
  });

  describe("value display (animated=false)", () => {
    it("renders the target value immediately when animated is false", () => {
      render(<CounterCard label="Documents" value={42} animated={false} />);
      // The aria-label on the live region always shows the final value
      expect(screen.getByLabelText(/^Documents: 42$/)).toBeInTheDocument();
    });

    it("renders the value with a prefix", () => {
      render(<CounterCard label="Revenue" value={100} prefix="$" animated={false} />);
      expect(screen.getByText("$")).toBeInTheDocument();
      // aria-label format: "<label>: <prefix><value><suffix>"
      expect(screen.getByLabelText("Revenue: $100")).toBeInTheDocument();
    });

    it("renders the value with a suffix", () => {
      render(<CounterCard label="Files" value={5} suffix=" files" animated={false} />);
      // getByText normalizes whitespace — query the affix span directly
      expect(screen.getByText((_, el) => el?.textContent === " files")).toBeInTheDocument();
      expect(screen.getByLabelText("Files: 5 files")).toBeInTheDocument();
    });

    it("renders prefix and suffix together", () => {
      render(
        <CounterCard label="Cost" value={200} prefix="$" suffix=" USD" animated={false} />,
      );
      expect(screen.getByLabelText("Cost: $200 USD")).toBeInTheDocument();
    });

    it("does not render a prefix element when prefix is omitted", () => {
      render(<CounterCard label="Files" value={5} animated={false} />);
      // Prefix/suffix only rendered when truthy — no orphan text node for "$"
      expect(screen.queryByText("$")).toBeNull();
    });

    it("does not render a suffix element when suffix is omitted", () => {
      render(<CounterCard label="Files" value={5} animated={false} />);
      expect(screen.queryByText(" files")).toBeNull();
    });

    it("applies a custom format function to the displayed value", () => {
      render(
        <CounterCard
          label="Disk"
          value={48.3}
          format={(n) => `${n.toFixed(1)} GB`}
          animated={false}
        />,
      );
      expect(screen.getByText("48.3 GB")).toBeInTheDocument();
    });

    it("respects the decimals prop when no custom format is provided", () => {
      render(
        <CounterCard label="Rate" value={3.14159} decimals={2} animated={false} />,
      );
      // The live-region aria-label encodes the final value with the given precision
      expect(screen.getByLabelText(/3\.14/)).toBeInTheDocument();
    });
  });

  describe("aria-live region", () => {
    it("has aria-live='polite' and aria-atomic='true' on the value span", () => {
      const { container } = render(
        <CounterCard label="Files" value={10} animated={false} />,
      );
      const liveRegion = container.querySelector("[aria-live='polite']");
      expect(liveRegion).not.toBeNull();
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    });

    it("encodes label, prefix, final value, and suffix in the aria-label", () => {
      render(
        <CounterCard
          label="Revenue"
          value={9420}
          prefix="$"
          suffix=" USD"
          animated={false}
        />,
      );
      // aria-label always uses the *target* value, not the animated display value
      expect(screen.getByLabelText(/Revenue:.*\$.*USD/)).toBeInTheDocument();
    });
  });

  describe("accent variant", () => {
    it("does not apply an accent class by default", () => {
      const { container } = render(
        <CounterCard label="Files" value={5} animated={false} />,
      );
      const liveRegion = container.querySelector("[aria-live='polite']");
      expect(liveRegion?.className).not.toMatch(/accent/);
    });

    it("applies an accent class when accent={true}", () => {
      const { container } = render(
        <CounterCard label="Starred" value={3} accent animated={false} />,
      );
      const liveRegion = container.querySelector("[aria-live='polite']");
      expect(liveRegion?.className).toMatch(/accent/);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the Card root element", () => {
      const { container } = render(
        <CounterCard label="Files" value={0} animated={false} className="my-card" />,
      );
      expect(container.firstChild).toHaveClass("my-card");
    });

    it("forwards inline style to the Card root element", () => {
      const { container } = render(
        <CounterCard label="Files" value={0} animated={false} style={{ width: "200px" }} />,
      );
      expect((container.firstChild as HTMLElement).style.width).toBe("200px");
    });

    it("forwards arbitrary HTML attributes to the Card root element", () => {
      const { container } = render(
        <CounterCard
          label="Files"
          value={0}
          animated={false}
          data-testid="counter"
          aria-label="File counter"
        />,
      );
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-testid", "counter");
      expect(root).toHaveAttribute("aria-label", "File counter");
    });
  });
});
