import React from "react";
import { render, screen } from "@testing-library/react";
import MySwiper from "@/components/ui/mySwiper";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Swiper ships as ESM and is incompatible with jsdom. Replace it with a simple
// container that renders all slides so we can test MySwiper's own logic.
jest.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));

jest.mock("swiper/modules", () => ({
  FreeMode: {},
  Autoplay: {},
}));

jest.mock("swiper/css", () => {});
jest.mock("swiper/css/free-mode", () => {});

// next/link → plain <a>
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Card → lightweight stub that just shows the restaurant name
jest.mock("@/components/ui/Card", () => {
  const MockCard = ({
    restaurant,
  }: {
    restaurant: { name: string };
    ratingMap: Record<string, number>;
  }) => <div data-testid="card">{restaurant.name}</div>;
  MockCard.displayName = "MockCard";
  return MockCard;
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockRestaurants = [
  { _id: "r1", name: "Namba", imgsrc: "/a.jpg", address: "", tel: "", openTime: "10:00", closeTime: "22:00" },
  { _id: "r2", name: "Teenoi", imgsrc: "/b.jpg", address: "", tel: "", openTime: "09:00", closeTime: "21:00" },
  { _id: "r3", name: "Focus", imgsrc: "/c.jpg", address: "", tel: "", openTime: "08:00", closeTime: "20:00" },
];

const ratingMap = { r1: 4, r2: 3.5, r3: 5 };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MySwiper", () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders a Swiper container", () => {
    render(<MySwiper restaurants={mockRestaurants} ratingMap={ratingMap} />);
    expect(screen.getByTestId("swiper")).toBeInTheDocument();
  });

  it("renders one SwiperSlide per restaurant", () => {
    render(<MySwiper restaurants={mockRestaurants} ratingMap={ratingMap} />);
    expect(screen.getAllByTestId("swiper-slide")).toHaveLength(
      mockRestaurants.length
    );
  });

  it("renders a Card for each restaurant", () => {
    render(<MySwiper restaurants={mockRestaurants} ratingMap={ratingMap} />);
    expect(screen.getAllByTestId("card")).toHaveLength(mockRestaurants.length);
  });

  it("renders each restaurant's name via its Card", () => {
    render(<MySwiper restaurants={mockRestaurants} ratingMap={ratingMap} />);
    expect(screen.getByText("Namba")).toBeInTheDocument();
    expect(screen.getByText("Teenoi")).toBeInTheDocument();
    expect(screen.getByText("Focus")).toBeInTheDocument();
  });

  // ── Links ──────────────────────────────────────────────────────────────────

  it("wraps each card in a link to /restaurants/:id", () => {
    render(<MySwiper restaurants={mockRestaurants} ratingMap={ratingMap} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/restaurants/r1");
    expect(links[1]).toHaveAttribute("href", "/restaurants/r2");
    expect(links[2]).toHaveAttribute("href", "/restaurants/r3");
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("renders an empty Swiper when restaurants is an empty array", () => {
    render(<MySwiper restaurants={[]} ratingMap={{}} />);
    expect(screen.queryAllByTestId("swiper-slide")).toHaveLength(0);
    expect(screen.getByTestId("swiper")).toBeInTheDocument();
  });

  it("renders a single slide when there is one restaurant", () => {
    render(
      <MySwiper restaurants={[mockRestaurants[0]]} ratingMap={ratingMap} />
    );
    expect(screen.getAllByTestId("swiper-slide")).toHaveLength(1);
    expect(screen.getByText("Namba")).toBeInTheDocument();
  });
});
