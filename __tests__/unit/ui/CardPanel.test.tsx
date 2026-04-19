import React from "react";
import { render, screen } from "@testing-library/react";

// ── Mocks must be declared before importing the component ─────────────────────

// next/headers
const mockHeadersGet = jest.fn().mockReturnValue(null);
jest.mock("next/headers", () => ({
  headers: () => ({ get: mockHeadersGet }),
}));

// next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// DB + Mongoose – never hit a real database
jest.mock("@/lib/db", () => ({ connectDB: jest.fn() }));
jest.mock("mongoose", () => ({ Types: { ObjectId: jest.fn() } }));

// Comment model – control aggregate output
const mockAggregate = jest.fn();
jest.mock("@/models/comment", () => ({
  __esModule: true,
  default: { aggregate: (...args: unknown[]) => mockAggregate(...args) },
}));

// MySwiper – lightweight stub that shows what it receives
jest.mock("@/components/ui/mySwiper", () => {
  const Mock = ({
    restaurants,
    ratingMap,
  }: {
    restaurants: Array<{ _id: string; name: string }>;
    ratingMap: Record<string, number>;
  }) => (
    <div data-testid="my-swiper">
      {restaurants.map((r) => (
        <span key={r._id} data-testid="swiper-item">
          {r.name}
        </span>
      ))}
    </div>
  );
  Mock.displayName = "MockMySwiper";
  return Mock;
});

// ── Component under test ──────────────────────────────────────────────────────

import CardPanel from "@/components/ui/CardPanel";
import { notFound } from "next/navigation";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockRestaurants = [
  { _id: "r1", name: "Namba" },
  { _id: "r2", name: "Teenoi" },
];

const mockRatings = [
  { _id: "r1", avgStar: 4.5 },
  { _id: "r2", avgStar: 3 },
];

function setupFetch(ok: boolean, data: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => data,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CardPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAggregate.mockResolvedValue(mockRatings);
  });

  // ── Successful render ──────────────────────────────────────────────────────

  it("renders the MySwiper component", async () => {
    setupFetch(true, { data: mockRestaurants });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });

  it("passes all restaurants to MySwiper", async () => {
    setupFetch(true, { data: mockRestaurants });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getAllByTestId("swiper-item")).toHaveLength(
      mockRestaurants.length
    );
  });

  it("renders each restaurant name", async () => {
    setupFetch(true, { data: mockRestaurants });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getByText("Namba")).toBeInTheDocument();
    expect(screen.getByText("Teenoi")).toBeInTheDocument();
  });

  it("connects to the database", async () => {
    setupFetch(true, { data: mockRestaurants });
    const { connectDB } = require("@/lib/db");
    await CardPanel();
    expect(connectDB).toHaveBeenCalled();
  });

  it("runs a Comment.aggregate call to build the rating map", async () => {
    setupFetch(true, { data: mockRestaurants });
    await CardPanel();
    expect(mockAggregate).toHaveBeenCalled();
  });

  it("fetches /api/restaurants", async () => {
    setupFetch(true, { data: mockRestaurants });
    await CardPanel();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/restaurants"),
      expect.anything()
    );
  });

  it("renders inside a fixed wrapper div", async () => {
    setupFetch(true, { data: mockRestaurants });
    const ui = await CardPanel();
    const { container } = render(ui as React.ReactElement);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
  });

  // ── API failure ────────────────────────────────────────────────────────────

  it("calls notFound() when the restaurants API returns non-ok", async () => {
    setupFetch(false, {});
    await CardPanel();
    expect(notFound).toHaveBeenCalled();
  });

  // ── Empty restaurant list ──────────────────────────────────────────────────

  it("renders an empty swiper when the API returns no restaurants", async () => {
    setupFetch(true, { data: [] });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.queryAllByTestId("swiper-item")).toHaveLength(0);
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });

  // ── Cookie forwarding ──────────────────────────────────────────────────────

  it("forwards the request cookie to the fetch call", async () => {
    mockHeadersGet.mockReturnValue("session=abc123");
    setupFetch(true, { data: mockRestaurants });
    await CardPanel();
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ cookie: "session=abc123" }),
      })
    );
  });
});
