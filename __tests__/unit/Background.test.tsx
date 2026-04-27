import React from "react";
import { render } from "@testing-library/react";
import MainBackground, {
  OuterBackground,
  InnerBackground,
} from "@/components/Background";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MainBackground", () => {
  it("renders a fixed full-screen wrapper with negative z-index", () => {
    const { container } = render(<MainBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
    expect(wrapper.className).toMatch(/inset-0/);
    expect(wrapper.className).toMatch(/-z-10/);
  });

  it("renders the BG2 background image", () => {
    const { container } = render(<MainBackground />);
    const imgs = container.querySelectorAll("img");
    const srcs = Array.from(imgs).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/BG2.png");
  });

  it("renders the BG overlay image", () => {
    const { container } = render(<MainBackground />);
    const imgs = container.querySelectorAll("img");
    const srcs = Array.from(imgs).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/BG.png");
  });

  it("renders the gradient overlay div", () => {
    const { container } = render(<MainBackground />);
    const allDivs = container.querySelectorAll("div > div");
    const gradientDiv = Array.from(allDivs).find((el) =>
      el.getAttribute("style")?.includes("linear-gradient")
    );
    expect(gradientDiv).toBeDefined();
  });

  it("renders exactly two images", () => {
    const { container } = render(<MainBackground />);
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });
});

describe("OuterBackground", () => {
  it("renders a fixed, pointer-events-none wrapper with negative z-index", () => {
    const { container } = render(<OuterBackground />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
    expect(wrapper.className).toMatch(/-z-10/);
    expect(wrapper.className).toMatch(/pointer-events-none/);
  });

  it("renders only the BG2 image", () => {
    const { container } = render(<OuterBackground />);
    const imgs = container.querySelectorAll("img");
    expect(imgs).toHaveLength(1);
    expect(imgs[0].getAttribute("src")).toBe("/images/BG2.png");
  });
});

describe("InnerBackground", () => {
  it("renders the Review decorative image", () => {
    const { container } = render(<InnerBackground />);
    const imgs = container.querySelectorAll("img");
    const srcs = Array.from(imgs).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/Review.png");
  });

  it("renders the BG overlay image", () => {
    const { container } = render(<InnerBackground />);
    const imgs = container.querySelectorAll("img");
    const srcs = Array.from(imgs).map((img) => img.getAttribute("src"));
    expect(srcs).toContain("/images/BG.png");
  });

  it("renders the gradient overlay div", () => {
    const { container } = render(<InnerBackground />);
    const allDivs = container.querySelectorAll("div");
    const gradientDiv = Array.from(allDivs).find((el) =>
      el.getAttribute("style")?.includes("linear-gradient")
    );
    expect(gradientDiv).toBeDefined();
  });

  it("renders exactly two images", () => {
    const { container } = render(<InnerBackground />);
    expect(container.querySelectorAll("img")).toHaveLength(2);
  });
});