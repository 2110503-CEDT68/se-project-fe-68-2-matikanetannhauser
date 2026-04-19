import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddReserveCard } from "@/components/AddReserveCard";

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: "Jane Doe",
        telephone: "0891234567",
      },
    },
    status: "authenticated",
  })),
}));

const mockRestaurant = {
  _id: "rest-123" as any,
  name: "Test Restaurant",
  openTime: "10:00",
  closeTime: "22:00",
};

describe("AddReserveCard", () => {
  const mockCloseCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock behavior
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({
        data: { user: { name: "Jane Doe", telephone: "0891234567" } },
        status: "authenticated"
    });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Add Reservation heading", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByText("Add Reservation")).toBeInTheDocument();
  });

  it("displays the session user's name and telephone", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByText("User: Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Tel: 0891234567")).toBeInTheDocument();
  });

  it("displays the restaurant's available open and close times", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByText(/Available Time: 10:00 - 22:00/)).toBeInTheDocument();
  });

  it("renders the date, start-time and end-time inputs", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByLabelText("Reserve Date:")).toBeInTheDocument();
    expect(screen.getByLabelText("Start:")).toBeInTheDocument();
    expect(screen.getByLabelText("End:")).toBeInTheDocument();
  });

  it("renders the Reserve submit button", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByRole("button", { name: /reserve/i })).toBeInTheDocument();
  });

  it("renders the X close button", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    expect(screen.getByRole("button", { name: /x/i })).toBeInTheDocument();
  });

  it("shows 'Unknown' when openTime / closeTime are undefined", () => {
    const noTimes = { ...mockRestaurant, openTime: undefined as any, closeTime: undefined as any };
    render(<AddReserveCard restaurant={noTimes} closeCard={mockCloseCard} />);
    expect(screen.getByText(/Available Time: Unknown - Unknown/)).toBeInTheDocument();
  });

  // ── Close button ───────────────────────────────────────────────────────────

  it("calls closeCard when the X button is clicked", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    fireEvent.click(screen.getByRole("button", { name: /x/i }));
    expect(mockCloseCard).toHaveBeenCalledTimes(1);
  });

  // ── Successful reservation ─────────────────────────────────────────────────

  it("sends a POST request with the correct payload on Reserve click", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );

    fireEvent.change(screen.getByLabelText("Reserve Date:"), {
      target: { value: "2025-12-01" },
    });
    fireEvent.change(screen.getByLabelText("Start:"), {
      target: { value: "11:00" },
    });
    fireEvent.change(screen.getByLabelText("End:"), {
      target: { value: "13:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/restaurants/${mockRestaurant._id}/reservations`,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startDateTime: "2025-12-01T11:00:00",
            endDateTime: "2025-12-01T13:00:00",
          }),
        })
      );
    });
  });

  it("shows a success toast and closes the card after a successful reservation", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );

    fireEvent.change(screen.getByLabelText("Reserve Date:"), {
      target: { value: "2025-12-01" },
    });
    fireEvent.change(screen.getByLabelText("Start:"), {
      target: { value: "11:00" },
    });
    fireEvent.change(screen.getByLabelText("End:"), {
      target: { value: "13:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Reserve success!",
        expect.anything()
      );
      expect(mockCloseCard).toHaveBeenCalled();
    });
  });

  // ── Failed reservation ─────────────────────────────────────────────────────

  it("shows an error toast with the server message when the API returns non-ok", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Time slot already booked" }),
    });
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to reserve",
        expect.objectContaining({ description: "Time slot already booked" })
      );
    });
  });

  it("shows a generic error toast on a network failure", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network down"));
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to reserve",
        expect.objectContaining({ description: "Network down" })
      );
    });
  });

  it("does NOT close the card when the reservation fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error" }),
    });
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(mockCloseCard).not.toHaveBeenCalled();
    });
  });

  // ── Input state ────────────────────────────────────────────────────────────

  it("updates state as the user types in the date field", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    const dateInput = screen.getByLabelText("Reserve Date:") as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-06-15" } });
    expect(dateInput.value).toBe("2025-06-15");
  });

  it("updates state as the user types in the start-time field", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    const startInput = screen.getByLabelText("Start:") as HTMLInputElement;
    fireEvent.change(startInput, { target: { value: "09:00" } });
    expect(startInput.value).toBe("09:00");
  });

  it("updates state as the user types in the end-time field", () => {
    render(
      <AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />
    );
    const endInput = screen.getByLabelText("End:") as HTMLInputElement;
    fireEvent.change(endInput, { target: { value: "11:30" } });
    expect(endInput.value).toBe("11:30");
  });


   // ── Unexpected Behavior ────────────────────────────────────────────────────────────

   it("renders empty user info when the session is null", () => {
    const { useSession } = require("next-auth/react");
    useSession.mockReturnValue({ data: null, status: "unauthenticated" });

    render(<AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />);
    expect(screen.getByText("User:")).toBeInTheDocument();
    expect(screen.getByText("Tel:")).toBeInTheDocument();
  });

  it("uses the fallback 'Failed to reserve' message when the API provides no message", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />);
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to reserve",
        expect.objectContaining({ description: "Failed to reserve" })
      );
    });
  });

  it("shows 'Something went wrong.' when the caught error is not an Error object", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce("Literal String Error");

    render(<AddReserveCard restaurant={mockRestaurant} closeCard={mockCloseCard} />);
    fireEvent.click(screen.getByRole("button", { name: /reserve/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to reserve",
        expect.objectContaining({ description: "Something went wrong." })
      );
    });
  });
});
