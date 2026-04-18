import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AddRestaurantCard } from "@/components/AddRestaurantCard";

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Stub lucide-react Camera icon so it doesn't cause ESM transform issues
jest.mock("lucide-react", () => ({
  Camera: () => <svg data-testid="camera-icon" />,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("AddRestaurantCard", () => {
  const mockCloseCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Add Restaurant heading", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    expect(screen.getByText("Add Restaurant")).toBeInTheDocument();
  });

  it("renders Name, Address and Tel text inputs", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    expect(screen.getByPlaceholderText("Input Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Input Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Input Tel")).toBeInTheDocument();
  });

  it("renders two time inputs for open and close hours", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    const timeInputs = screen
      .getAllByRole("textbox", { hidden: true })
      .filter((el) => (el as HTMLInputElement).type === "time");
    // fallback: query directly
    const allTimeInputs = document.querySelectorAll("input[type='time']");
    expect(allTimeInputs.length).toBe(2);
  });

  it("renders a URL input for the image", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    const imgInput = screen.getByPlaceholderText("Input Image URL") as HTMLInputElement;
    
    expect(imgInput).toBeInTheDocument();
    expect(imgInput.type).toBe("url");
    expect(imgInput.name).toBe("imgsrc");
  });

  it("renders the Add Photo label", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    expect(screen.getByText("Add Photo")).toBeInTheDocument();
  });

  it("renders a Submit button", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    expect(
      screen.getByRole("button", { name: /submit/i })
    ).toBeInTheDocument();
  });

  it("renders the X close button", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    expect(screen.getByRole("button", { name: /x/i })).toBeInTheDocument();
  });

  // ── Close button ───────────────────────────────────────────────────────────

  it("calls closeCard when the X button is clicked", () => {
    render(<AddRestaurantCard closeCard={mockCloseCard} />);
    fireEvent.click(screen.getByRole("button", { name: /x/i }));
    expect(mockCloseCard).toHaveBeenCalledTimes(1);
  });

  // ── Form submission ────────────────────────────────────────────────────────

  it("calls POST /api/restaurants with JSON payload on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    fireEvent.change(screen.getByPlaceholderText("Input Name"), {
      target: { value: "Awesome Bistro", name: "name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Input Address"), {
      target: { value: "456 Elm St", name: "address" },
    });
    fireEvent.change(screen.getByPlaceholderText("Input Tel"), {
      target: { value: "0898765432", name: "tel" },
    });

    // Submit the form directly – React 19 `action` prop fires on submit event
    const form = document
      .querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/restaurants",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("shows a success toast and closes the card on successful creation", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        "Create success!",
        expect.anything()
      );
      expect(mockCloseCard).toHaveBeenCalled();
    });
  });

  it("shows an error toast with the server message when the API returns non-ok", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Restaurant name already exists" }),
    });
    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({
          description: "Restaurant name already exists",
        })
      );
    });
  });

  it("shows a generic error toast on a network failure", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network down"));
    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({ description: "Network down" })
      );
    });
  });

  it("does NOT close the card when creation fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Error" }),
    });
    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    fireEvent.submit(document.querySelector("form") as HTMLFormElement);

    await waitFor(() => {
      expect(mockCloseCard).not.toHaveBeenCalled();
    });
  });

  // ── Fallback Logic ─────────────────────────────────────────────

  it("uses the default 'Failed to create' message when the API response has no message field", async () => {
    const { toast } = require("sonner");
    
    // Mock a failed response with an empty JSON object
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), 
    });

    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({
          // Verifies the "data.message || 'Failed to create'" logic
          description: "Failed to create", 
        })
      );
    });
  });

  it("shows 'Something went wrong.' when the caught error is not an instance of Error", async () => {
    const { toast } = require("sonner");
    
    // Force fetch to reject with a plain string instead of a new Error()
    // This triggers the 'else' branch: err instanceof Error ? ... : "Something went wrong."
    (fetch as jest.Mock).mockRejectedValueOnce("A literal string error");

    render(<AddRestaurantCard closeCard={mockCloseCard} />);

    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({
          description: "Something went wrong.",
        })
      );
    });
  });
});
