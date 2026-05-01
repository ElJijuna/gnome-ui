import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from "./Link";

describe("Link", () => {
  it("renders an <a> element", () => {
    render(<Link href="#">Click</Link>);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Link href="#">Visit us</Link>);
    expect(screen.getByText("Visit us")).toBeInTheDocument();
  });

  it("renders href", () => {
    render(<Link href="https://gnome.org">GNOME</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://gnome.org");
  });

  describe("external links", () => {
    it("adds target=_blank when external=true", () => {
      render(<Link href="https://gnome.org" external>GNOME</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
    });

    it("adds rel=noopener noreferrer when external=true", () => {
      render(<Link href="https://gnome.org" external>GNOME</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("shows external icon indicator", () => {
      render(<Link href="https://gnome.org" external>GNOME</Link>);
      expect(screen.getByLabelText("(opens in new tab)")).toBeInTheDocument();
    });

    it("also treats target=_blank as external", () => {
      render(<Link href="https://gnome.org" target="_blank">GNOME</Link>);
      expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("does not add external attributes when external is false", () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole("link")).not.toHaveAttribute("target");
    expect(screen.queryByLabelText("(opens in new tab)")).toBeNull();
  });

  it("forwards className", () => {
    render(<Link href="#" className="nav-link">X</Link>);
    expect(screen.getByRole("link")).toHaveClass("nav-link");
  });

  it("forwards data-testid", () => {
    render(<Link href="#" data-testid="lnk">X</Link>);
    expect(screen.getByTestId("lnk")).toBeInTheDocument();
  });
});
