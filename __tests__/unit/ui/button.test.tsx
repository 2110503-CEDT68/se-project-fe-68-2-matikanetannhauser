import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders a <button> element by default", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("renders children correctly", () => {
    render(<Button>Save</Button>);
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("sets data-slot='button'", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  // ── Variants ───────────────────────────────────────────────────────────────

  it("applies the default variant class when no variant is supplied", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "default");
  });

  it.each([
    ["default"],
    ["outline"],
    ["secondary"],
    ["ghost"],
    ["destructive"],
    ["link"],
  ] as const)("sets data-variant='%s' for the %s variant", (variant) => {
    render(<Button variant={variant}>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", variant);
  });

  // ── Sizes ──────────────────────────────────────────────────────────────────

  it("applies the default size when no size is supplied", () => {
    render(<Button>x</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");
  });

  it.each([["default"], ["xs"], ["sm"], ["lg"], ["icon"]] as const)(
    "sets data-size='%s'",
    (size) => {
      render(<Button size={size}>x</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("data-size", size);
    }
  );

  // ── Custom className ───────────────────────────────────────────────────────

  it("merges a custom className with the base classes", () => {
    render(<Button className="my-custom-class">x</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });

  // ── Disabled state ─────────────────────────────────────────────────────────

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not fire onClick when disabled", () => {
    const handler = jest.fn();
    render(
      <Button disabled onClick={handler}>
        x
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });

  // ── onClick ────────────────────────────────────────────────────────────────

  it("fires the onClick handler when clicked", () => {
    const handler = jest.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  // ── asChild ────────────────────────────────────────────────────────────────

  it("renders the child element directly when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );
    // Slot.Root merges props onto the <a>; there should be no <button>
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link button" })).toBeInTheDocument();
  });

  // ── buttonVariants helper ──────────────────────────────────────────────────

  it("buttonVariants returns a non-empty string of classes", () => {
    const cls = buttonVariants({ variant: "default", size: "default" });
    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("buttonVariants produces different class strings for different variants", () => {
    const defaultCls = buttonVariants({ variant: "default" });
    const destructiveCls = buttonVariants({ variant: "destructive" });
    expect(defaultCls).not.toBe(destructiveCls);
  });

  it("buttonVariants produces different class strings for different sizes", () => {
    const defaultCls = buttonVariants({ size: "default" });
    const lgCls = buttonVariants({ size: "lg" });
    expect(defaultCls).not.toBe(lgCls);
  });

  // ── Forwarded HTML attributes ──────────────────────────────────────────────

  it("forwards arbitrary HTML attributes such as type and aria-label", () => {
    render(
      <Button type="submit" aria-label="Submit form">
        Submit
      </Button>
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toHaveAttribute("aria-label", "Submit form");
  });
});
