import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppHeader } from "./AppHeader";

describe("AppHeader", () => {
  it("renders a string title", () => {
    render(<AppHeader title="Files" />);
    expect(screen.getByText("Files")).toBeInTheDocument();
  });

  it("renders a subtitle with a string title", () => {
    render(<AppHeader title="Files" subtitle="Home" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders a custom title node", () => {
    render(<AppHeader title={<strong>Custom Title</strong>} />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("renders leading, navigation, search, and actions slots", () => {
    render(
      <AppHeader
        leading={<button type="button">Menu</button>}
        navigation={<div>Views</div>}
        search={<input aria-label="Search" />}
        actions={<button type="button">More</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  it("forwards HTML attributes to the header element", () => {
    render(<AppHeader title="Files" data-testid="app-header" />);
    expect(screen.getByTestId("app-header").tagName).toBe("HEADER");
  });
});
