import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";

// ── Helpers ───────────────────────────────────────────────────────────────────

function TestPopover({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Popover defaultOpen={defaultOpen}>
      <PopoverTrigger>Open Popover</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Popover Title</PopoverTitle>
          <PopoverDescription>Helpful description text.</PopoverDescription>
        </PopoverHeader>
        <p>Popover body content</p>
      </PopoverContent>
    </Popover>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Popover (composed)", () => {
  // ── Closed state ───────────────────────────────────────────────────────────

  it("renders the trigger button", () => {
    render(<TestPopover />);
    expect(screen.getByText("Open Popover")).toBeInTheDocument();
  });

  it("does not render popover content before the trigger is clicked", () => {
    render(<TestPopover />);
    expect(screen.queryByText("Popover Title")).not.toBeInTheDocument();
  });

  // ── Open state ─────────────────────────────────────────────────────────────

  it("shows popover content after the trigger is clicked", async () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText("Open Popover"));
    expect(await screen.findByText("Popover Title")).toBeInTheDocument();
  });

  it("shows the description after opening", async () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText("Open Popover"));
    expect(
      await screen.findByText("Helpful description text.")
    ).toBeInTheDocument();
  });

  it("shows arbitrary body content after opening", async () => {
    render(<TestPopover />);
    fireEvent.click(screen.getByText("Open Popover"));
    expect(await screen.findByText("Popover body content")).toBeInTheDocument();
  });

  it("renders open immediately when defaultOpen=true", () => {
    render(<TestPopover defaultOpen />);
    expect(screen.getByText("Popover Title")).toBeInTheDocument();
  });
});

// ── data-slot attributes ───────────────────────────────────────────────────────

describe("Popover sub-component data-slot attributes", () => {
  beforeEach(() => {
    render(<TestPopover defaultOpen />);
  });

  it("PopoverContent sets data-slot='popover-content'", () => {
    expect(
      document.querySelector("[data-slot='popover-content']")
    ).toBeInTheDocument();
  });

  it("PopoverHeader sets data-slot='popover-header'", () => {
    expect(
      document.querySelector("[data-slot='popover-header']")
    ).toBeInTheDocument();
  });

  it("PopoverTitle sets data-slot='popover-title'", () => {
    expect(
      document.querySelector("[data-slot='popover-title']")
    ).toBeInTheDocument();
  });

  it("PopoverDescription sets data-slot='popover-description'", () => {
    expect(
      document.querySelector("[data-slot='popover-description']")
    ).toBeInTheDocument();
  });
});

// ── Individual sub-components ─────────────────────────────────────────────────

describe("PopoverHeader", () => {
  it("renders children", () => {
    render(<PopoverHeader>Header child</PopoverHeader>);
    expect(screen.getByText("Header child")).toBeInTheDocument();
  });

  it("merges a custom className", () => {
    render(<PopoverHeader className="custom-hdr">x</PopoverHeader>);
    expect(
      document.querySelector("[data-slot='popover-header']")
    ).toHaveClass("custom-hdr");
  });
});

describe("PopoverTitle", () => {
  it("renders children", () => {
    render(<PopoverTitle>My title</PopoverTitle>);
    expect(screen.getByText("My title")).toBeInTheDocument();
  });

  it("merges a custom className", () => {
    render(<PopoverTitle className="custom-title">t</PopoverTitle>);
    expect(
      document.querySelector("[data-slot='popover-title']")
    ).toHaveClass("custom-title");
  });
});

describe("PopoverDescription", () => {
  it("renders children", () => {
    render(<PopoverDescription>Some description</PopoverDescription>);
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders as a <p> element", () => {
    const { container } = render(
      <PopoverDescription>desc</PopoverDescription>
    );
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("merges a custom className", () => {
    render(<PopoverDescription className="custom-desc">d</PopoverDescription>);
    expect(
      document.querySelector("[data-slot='popover-description']")
    ).toHaveClass("custom-desc");
  });
});

describe("PopoverAnchor", () => {
  it("renders without crashing inside a Popover", () => {
    expect(() =>
      render(
        <Popover>
          <PopoverAnchor>
            <div>anchor</div>
          </PopoverAnchor>
          <PopoverTrigger>open</PopoverTrigger>
          <PopoverContent>content</PopoverContent>
        </Popover>
      )
    ).not.toThrow();
  });
});
