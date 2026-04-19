import React from "react";
import { render, screen } from "@testing-library/react";
import Container from "@/components/ui/container";

describe("Container", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders children", () => {
    render(<Container>Hello World</Container>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders two nested <div> elements (outer wrapper + inner panel)", () => {
    const { container } = render(<Container>child</Container>);
    const divs = container.querySelectorAll("div");
    expect(divs.length).toBeGreaterThanOrEqual(2);
  });

  it("applies base border and shadow classes to the outer div", () => {
    const { container } = render(<Container>child</Container>);
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toMatch(/border/);
    expect(outer.className).toMatch(/shadow/);
  });

  // ── className merging ──────────────────────────────────────────────────────

  it("merges a custom className onto the outer div", () => {
    const { container } = render(
      <Container className="my-extra-class">child</Container>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer).toHaveClass("my-extra-class");
  });

  it("preserves base classes when a custom className is supplied", () => {
    const { container } = render(
      <Container className="custom">child</Container>
    );
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toMatch(/border/);
  });

  // ── ref forwarding ─────────────────────────────────────────────────────────

  it("forwards a ref to the outer div", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = render(<Container ref={ref}>child</Container>);
    expect(ref.current).toBe(container.firstChild);
  });

  // ── Extra HTML props ───────────────────────────────────────────────────────

  it("forwards extra HTML attributes such as data-testid", () => {
    render(<Container data-testid="my-container">child</Container>);
    expect(screen.getByTestId("my-container")).toBeInTheDocument();
  });

  it("renders multiple children correctly", () => {
    render(
      <Container>
        <span>Alpha</span>
        <span>Beta</span>
      </Container>
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders with no children without throwing", () => {
    expect(() => render(<Container />)).not.toThrow();
  });
});
