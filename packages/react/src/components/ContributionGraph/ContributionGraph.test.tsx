import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GnomeProvider } from "../GnomeProvider/GnomeProvider";
import { ContributionGraph } from "./ContributionGraph";

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = [];

  constructor(private callback: ResizeObserverCallback) {
    ResizeObserverMock.instances.push(this);
  }

  observe() {}
  unobserve() {}
  disconnect() {}

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

function todayIso() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

beforeEach(() => {
  ResizeObserverMock.instances = [];
  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

describe("ContributionGraph", () => {
  it("reduces visible weeks before responsive cells fall below their minimum", () => {
    render(<ContributionGraph data={[]} weeks={52} minCellSize={8} />);

    const svg = screen.getByRole("img", { name: "Contribution graph" });
    const viewport = svg.parentElement as HTMLElement;

    Object.defineProperty(viewport, "clientWidth", {
      configurable: true,
      value: 360,
    });

    act(() => ResizeObserverMock.instances[0].trigger());

    expect(svg).toHaveAttribute("data-cell-size", "8");
    expect(Number(svg.getAttribute("data-visible-weeks"))).toBeLessThan(52);
  });

  it("grows cells to use available width while the configured range fits", () => {
    render(<ContributionGraph data={[]} weeks={4} minCellSize={8} maxCellSize={24} />);

    const svg = screen.getByRole("img", { name: "Contribution graph" });
    const viewport = svg.parentElement as HTMLElement;

    Object.defineProperty(viewport, "clientWidth", {
      configurable: true,
      value: 240,
    });

    act(() => ResizeObserverMock.instances[0].trigger());

    expect(svg).toHaveAttribute("data-visible-weeks", "4");
    expect(svg).toHaveAttribute("data-cell-size", "24");
  });

  it("renders tooltips in a body portal so scroll overflow does not clip them", () => {
    render(<ContributionGraph data={[]} responsive={false} weeks={1} />);

    fireEvent.mouseEnter(screen.getAllByRole("gridcell")[0]);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.parentElement).toBe(document.body);
  });

  it("updates accent contribution colours with GnomeProvider", () => {
    const data = [{ date: todayIso(), count: 3 }];
    const { container, rerender } = render(
      <GnomeProvider colorScheme="light" accentColor="purple">
        <ContributionGraph
          data={data}
          responsive={false}
        />
      </GnomeProvider>,
    );

    expect(
      container.querySelector('rect[fill*="--gnome-purple-"]'),
    ).toBeInTheDocument();

    rerender(
      <GnomeProvider colorScheme="light" accentColor="red">
        <ContributionGraph
          data={data}
          responsive={false}
        />
      </GnomeProvider>,
    );

    expect(
      container.querySelector('rect[fill*="--gnome-red-"]'),
    ).toBeInTheDocument();
  });

  it("uses the default named accent tokens without a provider", () => {
    const { container } = render(
      <ContributionGraph
        data={[{ date: todayIso(), count: 3 }]}
        responsive={false}
      />,
    );

    expect(
      container.querySelector('rect[fill*="--gnome-blue-"]'),
    ).toBeInTheDocument();
  });
});
