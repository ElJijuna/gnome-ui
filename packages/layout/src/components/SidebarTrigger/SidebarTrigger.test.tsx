import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { SidebarTrigger } from "./SidebarTrigger";

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches,
    media: "",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function mockMutableMatchMedia(matches: boolean) {
  let currentMatches = matches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  window.matchMedia = vi.fn().mockImplementation(() => ({
    get matches() {
      return currentMatches;
    },
    media: "",
    onchange: null,
    addEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_event: "change", listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  return {
    setMatches(nextMatches: boolean) {
      currentMatches = nextMatches;
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as MediaQueryListEvent),
      );
    },
  };
}

describe("SidebarTrigger", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("toggles collapsed state on wide screens", () => {
    const onOpenChange = vi.fn();
    const onCollapsedChange = vi.fn();

    render(
      <SidebarTrigger
        sidebarOpen={false}
        sidebarCollapsed={false}
        onSidebarOpenChange={onOpenChange}
        onSidebarCollapsedChange={onCollapsedChange}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("toggles open state on overlay breakpoints", () => {
    mockMatchMedia(true);
    const onOpenChange = vi.fn();
    const onCollapsedChange = vi.fn();

    render(
      <SidebarTrigger
        sidebarOpen={false}
        sidebarCollapsed={false}
        onSidebarOpenChange={onOpenChange}
        onSidebarCollapsedChange={onCollapsedChange}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onOpenChange).toHaveBeenCalledWith(true, "trigger");
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it("reacts when the viewport crosses the overlay breakpoint", () => {
    const media = mockMutableMatchMedia(false);
    const onOpenChange = vi.fn();
    const onCollapsedChange = vi.fn();

    render(
      <SidebarTrigger
        sidebarOpen={false}
        sidebarCollapsed={false}
        onSidebarOpenChange={onOpenChange}
        onSidebarCollapsedChange={onCollapsedChange}
      />,
    );

    act(() => {
      media.setMatches(true);
    });
    fireEvent.click(screen.getByRole("button"));

    expect(onOpenChange).toHaveBeenCalledWith(true, "trigger");
    expect(onCollapsedChange).not.toHaveBeenCalled();
  });

  it("forwards aria-label", () => {
    render(
      <SidebarTrigger
        aria-label="Toggle navigation"
        sidebarOpen={false}
        sidebarCollapsed={false}
        onSidebarOpenChange={() => {}}
        onSidebarCollapsedChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Toggle navigation" })).toBeInTheDocument();
  });

  it("describes the wide-screen action from collapsed state", () => {
    render(
      <SidebarTrigger
        sidebarOpen={false}
        sidebarCollapsed={false}
        onSidebarOpenChange={() => {}}
        onSidebarCollapsedChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeInTheDocument();
  });

  it("describes the overlay action from open state", () => {
    mockMatchMedia(true);

    render(
      <SidebarTrigger
        sidebarOpen
        sidebarCollapsed={false}
        onSidebarOpenChange={() => {}}
        onSidebarCollapsedChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeInTheDocument();
  });
});
