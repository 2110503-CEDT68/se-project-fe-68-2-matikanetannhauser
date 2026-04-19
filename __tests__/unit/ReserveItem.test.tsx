import React from "react";
import { render, screen } from "@testing-library/react";
import {
  ReserveItemContainer,
  ReserveItemHeader,
  ReserveItemContent,
} from "@/components/ReserveItem";

// ── ReserveItemContainer ──────────────────────────────────────────────────────

describe("ReserveItemContainer", () => {
  it("renders its children", () => {
    render(<ReserveItemContainer>Hello</ReserveItemContainer>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("applies a custom className alongside the base classes", () => {
    const { container } = render(
      <ReserveItemContainer className="my-custom">child</ReserveItemContainer>
    );
    expect(container.firstChild).toHaveClass("my-custom");
  });

  it("forwards extra HTML div attributes (e.g. data-testid)", () => {
    render(
      <ReserveItemContainer data-testid="container">child</ReserveItemContainer>
    );
    expect(screen.getByTestId("container")).toBeInTheDocument();
  });

  it("applies the gradient background style", () => {
    const { container } = render(
      <ReserveItemContainer>child</ReserveItemContainer>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.background).toContain("linear-gradient");
  });

  it("renders multiple children correctly", () => {
    render(
      <ReserveItemContainer>
        <span>A</span>
        <span>B</span>
      </ReserveItemContainer>
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});

// ── ReserveItemHeader ─────────────────────────────────────────────────────────

describe("ReserveItemHeader", () => {
  it("renders an <h1> with the provided text", () => {
    render(<ReserveItemHeader>My Restaurant</ReserveItemHeader>);
    expect(
      screen.getByRole("heading", { level: 1, name: "My Restaurant" })
    ).toBeInTheDocument();
  });

  it("merges a custom className with the base classes", () => {
    render(<ReserveItemHeader className="extra-class">title</ReserveItemHeader>);
    expect(screen.getByRole("heading")).toHaveClass("extra-class");
  });

  it("renders different text correctly", () => {
    render(<ReserveItemHeader>Namba Restaurant</ReserveItemHeader>);
    expect(screen.getByText("Namba Restaurant")).toBeInTheDocument();
  });
});

// ── ReserveItemContent ────────────────────────────────────────────────────────

describe("ReserveItemContent", () => {
  it("renders a <p> with the provided text", () => {
    render(<ReserveItemContent>Reserved By: John</ReserveItemContent>);
    expect(screen.getByText("Reserved By: John")).toBeInTheDocument();
  });

  it("renders as a <p> element", () => {
    const { container } = render(
      <ReserveItemContent>content</ReserveItemContent>
    );
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("merges a custom className with the base classes", () => {
    const { container } = render(
      <ReserveItemContent className="custom-p">content</ReserveItemContent>
    );
    expect(container.querySelector("p")).toHaveClass("custom-p");
  });

  it("renders time-range text correctly", () => {
    render(
      <ReserveItemContent>
        Reserved Time: 2025-01-01 10:00 - 2025-01-01 12:00
      </ReserveItemContent>
    );
    expect(
      screen.getByText(/Reserved Time: 2025-01-01 10:00/)
    ).toBeInTheDocument();
  });
});
