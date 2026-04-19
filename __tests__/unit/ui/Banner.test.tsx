import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Banner from "@/components/ui/Banner";

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = jest.fn();

// next/image → plain <img> so jsdom doesn't choke on the Next.js internals
jest.mock("next/image", () => {
  const MockImage = ({
    src,
    alt,
    onClick,
    className,
  }: {
    src: string;
    alt: string;
    onClick?: () => void;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onClick={onClick} className={className} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

// MUI Box → plain <div>
jest.mock("@mui/material", () => ({
  Box: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockRestaurants = [
  { name: "Namba", address: "123 Elm St", imgsrc: "/namba.jpg", tel: "02-111-1111" },
  { name: "Teenoi", address: "456 Oak Ave", imgsrc: "/teenoi.jpg", tel: "02-222-2222" },
  { name: "Focus", address: "789 Pine Rd", imgsrc: "/focus.jpg", tel: "02-333-3333" },
];

function mockFetchSuccess(data = mockRestaurants) {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ data }),
  });
}

function mockFetchFailure() {
  (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Banner", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Initial / empty state ──────────────────────────────────────────────────

  it("renders without crashing before data arrives", () => {
    mockFetchSuccess();
    expect(() => render(<Banner />)).not.toThrow();
  });

  it("shows nothing while the API call is in flight", () => {
    // Hang the fetch so the component stays in loading state
    (fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<Banner />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  // ── After data loads ───────────────────────────────────────────────────────

  it("fetches /api/restaurantsADS on mount", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    expect(fetch).toHaveBeenCalledWith("/api/restaurantsADS");
  });

  it("displays the name of the first restaurant after data loads", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() =>
      expect(screen.getByText("Namba")).toBeInTheDocument()
    );
  });

  it("displays the address of the first restaurant", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() =>
      expect(screen.getByText(/123 Elm St/)).toBeInTheDocument()
    );
  });

  it("displays the tel of the first restaurant", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() =>
      expect(screen.getByText(/02-111-1111/)).toBeInTheDocument()
    );
  });

  it("renders the cover image with alt='cover'", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() =>
      expect(screen.getByAltText("cover")).toBeInTheDocument()
    );
  });

  it("sets the image src to the first restaurant's imgsrc", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() =>
      expect(screen.getByAltText("cover")).toHaveAttribute("src", "/namba.jpg")
    );
  });

  // ── Cycling through restaurants ────────────────────────────────────────────

  it("advances to the next restaurant when the image is clicked", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() => screen.getByAltText("cover"));

    fireEvent.click(screen.getByAltText("cover"));

    await waitFor(() =>
      expect(screen.getByText("Teenoi")).toBeInTheDocument()
    );
  });

  it("wraps around to the first restaurant after the last one", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() => screen.getByAltText("cover"));

    const img = screen.getByAltText("cover");
    // Click through all items: 0 → 1 → 2 → wraps to 0
    fireEvent.click(img);
    fireEvent.click(img);
    fireEvent.click(img);

    await waitFor(() =>
      expect(screen.getByText("Namba")).toBeInTheDocument()
    );
  });

  it("updates the image src when cycling restaurants", async () => {
    mockFetchSuccess();
    await act(async () => render(<Banner />));
    await waitFor(() => screen.getByAltText("cover"));

    fireEvent.click(screen.getByAltText("cover"));

    await waitFor(() =>
      expect(screen.getByAltText("cover")).toHaveAttribute(
        "src",
        "/teenoi.jpg"
      )
    );
  });

  // ── Single-item list ───────────────────────────────────────────────────────

  it("stays on the same item when the list has only one entry", async () => {
    const single = [mockRestaurants[0]];
    mockFetchSuccess(single);
    await act(async () => render(<Banner />));
    await waitFor(() => screen.getByText("Namba"));

    fireEvent.click(screen.getByAltText("cover"));

    // Still shows the only item
    expect(screen.getByText("Namba")).toBeInTheDocument();
  });

  // ── API failure ────────────────────────────────────────────────────────────

  it("renders without crashing when the API call fails", async () => {
    mockFetchFailure();
    await act(async () => render(<Banner />));
    // No data → no image or restaurant text
    expect(screen.queryByAltText("cover")).not.toBeInTheDocument();
  });
});
