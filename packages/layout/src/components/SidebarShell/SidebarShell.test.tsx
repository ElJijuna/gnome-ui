import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SidebarSection, SidebarItem } from "@gnome-ui/react";
import { SidebarShell } from "./SidebarShell";

describe("SidebarShell", () => {
  it("renders header, navigation children, and footer", () => {
    render(
      <SidebarShell header={<div>Workspace</div>} footer={<div>Ada</div>}>
        <SidebarSection>
          <SidebarItem label="Home" />
        </SidebarSection>
      </SidebarShell>,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });

  it("passes Sidebar props through", () => {
    render(
      <SidebarShell searchable aria-label="Primary navigation">
        <SidebarSection>
          <SidebarItem label="Home" />
        </SidebarSection>
      </SidebarShell>,
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("forwards className to the shell root", () => {
    const { container } = render(<SidebarShell className="custom-sidebar" />);
    expect(container.firstChild).toHaveClass("custom-sidebar");
  });

  it("applies collapsed class to the shell root", () => {
    const { container } = render(<SidebarShell collapsed />);
    expect((container.firstChild as HTMLElement).className).toMatch(/collapsed/);
  });
});
