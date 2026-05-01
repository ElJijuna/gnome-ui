import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WindowTitle } from "./WindowTitle";

describe("WindowTitle", () => {
  it("renders the title", () => {
    render(<WindowTitle title="Files" />);
    expect(screen.getByText("Files")).toBeInTheDocument();
  });

  it("renders the subtitle when provided", () => {
    render(<WindowTitle title="Files" subtitle="/home/user/Documents" />);
    expect(screen.getByText("/home/user/Documents")).toBeInTheDocument();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<WindowTitle title="Files" />);
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("forwards className", () => {
    const { container } = render(<WindowTitle title="X" className="wt" />);
    expect(container.firstChild).toHaveClass("wt");
  });

  it("forwards data-testid", () => {
    render(<WindowTitle title="X" data-testid="wt" />);
    expect(screen.getByTestId("wt")).toBeInTheDocument();
  });
});
