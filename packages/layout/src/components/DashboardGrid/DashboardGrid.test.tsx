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

    it.each([1, 2, 6, 12] as const)(
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
        <DashboardGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 12 }} />,
      );
      const grid = container.firstChild as HTMLElement;

      expect(grid.style.getPropertyValue("--dashboard-grid-columns-xs")).toBe("1");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-sm")).toBe("2");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-md")).toBe("3");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-lg")).toBe("4");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-xl")).toBe("6");
      expect(grid.style.getPropertyValue("--dashboard-grid-columns-xxl")).toBe("12");
      expect(grid.style.gridTemplateColumns).toBe("");
      expect(grid.className).toMatch(/responsive/);
    });

    it("preserves user inline styles with responsive columns", () => {
      const { container } = render(
        <DashboardGrid columns={{ xs: 1, md: 2 }} style={{ maxWidth: 640 }} />,
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
      "sets --dashboard-grid-gap-xs CSS variable for gap='%s'",
      (gap) => {
        const { container } = render(<DashboardGrid gap={gap} />);
        const grid = container.firstChild as HTMLElement;
        expect(grid.style.getPropertyValue("--dashboard-grid-gap-xs")).not.toBe("");
      },
    );

    it("defaults to md gap (gnome-space-3 token)", () => {
      const { container } = render(<DashboardGrid />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.getPropertyValue("--dashboard-grid-gap-xs")).toContain(
        "gnome-space-3",
      );
    });

    it("sets per-breakpoint gap CSS variables for responsive gap", () => {
      const { container } = render(
        <DashboardGrid gap={{ xs: "sm", md: "md", xl: "lg" }} />,
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid.style.getPropertyValue("--dashboard-grid-gap-xs")).toContain("gnome-space-2");
      expect(grid.style.getPropertyValue("--dashboard-grid-gap-md")).toContain("gnome-space-3");
      expect(grid.style.getPropertyValue("--dashboard-grid-gap-xl")).toContain("gnome-space-4");
    });
  });

  describe("DashboardGrid.Item span prop", () => {
    it("sets --item-span-xs CSS variable for static span", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item span={4}>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.getPropertyValue("--item-span-xs")).toBe("4");
    });

    it.each([2, 3, 6, 12] as const)(
      "sets --item-span-xs to %s for span=%s",
      (span) => {
        const { container } = render(
          <DashboardGrid>
            <DashboardGrid.Item span={span}>Item</DashboardGrid.Item>
          </DashboardGrid>,
        );
        const item = container.querySelectorAll("div")[1] as HTMLElement;
        expect(item.style.getPropertyValue("--item-span-xs")).toBe(String(span));
      },
    );

    it("sets default span of 1 for items without explicit span", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.getPropertyValue("--item-span-xs")).toBe("1");
    });

    it("sets per-breakpoint span CSS variables for responsive span", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item span={{ xs: 12, sm: 6, md: 4, lg: 3 }}>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.getPropertyValue("--item-span-xs")).toBe("12");
      expect(item.style.getPropertyValue("--item-span-sm")).toBe("6");
      expect(item.style.getPropertyValue("--item-span-md")).toBe("4");
      expect(item.style.getPropertyValue("--item-span-lg")).toBe("3");
    });
  });

  describe("DashboardGrid.Item offset prop", () => {
    it("sets --item-offset-xs and itemWithOffset class for offset > 0", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item offset={3}>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.style.getPropertyValue("--item-offset-xs")).toBe("3");
      expect(item.className).toMatch(/itemWithOffset/);
    });

    it("does not apply itemWithOffset class for offset=0", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item offset={0}>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.className).not.toMatch(/itemWithOffset/);
    });

    it("does not apply itemWithOffset class when offset is omitted", () => {
      const { container } = render(
        <DashboardGrid>
          <DashboardGrid.Item>Item</DashboardGrid.Item>
        </DashboardGrid>,
      );
      const item = container.querySelectorAll("div")[1] as HTMLElement;
      expect(item.className).not.toMatch(/itemWithOffset/);
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
