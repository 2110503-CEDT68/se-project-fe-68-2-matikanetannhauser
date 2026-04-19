import React from "react";
import { render, screen } from "@testing-library/react";
import Logo from "@/components/Logo";

describe("Logo", () => {
  it("renders an <img> element", () => {
    render(<Logo />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("points to the correct logo image path", () => {
    render(<Logo />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/images/logo.png");
  });

  it("renders inside a fixed-position wrapper", () => {
    const { container } = render(<Logo />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
  });
});
