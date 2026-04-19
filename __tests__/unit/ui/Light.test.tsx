import React from "react";
import { render } from "@testing-library/react";
import Light from "@/components/ui/Light";

describe("Light", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders without crashing", () => {
    expect(() => render(<Light />)).not.toThrow();
  });

  it("renders exactly three coloured dot elements", () => {
    const { container } = render(<Light />);
    const wrapper = container.firstChild;

    const dots = wrapper?.querySelectorAll(":scope > div");
    expect(dots?.length).toBe(3);
  });

  // ── Fixed positioning ──────────────────────────────────────────────────────

  it("renders inside a fixed-positioned wrapper", () => {
    const { container } = render(<Light />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
  });

  // ── Dot colours ───────────────────────────────────────────────────────────

  it("includes a red dot", () => {
    const { container } = render(<Light />);
    const dots = Array.from(container.querySelectorAll("div > div"));
    expect(dots.some((d) => d.className.includes("red"))).toBe(true);
  });

  it("includes a green dot", () => {
    const { container } = render(<Light />);
    const dots = Array.from(container.querySelectorAll("div > div"));
    expect(dots.some((d) => d.className.includes("green"))).toBe(true);
  });

  it("includes a yellow dot", () => {
    const { container } = render(<Light />);
    const dots = Array.from(container.querySelectorAll("div > div"));
    expect(dots.some((d) => d.className.includes("yellow"))).toBe(true);
  });

  // ── Dot shape ─────────────────────────────────────────────────────────────

  it("all three dots have the rounded-full class", () => {
    const { container } = render(<Light />);
    const dots = Array.from(container.querySelectorAll("div > div"));
    expect(dots.every((d) => d.className.includes("rounded-full"))).toBe(true);
  });
});
