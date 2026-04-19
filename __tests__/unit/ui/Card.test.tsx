import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "@/components/ui/Card";
import { RestaurantType } from "@/types/types";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// InteractiveCard → simple wrapper so we can test Card in isolation
jest.mock("@/components/ui/InteractiveCard", () => {
  const Mock = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="interactive-card">{children}</div>
  );
  Mock.displayName = "MockInteractiveCard";
  return Mock;
});

// MUI Rating → readable star count
jest.mock("@mui/material/Rating", () => {
  const MockRating = ({ value }: { value: number }) => (
    <div data-testid="rating" aria-label={`${value} stars`} />
  );
  MockRating.displayName = "MockRating";
  return MockRating;
});

// MUI Box → plain div
jest.mock("@mui/material", () => ({
  Box: ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockRestaurant: RestaurantType = {
  _id: "rest-001" as any,
  name: "Namba",
  address: "123 Main St",
  imgsrc: "/namba.jpg",
  tel: "02-111-1111",
  openTime: "10:00",
  closeTime: "22:00",
};

const ratingMap: Record<string, number> = {
  "rest-001": 4.5,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Card", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders inside an InteractiveCard wrapper", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={ratingMap} />);
    expect(screen.getByTestId("interactive-card")).toBeInTheDocument();
  });

  it("renders the restaurant image with the correct src", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={ratingMap} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/namba.jpg");
  });

  it("renders the SEE MORE button", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={ratingMap} />);
    expect(
      screen.getByRole("button", { name: /see more/i })
    ).toBeInTheDocument();
  });

  it("renders the Rating component", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={ratingMap} />);
    expect(screen.getByTestId("rating")).toBeInTheDocument();
  });

  // ── Rating value ───────────────────────────────────────────────────────────

  it("passes the correct avgStar to Rating when the restaurant is in ratingMap", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={ratingMap} />);
    expect(screen.getByTestId("rating")).toHaveAttribute(
      "aria-label",
      "4.5 stars"
    );
  });

  it("passes 0 to Rating when the restaurant is not in ratingMap", () => {
    render(<Card restaurant={mockRestaurant} ratingMap={{}} />);
    expect(screen.getByTestId("rating")).toHaveAttribute(
      "aria-label",
      "0 stars"
    );
  });

  it("passes 0 to Rating when ratingMap has 0 for this restaurant", () => {
    render(
      <Card restaurant={mockRestaurant} ratingMap={{ "rest-001": 0 }} />
    );
    expect(screen.getByTestId("rating")).toHaveAttribute(
      "aria-label",
      "0 stars"
    );
  });

  // ── Different restaurants ──────────────────────────────────────────────────

  it("uses the correct ratingMap entry for a different restaurant id", () => {
    const other: RestaurantType = {
      ...mockRestaurant,
      _id: "rest-002" as any,
      imgsrc: "/other.jpg",
    };
    const map = { "rest-002": 3 };
    render(<Card restaurant={other} ratingMap={map} />);
    expect(screen.getByTestId("rating")).toHaveAttribute(
      "aria-label",
      "3 stars"
    );
  });

  it("renders a different restaurant's image src", () => {
    const other: RestaurantType = {
      ...mockRestaurant,
      _id: "rest-002" as any,
      imgsrc: "/focus.jpg",
    };
    render(<Card restaurant={other} ratingMap={{}} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/focus.jpg");
  });
});
