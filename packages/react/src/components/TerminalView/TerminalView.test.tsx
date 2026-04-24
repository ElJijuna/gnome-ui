import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminalView } from "./TerminalView";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => { };
});

describe("TerminalView", () => {
  describe("rendering", () => {
    it("renders all provided lines", () => {
      render(<TerminalView lines={["line one", "line two", "line three"]} />);
      expect(screen.getByText("line one")).toBeInTheDocument();
      expect(screen.getByText("line two")).toBeInTheDocument();
      expect(screen.getByText("line three")).toBeInTheDocument();
    });

    it("renders empty output with no lines", () => {
      const { container } = render(<TerminalView lines={[]} />);

      expect(container.querySelector("pre")).toBeInTheDocument();
    });

    it("renders empty lines as empty divs", () => {
      const { container } = render(<TerminalView lines={["a", "", "b"]} />);
      const lineDivs = container.querySelectorAll("pre > div");

      expect(lineDivs.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("maxLines", () => {
    it("caps rendered lines to maxLines", () => {
      const lines = Array.from({ length: 20 }, (_, i) => `line-${i + 1}`);

      render(<TerminalView lines={lines} maxLines={5} />);
      expect(screen.queryByText("line-1")).toBeNull();
      expect(screen.getByText("line-16")).toBeInTheDocument();
      expect(screen.getByText("line-20")).toBeInTheDocument();
    });

    it("renders all lines when count is below maxLines", () => {
      render(<TerminalView lines={["a", "b"]} maxLines={10} />);
      expect(screen.getByText("a")).toBeInTheDocument();
      expect(screen.getByText("b")).toBeInTheDocument();
    });
  });

  describe("variant CSS classes", () => {
    it("applies the variant class", () => {
      const { container } = render(<TerminalView lines={[]} variant="success" />);

      expect((container.firstChild as HTMLElement).className).toMatch(/success/);
    });

    it("does not apply a color variant class when variant is omitted", () => {
      const { container } = render(<TerminalView lines={[]} />);
      const cls = (container.firstChild as HTMLElement).className;

      expect(cls).not.toMatch(/success|warning|destructive/);
    });

    it("applies destructive class", () => {
      const { container } = render(<TerminalView lines={[]} variant="destructive" />);

      expect((container.firstChild as HTMLElement).className).toMatch(/destructive/);
    });

    it("applies warning class", () => {
      const { container } = render(<TerminalView lines={[]} variant="warning" />);

      expect((container.firstChild as HTMLElement).className).toMatch(/warning/);
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className", () => {
      const { container } = render(<TerminalView lines={[]} className="my-term" />);

      expect((container.firstChild as HTMLElement).className).toContain("my-term");
    });

    it("forwards inline style", () => {
      const { container } = render(<TerminalView lines={[]} style={{ height: "200px" }} />);

      expect((container.firstChild as HTMLElement).style.height).toBe("200px");
    });

    it("forwards arbitrary HTML attributes", () => {
      render(<TerminalView lines={[]} data-testid="term" />);
      expect(screen.getByTestId("term")).toBeInTheDocument();
    });
  });
});
