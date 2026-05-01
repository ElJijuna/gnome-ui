import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Add } from "@gnome-ui/icons";
import { StatusPage } from "./StatusPage";

describe("StatusPage", () => {
  it("renders the title", () => {
    render(<StatusPage title="No Results" />);
    expect(screen.getByText("No Results")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<StatusPage title="Empty" description="Try adding something." />);
    expect(screen.getByText("Try adding something.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<StatusPage title="Empty" />);
    expect(screen.queryByText("Try adding something.")).toBeNull();
  });

  it("renders children in the actions area", () => {
    render(
      <StatusPage title="Empty">
        <button>Add Item</button>
      </StatusPage>,
    );
    expect(screen.getByRole("button", { name: "Add Item" })).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(<StatusPage title="Empty" icon={Add} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders iconNode when icon is not provided", () => {
    render(
      <StatusPage title="Empty" iconNode={<img alt="custom icon" src="" />} />,
    );
    expect(screen.getByAltText("custom icon")).toBeInTheDocument();
  });

  it("forwards className", () => {
    const { container } = render(<StatusPage title="X" className="my-status" />);
    expect(container.firstChild).toHaveClass("my-status");
  });

  it("forwards data-testid", () => {
    render(<StatusPage title="X" data-testid="sp" />);
    expect(screen.getByTestId("sp")).toBeInTheDocument();
  });
});
