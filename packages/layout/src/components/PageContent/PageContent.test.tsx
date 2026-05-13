import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageContent } from "./PageContent";

describe("PageContent", () => {
  it("renders children", () => {
    render(<PageContent>Documents</PageContent>);
    expect(screen.getByText("Documents")).toBeInTheDocument();
  });

  it("renders main by default", () => {
    const { container } = render(<PageContent>Documents</PageContent>);
    expect((container.firstChild as HTMLElement).tagName).toBe("MAIN");
  });

  it("supports a custom element", () => {
    const { container } = render(<PageContent as="section">Documents</PageContent>);
    expect((container.firstChild as HTMLElement).tagName).toBe("SECTION");
  });

  it.each(["none", "compact", "normal", "spacious"] as const)(
    "applies %s padding class",
    (padding) => {
      const { container } = render(
        <PageContent padding={padding}>Documents</PageContent>,
      );
      expect((container.firstChild as HTMLElement).className).toMatch(new RegExp(`padding${padding[0].toUpperCase() + padding.slice(1)}`));
    },
  );

  it("does not clamp by default", () => {
    const { container } = render(<PageContent>Documents</PageContent>);
    expect(container.querySelector("[class*='clamp']")).toBeNull();
  });

  it("uses Clamp for named maxWidth", () => {
    const { container } = render(<PageContent maxWidth="md">Documents</PageContent>);
    const clamp = (container.firstChild as HTMLElement).firstElementChild as HTMLElement;
    expect(clamp).not.toBeNull();
    expect(clamp.style.maxWidth).toBe("600px");
  });

  it("uses Clamp for numeric maxWidth", () => {
    const { container } = render(<PageContent maxWidth={720}>Documents</PageContent>);
    const clamp = (container.firstChild as HTMLElement).firstElementChild as HTMLElement;
    expect(clamp.style.maxWidth).toBe("720px");
  });

  it("forwards HTML attributes", () => {
    render(<PageContent data-testid="page">Documents</PageContent>);
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });
});
