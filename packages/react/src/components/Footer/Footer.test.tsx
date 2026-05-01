import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders as a <footer> element", () => {
    const { container } = render(<Footer />);
    expect(container.firstChild?.nodeName).toBe("FOOTER");
  });

  it("renders start slot content", () => {
    render(<Footer start={<span>© 2025</span>} />);
    expect(screen.getByText("© 2025")).toBeInTheDocument();
  });

  it("renders end slot content", () => {
    render(<Footer end={<a href="#">Privacy</a>} />);
    expect(screen.getByText("Privacy")).toBeInTheDocument();
  });

  it("renders center children", () => {
    render(<Footer><span>Center</span></Footer>);
    expect(screen.getByText("Center")).toBeInTheDocument();
  });

  it("does not render center wrapper when children is null", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("[class*='center']")).toBeNull();
  });

  it("forwards className", () => {
    const { container } = render(<Footer className="site-footer" />);
    expect(container.firstChild).toHaveClass("site-footer");
  });

  it("forwards data-testid", () => {
    render(<Footer data-testid="footer" />);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
