import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GoHome, Add, Edit, Delete } from "@gnome-ui/icons";
import type { AdaptiveNavItem } from "./AdaptiveLayout";
import { AdaptiveLayout } from "./AdaptiveLayout";

// ─── Breakpoint mock ──────────────────────────────────────────────────────────

let mockBreakpoint = { isMobile: false, isTablet: false, isDesktop: true };

vi.mock("@gnome-ui/hooks", () => ({
  useBreakpoint: () => mockBreakpoint,
}));

// jsdom does not implement window.matchMedia — stub it for any internal usage.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEMS: AdaptiveNavItem[] = [
  { id: "home", label: "Home", icon: GoHome },
  { id: "new", label: "New", icon: Add },
  { id: "edit", label: "Edit", icon: Edit },
];

function desktop() {
  mockBreakpoint = { isMobile: false, isTablet: false, isDesktop: true };
}
function tablet() {
  mockBreakpoint = { isMobile: false, isTablet: true, isDesktop: false };
}
function mobile() {
  mockBreakpoint = { isMobile: true, isTablet: false, isDesktop: false };
}

// ─── Desktop / Tablet layout ──────────────────────────────────────────────────

describe("AdaptiveLayout — desktop (sidebar)", () => {
  beforeEach(desktop);

  it("renders a sidebar navigation (not a bottom bar)", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.queryByRole("navigation", { name: "Bottom navigation" })).toBeNull();
    // ViewSwitcherSidebar renders a <nav> containing a <ul role="radiogroup" aria-label="Views">
    expect(screen.getByRole("radiogroup", { name: "Views" })).toBeInTheDocument();
  });

  it("renders all navigation item labels when expanded", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("marks the active item with aria-checked=true", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="new" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    const items = screen.getAllByRole("radio");
    const activeItem = items.find((el) => el.getAttribute("aria-checked") === "true");
    expect(activeItem).toHaveTextContent("New");
  });

  it("calls onValueChange with the item id when clicked", () => {
    const onValueChange = vi.fn();
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={onValueChange}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    fireEvent.click(screen.getByRole("radio", { name: /Edit/i }));
    expect(onValueChange).toHaveBeenCalledWith("edit");
  });

  it("renders children in the content area", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Main content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders the topBar when provided", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        topBar={<header>App Header</header>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("App Header")).toBeInTheDocument();
  });

  it("renders the sidebarHeader when provided", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        sidebarHeader={<div>User Profile</div>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("User Profile")).toBeInTheDocument();
  });

  it("renders the sidebarFooter when provided", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        sidebarFooter={<div>Footer Content</div>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("renders the footer below the content area", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        footer={<div>Page Footer</div>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Page Footer")).toBeInTheDocument();
  });

  it("sidebar is expanded by default on desktop (labels visible)", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("clicking the collapse button hides sidebar labels", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("clicking expand after collapse shows sidebar labels again", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("hides the collapse button when showCollapseButton=false", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        showCollapseButton={false}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.queryByRole("button", { name: /collapse sidebar/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /expand sidebar/i })).toBeNull();
  });

  it("renders grouped items under their group label", () => {
    const groupedItems: AdaptiveNavItem[] = [
      { id: "home", label: "Home", icon: GoHome },
      { id: "new", label: "New", icon: Add, group: "Actions" },
      { id: "edit", label: "Edit", icon: Edit, group: "Actions" },
    ];
    render(
      <AdaptiveLayout items={groupedItems} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  describe("sidebarPlacement=full", () => {
    it("renders without error", () => {
      render(
        <AdaptiveLayout
          items={ITEMS}
          value="home"
          onValueChange={vi.fn()}
          sidebarPlacement="full"
        >
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    it("renders topBar in full placement", () => {
      render(
        <AdaptiveLayout
          items={ITEMS}
          value="home"
          onValueChange={vi.fn()}
          sidebarPlacement="full"
          topBar={<header>Full Header</header>}
        >
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.getByText("Full Header")).toBeInTheDocument();
    });

    it("renders footer in full placement", () => {
      render(
        <AdaptiveLayout
          items={ITEMS}
          value="home"
          onValueChange={vi.fn()}
          sidebarPlacement="full"
          footer={<div>Full Footer</div>}
        >
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.getByText("Full Footer")).toBeInTheDocument();
    });
  });

  describe("background color", () => {
    it("applies no background style when bgColor is omitted", () => {
      const { container } = render(
        <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.style.background).toBe("");
    });

    it("applies rgba background when bgColor is omitted but bgOpacity < 1", () => {
      const { container } = render(
        <AdaptiveLayout
          items={ITEMS}
          value="home"
          onValueChange={vi.fn()}
          bgOpacity={0.5}
        >
          <p>Content</p>
        </AdaptiveLayout>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.style.background).toContain("rgba");
    });

    it("applies color-mix background when bgColor is set", () => {
      const { container } = render(
        <AdaptiveLayout
          items={ITEMS}
          value="home"
          onValueChange={vi.fn()}
          bgColor="blue"
        >
          <p>Content</p>
        </AdaptiveLayout>,
      );
      const root = container.firstChild as HTMLElement;
      expect(root.style.background).toContain("color-mix");
    });
  });
});

// ─── Tablet layout ────────────────────────────────────────────────────────────

describe("AdaptiveLayout — tablet (collapsed sidebar)", () => {
  beforeEach(tablet);

  it("renders sidebar navigation (not a bottom bar)", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.queryByRole("navigation", { name: "Bottom navigation" })).toBeNull();
    // ViewSwitcherSidebar renders a <nav> with an inner <ul role="radiogroup" aria-label="Views">
    expect(screen.getByRole("radiogroup", { name: "Views" })).toBeInTheDocument();
  });

  it("sidebar is collapsed by default on tablet (labels hidden)", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.queryByText("Home")).toBeNull();
  });

  it("clicking expand button shows sidebar labels", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("uses sidebarHeaderCollapsed over sidebarHeader when collapsed", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        sidebarHeader={<div>Full Header</div>}
        sidebarHeaderCollapsed={<div>Icon Only Header</div>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Icon Only Header")).toBeInTheDocument();
    expect(screen.queryByText("Full Header")).toBeNull();
  });

  it("uses sidebarFooterCollapsed over sidebarFooter when collapsed", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        sidebarFooter={<div>Full Footer</div>}
        sidebarFooterCollapsed={<div>Icon Only Footer</div>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Icon Only Footer")).toBeInTheDocument();
    expect(screen.queryByText("Full Footer")).toBeNull();
  });
});

// ─── Mobile layout ────────────────────────────────────────────────────────────

describe("AdaptiveLayout — mobile (bottom bar)", () => {
  beforeEach(mobile);

  it("renders a bottom navigation bar", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByRole("navigation", { name: "Bottom navigation" })).toBeInTheDocument();
    // ViewSwitcherSidebar is not rendered in mobile mode
    expect(screen.queryByRole("radiogroup", { name: "Views" })).toBeNull();
  });

  it("renders all navigation item labels in the bar", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("marks the active item with aria-checked=true", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="edit" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    const items = screen.getAllByRole("radio");
    const activeItem = items.find((el) => el.getAttribute("aria-checked") === "true");
    expect(activeItem).toHaveTextContent("Edit");
  });

  it("calls onValueChange with the item id when a bar item is clicked", () => {
    const onValueChange = vi.fn();
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={onValueChange}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    fireEvent.click(screen.getByRole("radio", { name: /New/i }));
    expect(onValueChange).toHaveBeenCalledWith("new");
  });

  it("renders children in the content area", () => {
    render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Mobile content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Mobile content")).toBeInTheDocument();
  });

  it("renders topBar when provided", () => {
    render(
      <AdaptiveLayout
        items={ITEMS}
        value="home"
        onValueChange={vi.fn()}
        topBar={<header>Mobile Header</header>}
      >
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(screen.getByText("Mobile Header")).toBeInTheDocument();
  });

  it("omits the topBar wrapper when topBar is not provided", () => {
    const { container } = render(
      <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
        <p>Content</p>
      </AdaptiveLayout>,
    );
    expect(container.querySelector("[class*='topBarSlot']")).toBeNull();
  });

  describe("group items", () => {
    const groupedItems: AdaptiveNavItem[] = [
      { id: "home", label: "Home", icon: GoHome },
      { id: "new", label: "New", icon: Add, group: "Tools" },
      { id: "edit", label: "Edit", icon: Edit, group: "Tools" },
    ];

    it("renders a single group button instead of each grouped item", () => {
      render(
        <AdaptiveLayout items={groupedItems} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Tools")).toBeInTheDocument();
      expect(screen.queryByText("New")).toBeNull();
      expect(screen.queryByText("Edit")).toBeNull();
    });

    it("clicking a group button opens a BottomSheet with the group items", () => {
      render(
        <AdaptiveLayout items={groupedItems} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      fireEvent.click(screen.getByRole("radio", { name: /Tools/i }));
      // BottomSheet wraps the dialog in an aria-hidden backdrop, so query with hidden:true
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("selecting an item from the group sheet calls onValueChange and closes sheet", () => {
      const onValueChange = vi.fn();
      render(
        <AdaptiveLayout items={groupedItems} value="home" onValueChange={onValueChange}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      fireEvent.click(screen.getByRole("radio", { name: /Tools/i }));
      fireEvent.click(screen.getByText("New"));
      expect(onValueChange).toHaveBeenCalledWith("new");
    });
  });

  describe("overflow (More button)", () => {
    const manyItems: AdaptiveNavItem[] = [
      { id: "home", label: "Home", icon: GoHome },
      { id: "add", label: "Add", icon: Add },
      { id: "edit", label: "Edit", icon: Edit },
      { id: "delete", label: "Delete", icon: Delete },
      { id: "copy", label: "Copy", icon: GoHome },
    ];

    it("shows a More button when there are more than 4 bar slots", () => {
      render(
        <AdaptiveLayout items={manyItems} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.getByRole("button", { name: "More navigation items" })).toBeInTheDocument();
    });

    it("does not show a More button when there are 4 or fewer bar slots", () => {
      render(
        <AdaptiveLayout items={ITEMS} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      expect(screen.queryByRole("button", { name: "More navigation items" })).toBeNull();
    });

    it("clicking More opens a BottomSheet with the overflow items", () => {
      render(
        <AdaptiveLayout items={manyItems} value="home" onValueChange={vi.fn()}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      fireEvent.click(screen.getByRole("button", { name: "More navigation items" }));
      // BottomSheet wraps the dialog in an aria-hidden backdrop, so query with hidden:true
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();
    });

    it("selecting an overflow item calls onValueChange", () => {
      const onValueChange = vi.fn();
      render(
        <AdaptiveLayout items={manyItems} value="home" onValueChange={onValueChange}>
          <p>Content</p>
        </AdaptiveLayout>,
      );
      fireEvent.click(screen.getByRole("button", { name: "More navigation items" }));
      fireEvent.click(screen.getByText("Delete"));
      expect(onValueChange).toHaveBeenCalledWith("delete");
    });
  });
});
