import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlertRemove } from "@/components/AlertRemove";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Stub the alert-dialog primitives so tests don't need a real DOM portal
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="trigger">{children}</div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="cancel-btn">{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button data-testid="action-btn" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("lucide-react", () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const defaultProps = {
  title: "Delete Item",
  description: "This action cannot be undone.",
  action: jest.fn(),
  children: <button>Open</button>,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AlertRemove", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the trigger children", () => {
    render(<AlertRemove {...defaultProps} />);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders the dialog title", () => {
    render(<AlertRemove {...defaultProps} />);
    expect(screen.getByTestId("dialog-title")).toHaveTextContent("Delete Item");
  });

  it("renders the dialog description", () => {
    render(<AlertRemove {...defaultProps} />);
    expect(screen.getByTestId("dialog-description")).toHaveTextContent(
      "This action cannot be undone."
    );
  });

  it("renders the Delete action button with a trash icon", () => {
    render(<AlertRemove {...defaultProps} />);
    const actionBtn = screen.getByTestId("action-btn");
    expect(actionBtn).toBeInTheDocument();
    expect(actionBtn).toHaveTextContent("Delete");
    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
  });

  // ── Cancel label ───────────────────────────────────────────────────────────

  it("shows 'Cancel' as the default cancel label", () => {
    render(<AlertRemove {...defaultProps} />);
    expect(screen.getByTestId("cancel-btn")).toHaveTextContent("Cancel");
  });

  it("shows a custom cancel label when the cancel prop is provided", () => {
    render(<AlertRemove {...defaultProps} cancel="Go Back" />);
    expect(screen.getByTestId("cancel-btn")).toHaveTextContent("Go Back");
  });

  // ── Confirm label ──────────────────────────────────────────────────────────

  it("always shows 'Delete' on the action button regardless of confirm prop", () => {
    // The component renders <Trash2/> Delete hardcoded — confirm prop is declared but unused in JSX
    render(<AlertRemove {...defaultProps} confirm="Yes, remove" />);
    expect(screen.getByTestId("action-btn")).toHaveTextContent("Delete");
  });

  // ── Action callback ────────────────────────────────────────────────────────

  it("calls the action callback when the Delete button is clicked", () => {
    const action = jest.fn();
    render(<AlertRemove {...defaultProps} action={action} />);
    fireEvent.click(screen.getByTestId("action-btn"));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not call action when the cancel button is clicked", () => {
    const action = jest.fn();
    render(<AlertRemove {...defaultProps} action={action} />);
    fireEvent.click(screen.getByTestId("cancel-btn"));
    expect(action).not.toHaveBeenCalled();
  });

  // ── Custom children ────────────────────────────────────────────────────────

  it("renders arbitrary children as the trigger", () => {
    render(
      <AlertRemove {...defaultProps}>
        <span data-testid="custom-trigger">Remove</span>
      </AlertRemove>
    );
    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
  });
});