import React from "react";
import { render, screen } from "@testing-library/react";
import InteractiveCard from "@/components/ui/InteractiveCard";

describe("InteractiveCard", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders children", () => {
    render(<InteractiveCard>Card content</InteractiveCard>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders as a single root <div>", () => {
    const { container } = render(<InteractiveCard>child</InteractiveCard>);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("renders multiple children", () => {
    render(
      <InteractiveCard>
        <p>Line A</p>
        <p>Line B</p>
      </InteractiveCard>
    );
    expect(screen.getByText("Line A")).toBeInTheDocument();
    expect(screen.getByText("Line B")).toBeInTheDocument();
  });

  // ── Styling ────────────────────────────────────────────────────────────────

  it("includes border and rounded classes", () => {
    const { container } = render(<InteractiveCard>child</InteractiveCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/border/);
    expect(card.className).toMatch(/rounded/);
  });

  it("includes a fixed width class (w-[438px])", () => {
    const { container } = render(<InteractiveCard>child</InteractiveCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/w-\[438px\]/);
  });

  it("includes a fixed height class (h-[250px])", () => {
    const { container } = render(<InteractiveCard>child</InteractiveCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/h-\[250px\]/);
  });

  it("includes hover-scale and transition classes for the interactive effect", () => {
    const { container } = render(<InteractiveCard>child</InteractiveCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/hover:scale/);
    expect(card.className).toMatch(/transition/);
  });
});
