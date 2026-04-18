import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AlertRemoveDialog } from "@/components/AlertRemoveDialog";

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Radix AlertDialog uses a portal – jsdom handles portals fine with RTL

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESERVATION_ID = "reservation-abc-123";

function openDialog() {
  // The trigger is the only button initially visible
  fireEvent.click(screen.getByRole("button"));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AlertRemoveDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the trigger button", () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("does NOT show the dialog content before the trigger is clicked", () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    expect(screen.queryByText("Remove Reservation")).not.toBeInTheDocument();
  });

  it("opens the dialog and shows the title when the trigger is clicked", async () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    expect(await screen.findByText("Remove Reservation")).toBeInTheDocument();
  });

  it("shows the confirmation description inside the dialog", async () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    expect(
      await screen.findByText(/This action cannot be undone/)
    ).toBeInTheDocument();
  });

  it("shows Cancel and Continue buttons after opening", async () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    expect(await screen.findByText("Cancel")).toBeInTheDocument();
    expect(await screen.findByText("Continue")).toBeInTheDocument();
  });

  // ── Successful deletion ────────────────────────────────────────────────────

  it("calls DELETE /api/reservations/:id when Continue is clicked", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/reservations/${RESERVATION_ID}`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("shows a success toast after a successful deletion", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Reservation deleted!",
        expect.anything()
      );
    });
  });

  it("calls the optional removeReserve callback after a successful deletion", async () => {
    const mockRemoveReserve = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <AlertRemoveDialog
        id={RESERVATION_ID}
        removeReserve={mockRemoveReserve}
      />
    );
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(mockRemoveReserve).toHaveBeenCalledTimes(1);
    });
  });

  // ── Failed deletion ────────────────────────────────────────────────────────

  it("shows an error toast when the API returns a non-ok response", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Not authorized" }),
    });
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete reservation.",
        expect.objectContaining({ description: "Not authorized" })
      );
    });
  });

  it("shows a generic error toast when fetch throws a network error", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete reservation.",
        expect.objectContaining({ description: "Network error" })
      );
    });
  });

  it("does NOT call removeReserve when the API fails", async () => {
    const mockRemoveReserve = jest.fn();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Server error" }),
    });
    render(
      <AlertRemoveDialog
        id={RESERVATION_ID}
        removeReserve={mockRemoveReserve}
      />
    );
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(mockRemoveReserve).not.toHaveBeenCalled();
    });
  });

  it("uses fallback error message when API returns non-ok without a message", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // No message field
    });
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete reservation.",
        expect.objectContaining({ 
          // This matches the string inside: throw new Error(data.message || "...")
          description: "Failed to delete reservation" 
        })
      );
    });
  });

  it("shows 'Something went wrong.' when the caught error is not an Error object", async () => {
    const { toast } = require("sonner");
    // Mocking a rejection with a plain string instead of new Error()
    (fetch as jest.Mock).mockRejectedValueOnce("Unexpected string error");

    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Continue"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete reservation.",
        expect.objectContaining({ 
          description: "Something went wrong." 
        })
      );
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("does not throw when removeReserve prop is omitted", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    // Should not throw even without the callback
    expect(() =>
      fireEvent.click(screen.getByText("Continue"))
    ).not.toThrow();
  });

  it("does NOT trigger a DELETE call when Cancel is clicked", async () => {
    render(<AlertRemoveDialog id={RESERVATION_ID} />);
    openDialog();
    fireEvent.click(await screen.findByText("Cancel"));

    await waitFor(() => {
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});
