import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardGrid } from "./DashboardGrid";

describe("DashboardGrid", () => {
  describe("rendering", () => {
    it("renders children", () => {
      render(
        <DashboardGrid>
          <DashboardGrid.Item>Widget A</DashboardGrid.Item>
          <DashboardGrid.Item>Widget B</DashboardGrid.Item>
        </DashboardGrid>,
      );
      expect(screen.getByText("Widget A")).toBeInTheDocument();
      expect(screen.getByText("Widget B")).toBeInTheDocument();
    });
  });

  describe("columns prop", () => {
    it("applies repeat(N, 1fr) inline style for numeric columns", () => {
      const { container } = render(
        <DashboardGrid columns={3}>
          <DashboardGrid.Item>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe("repeat(3, 1fr)");
    });

    it.each([1, 2, 4] as const)(
      "applies repeat(%s, 1fr) for columns=%s",
      (cols) => {
        const { container } = render(<DashboardGrid columns={cols} />);
        const grid = container.firstChild as HTMLElement;
        expect(grid.style.gridTemplateColumns).toBe(`repeat(${cols}, 1fr)`);
      },
    );

    it('does not set gridTemplateColumns inline style for columns="auto"', () => {
      const { container } = render(<DashboardGrid columns="auto" />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe("");
    });

    it("defaults to auto when columns is omitted", () => {
      const { container } = render(<DashboardGrid />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe("");
    });

    it("sets responsive column CSS variables for object columns", () => {
      const { container } = render(
        <DashboardGrid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} />,
      );
      const grid = container.firstChild as HTMLElement;

      expect(grid.style.getPropertyValue("--dashboard-grid-columns-sm")).toBe("1");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-md")).toBe("2");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-lg")).toBe("3");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-xl")).toBe("4");
      expect(grid.style.gridTemplateColumns).toBe("");
      expect(grid.className).toMatch(/responsive/);
    });

    it("preserves user inline styles with responsive columns", () => {
      const { container } = render(
        <DashboardGrid columns={{ sm: 1, md: 2 }} style={{ maxWidth: 640 }} />,
      );
      const grid = container.firstChild as HTMLElement;

      expect(grid.style.maxWidth).toBe("640px");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-md")).toBe("2");
    });
  });

  describe("layout prop", () => {
    it("defaults to grid layout", () => {
      const { container } = render(<DashboardGrid />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.className).not.toMatch(/column/);
    });

    it("applies column layout class", () => {
      const { container } = render(<DashboardGrid layout="column" />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toMatch(/column/);
    });

    it("does not apply grid column styles in column layout", () => {
      const { container } = render(<DashboardGrid layout="column" columns={3} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.gridTemplateColumns).toBe("");
      expect(grid.className).not.toMatch(/auto|responsive/);
    });
  });

  describe("gap prop", () => {
    it.each(["sm", "md", "lg"] as const)(
      "applies gap class for gap='%s'",
      (gap) => {
        const { container } = render(<DashboardGrid gap={gap} />);
        const grid = container.firstChild as HTMLElement;
        expect(grid.className).toMatch(new RegExp(`gap${gap[0].toUpperCase() + gap.slice(1)}|gap-${gap}`));
      },
    );

    it("defaults to md gap when gap is omitted", () => {
      const { container } = render(<DashboardGrid />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.className).toMatch(/gapMd|gap-md/);
    });
  });

  describe("DashboardGrid.Item span prop", () => {
    it("applies gridColumn span style for span > 1", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item span={2}>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelector("[class]")
        ?.nextElementSibling as HTMLElement | null ??
        container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.gridColumn).toBe("span 2");
    });

    it.each([2, 3, 4] as const)(
      "applies span %s to item",
      (span) => {
        const { container } = render(
          <DashboardGrid>
            <DashboardGrid.Item span={span}>Item</DashboardGrid.Item>
          </DashboardGrid>,
        );
        const item = container.querySelectorAll("div")[1] as HTMLElement;
        expect(item.style.gridColumn).toBe(`span ${span}`);
      },
    );

    it("does not apply gridColumn style for default span (1)", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.gridColumn).toBe("");
    });
  });

  describe("HTML attribute forwarding", () => {
    it("forwards className to the grid root", () => {
      const { container } = render(<DashboardGrid className="my-grid" />);
      expect(container.firstChild).toHaveClass("my-grid");
    });

    it("forwards data attributes to the grid root", () => {
      const { container } = render(<DashboardGrid data-testid="grid" />);
      expect(container.firstChild).toHaveAttribute("data-testid", "grid");
    });

    it("forwards className to DashboardGrid.Item", () => {
      render(
        <DashboardGrid>
          <DashboardGrid.Item className="my-item">Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = screen.getByText("Item");
      expect(item).toHaveClass("my-item");
    });

    it("forwards data attributes to DashboardGrid.Item", () => {
      render(
        <DashboardGrid>
          <DashboardGrid.Item data-testid="item">Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      expect(screen.getByTestId("item")).toBeInTheDocument();
    });
  });
});
