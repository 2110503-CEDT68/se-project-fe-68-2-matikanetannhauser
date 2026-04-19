import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";

// Full composed dialog used in most tests
function TestDialog({
  onAction = jest.fn(),
  onCancel = jest.fn(),
  defaultOpen = false,
}: {
  onAction?: () => void;
  onCancel?: () => void;
  defaultOpen?: boolean;
}) {
  return (
    <AlertDialog defaultOpen={defaultOpen}>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Dialog Title</AlertDialogTitle>
          <AlertDialogDescription>Dialog description text.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog (composed)", () => {
  // ── Closed state ───────────────────────────────────────────────────────────

  it("renders the trigger button", () => {
    render(<TestDialog />);
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("does not show dialog content before the trigger is clicked", () => {
    render(<TestDialog />);
    expect(screen.queryByText("Dialog Title")).not.toBeInTheDocument();
  });

  // ── Open state ─────────────────────────────────────────────────────────────

  it("shows the dialog after the trigger is clicked", async () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Dialog Title")).toBeInTheDocument();
  });

  it("shows the description text after opening", async () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(
      await screen.findByText("Dialog description text.")
    ).toBeInTheDocument();
  });

  it("shows Cancel and Continue buttons after opening", async () => {
    render(<TestDialog />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(await screen.findByText("Cancel")).toBeInTheDocument();
    expect(await screen.findByText("Continue")).toBeInTheDocument();
  });

  it("calls the action handler when Continue is clicked", async () => {
    const onAction = jest.fn();
    render(<TestDialog onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(await screen.findByText("Continue"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("calls the cancel handler when Cancel is clicked", async () => {
    const onCancel = jest.fn();
    render(<TestDialog onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.click(await screen.findByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // ── defaultOpen ────────────────────────────────────────────────────────────

  it("shows dialog content immediately when defaultOpen=true", () => {
    render(<TestDialog defaultOpen />);
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
  });
});

// ── data-slot attributes ───────────────────────────────────────────────────────

describe("AlertDialog sub-component data-slot attributes", () => {
  beforeEach(() => {
    render(<TestDialog defaultOpen />);
  });

  it("AlertDialogTitle has data-slot='alert-dialog-title'", () => {
    expect(
      screen.getByText("Dialog Title").closest("[data-slot='alert-dialog-title']")
    ).toBeInTheDocument();
  });

  it("AlertDialogDescription has data-slot='alert-dialog-description'", () => {
    expect(
      screen
        .getByText("Dialog description text.")
        .closest("[data-slot='alert-dialog-description']")
    ).toBeInTheDocument();
  });

  it("AlertDialogContent has data-slot='alert-dialog-content'", () => {
    expect(
      document.querySelector("[data-slot='alert-dialog-content']")
    ).toBeInTheDocument();
  });

  it("AlertDialogHeader has data-slot='alert-dialog-header'", () => {
    expect(
      document.querySelector("[data-slot='alert-dialog-header']")
    ).toBeInTheDocument();
  });

  it("AlertDialogFooter has data-slot='alert-dialog-footer'", () => {
    expect(
      document.querySelector("[data-slot='alert-dialog-footer']")
    ).toBeInTheDocument();
  });

  it("AlertDialogAction has data-slot='alert-dialog-action'", () => {
    expect(
      document.querySelector("[data-slot='alert-dialog-action']")
    ).toBeInTheDocument();
  });

  it("AlertDialogCancel has data-slot='alert-dialog-cancel'", () => {
    expect(
      document.querySelector("[data-slot='alert-dialog-cancel']")
    ).toBeInTheDocument();
  });
});

// ── AlertDialogContent size prop ───────────────────────────────────────────────

describe("AlertDialogContent size prop", () => {
  it("defaults to data-size='default'", () => {
    render(<TestDialog defaultOpen />);
    expect(
      document.querySelector("[data-slot='alert-dialog-content']")
    ).toHaveAttribute("data-size", "default");
  });

  it("sets data-size='sm' when size='sm' is passed", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent size="sm">
          <AlertDialogTitle>T</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(
      document.querySelector("[data-slot='alert-dialog-content']")
    ).toHaveAttribute("data-size", "sm");
  });
});

// ── AlertDialogMedia ───────────────────────────────────────────────────────────

describe("AlertDialogMedia", () => {
  it("renders children and sets data-slot='alert-dialog-media'", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <span>icon</span>
            </AlertDialogMedia>
            <AlertDialogTitle>T</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(
      document.querySelector("[data-slot='alert-dialog-media']")
    ).toBeInTheDocument();
    expect(screen.getByText("icon")).toBeInTheDocument();
  });
});

// ── AlertDialogAction / AlertDialogCancel variants ────────────────────────────

describe("AlertDialogAction and AlertDialogCancel variants", () => {
  it("AlertDialogAction renders with the default variant by default", () => {
    render(<TestDialog defaultOpen />);
    const action = document.querySelector("[data-slot='alert-dialog-action']");
    // The action button's wrapper Button carries data-variant
    expect(action?.closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "default"
    );
  });

  it("AlertDialogCancel renders with the outline variant by default", () => {
    render(<TestDialog defaultOpen />);
    const cancel = document.querySelector("[data-slot='alert-dialog-cancel']");
    expect(cancel?.closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "outline"
    );
  });

  it("AlertDialogAction accepts a custom variant", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    const action = document.querySelector("[data-slot='alert-dialog-action']");
    expect(action?.closest("[data-variant]")).toHaveAttribute(
      "data-variant",
      "destructive"
    );
  });
});
