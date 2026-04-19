import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RestaurantAlertRemove } from "@/components/RestaurantAlertRemove";

// Radix AlertDialog uses portals; RTL handles portals automatically.

describe("RestaurantAlertRemove", () => {
  const mockHandleDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the DELETE trigger button", () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    expect(
      screen.getByRole("button", { name: /delete/i })
    ).toBeInTheDocument();
  });

  it("does NOT show the dialog content before the trigger is clicked", () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    expect(screen.queryByText("Remove Restaurant")).not.toBeInTheDocument();
  });

  it("opens the confirmation dialog when DELETE is clicked", async () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(await screen.findByText("Remove Restaurant")).toBeInTheDocument();
  });

  it("shows the warning description in the dialog", async () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(
      await screen.findByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });

  it("shows Cancel and Continue buttons inside the dialog", async () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(await screen.findByText("Cancel")).toBeInTheDocument();
    expect(await screen.findByText("Continue")).toBeInTheDocument();
  });

  // ── Interactions ───────────────────────────────────────────────────────────

  it("calls handleDelete when Continue is clicked", async () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });
  });

  it("does NOT call handleDelete when Cancel is clicked", async () => {
    render(<RestaurantAlertRemove handleDelete={mockHandleDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(await screen.findByText("Cancel"));

    await waitFor(() => {
      expect(mockHandleDelete).not.toHaveBeenCalled();
    });
  });
});
