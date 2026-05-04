import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TabBar, TabItem, TabPanel } from "./index";

describe("Tabs", () => {
  it("renders a tablist with tabs", () => {
    render(
      <TabBar aria-label="Primary sections">
        <TabItem label="General" active panelId="general" />
        <TabItem label="Advanced" panelId="advanced" />
      </TabBar>,
    );

    expect(screen.getByRole("tablist", { name: "Primary sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "General" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Advanced" })).toHaveAttribute("aria-selected", "false");
  });

  it("moves focus with arrow keys", () => {
    render(
      <TabBar>
        <TabItem label="General" active />
        <TabItem label="Advanced" />
        <TabItem label="Network" />
      </TabBar>,
    );

    const general = screen.getByRole("tab", { name: "General" });
    const advanced = screen.getByRole("tab", { name: "Advanced" });
    const network = screen.getByRole("tab", { name: "Network" });

    general.focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(advanced).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "End" });
    expect(network).toHaveFocus();

    fireEvent.keyDown(screen.getByRole("tablist"), { key: "Home" });
    expect(general).toHaveFocus();
  });

  it("skips disabled tabs during keyboard navigation", () => {
    render(
      <TabBar>
        <TabItem label="General" active />
        <TabItem label="Advanced" disabled />
        <TabItem label="Network" />
      </TabBar>,
    );

    const general = screen.getByRole("tab", { name: "General" });
    const network = screen.getByRole("tab", { name: "Network" });

    general.focus();
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });

    expect(network).toHaveFocus();
  });

  it("calls tab click and close handlers independently", () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <TabBar>
        <TabItem label="Document" active onClick={onClick} onClose={onClose} />
      </TabBar>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close tab" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders active and hidden panels", () => {
    render(
      <>
        <TabPanel id="general" active>
          General content
        </TabPanel>
        <TabPanel id="advanced">Advanced content</TabPanel>
      </>,
    );

    expect(screen.getByRole("tabpanel", { name: "" })).toHaveTextContent("General content");
    expect(screen.getByText("Advanced content", { selector: "[role='tabpanel']" })).toHaveAttribute("hidden");
  });
});
