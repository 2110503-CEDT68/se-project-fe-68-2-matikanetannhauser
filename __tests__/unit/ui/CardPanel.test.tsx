import React from "react";
import { render, screen } from "@testing-library/react";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// next/headers – return a controllable cookie value
const mockHeadersGet = jest.fn().mockReturnValue(null);
jest.mock("next/headers", () => ({
  headers: () => Promise.resolve({ get: mockHeadersGet }),
}));

// next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn().mockImplementation(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// @/lib/db and @/models/comment – component no longer uses them directly,
// but they are imported transitively; mock to prevent import errors.
jest.mock("@/lib/db", () => ({ connectDB: jest.fn() }));
jest.mock("@/models/comment", () => ({
  __esModule: true,
  default: { aggregate: jest.fn() },
}));

// MySwiper – lightweight stub that renders restaurant names and exposes props
jest.mock("@/components/ui/mySwiper", () => {
  const Mock = ({
    restaurants,
    ratingMap,
  }: {
    restaurants: Array<{ _id: string; name: string }> | null;
    ratingMap: Record<string, number>;
  }) => (
    <div data-testid="my-swiper" data-rating-map={JSON.stringify(ratingMap)}>
      {(restaurants ?? []).map((r) => (   // ← add ?? []
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
  { _id: "r1", name: "Namba", comments: [{ rating: 4 }, { rating: 5 }] },
  { _id: "r2", name: "Teenoi", comments: [{ rating: 3 }] },
  { _id: "r3", name: "Lucky", comments: [] },
];

/**
 * CardPanel makes TWO fetch calls in order:
 *   1. fetch(NEXTAUTH_URL/api/restaurants)  – proxies the backend, returns restaurants
 *   2. fetch(BACKEND_URL/api/v1/restaurants) – secondary validation fetch
 *
 * Both mocks must be queued so each call gets the right response.
 */
function setupFetch({
  firstOk = true,
  secondOk = true,
  restaurants = mockRestaurants,
}: {
  firstOk?: boolean;
  secondOk?: boolean;
  restaurants?: typeof mockRestaurants;
} = {}) {
  const firstResponse = {
    ok: firstOk,
    status: firstOk ? 200 : 500,
    text: jest.fn().mockResolvedValue("Internal Server Error"),
    json: jest.fn().mockResolvedValue(
      firstOk
        ? { success: true, data: { success: true, count: restaurants.length, data: restaurants } }
        : { success: false, message: "error" }
    ),
  };

  const secondResponse = {
    ok: secondOk,
    status: secondOk ? 200 : 500,
    text: jest.fn().mockResolvedValue("Internal Server Error"),
    json: jest.fn().mockResolvedValue(
      secondOk
        ? { success: true }
        : { success: false }
    ),
  };

  global.fetch = jest.fn()
    .mockResolvedValueOnce(firstResponse)   // FetchData() call
    .mockResolvedValueOnce(secondResponse); // validation fetch call
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("CardPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXTAUTH_URL = "http://localhost:3000";
    process.env.BACKEND_URL = "http://backend:4000";
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the MySwiper component", async () => {
    setupFetch();
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });

  it("passes all restaurants to MySwiper", async () => {
    setupFetch();
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getAllByTestId("swiper-item")).toHaveLength(mockRestaurants.length);
  });

  it("renders each restaurant name", async () => {
    setupFetch();
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.getByText("Namba")).toBeInTheDocument();
    expect(screen.getByText("Teenoi")).toBeInTheDocument();
    expect(screen.getByText("Lucky")).toBeInTheDocument();
  });

  it("renders inside a fixed wrapper div", async () => {
    setupFetch();
    const ui = await CardPanel();
    const { container } = render(ui as React.ReactElement);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/fixed/);
  });

  // ── Fetch calls ────────────────────────────────────────────────────────────

  it("fetches from the NEXTAUTH_URL api/restaurants route", async () => {
    setupFetch();
    await CardPanel();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/restaurants"),
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("fetches from the BACKEND_URL api/v1/restaurants route", async () => {
    setupFetch();
    await CardPanel();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/restaurants"),
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("makes exactly two fetch calls total", async () => {
    setupFetch();
    await CardPanel();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  // ── Cookie forwarding ──────────────────────────────────────────────────────

  it("forwards the incoming cookie to the first fetch call", async () => {
    mockHeadersGet.mockReturnValue("session=abc123");
    setupFetch();
    await CardPanel();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/restaurants"),
      expect.objectContaining({
        headers: expect.objectContaining({ cookie: "session=abc123" }),
      })
    );
  });

  it("sends an empty cookie string when there is no incoming cookie", async () => {
    mockHeadersGet.mockReturnValue(null);
    setupFetch();
    await CardPanel();
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/api/restaurants"),
      expect.objectContaining({
        headers: expect.objectContaining({ cookie: "" }),
      })
    );
  });

  // ── Rating map (computed from embedded comments) ───────────────────────────

  it("computes the average rating from embedded comments", async () => {
    // r1 has comments [4, 5] → avg 4.5; r2 has [3] → avg 3; r3 has [] → avg 0
    setupFetch();
    const ui = await CardPanel();
    const { container } = render(ui as React.ReactElement);
    const swiperEl = container.querySelector("[data-testid='my-swiper']")!;
    const ratingMap = JSON.parse(swiperEl.getAttribute("data-rating-map")!);

    expect(ratingMap["r1"]).toBeCloseTo(4.5);
    expect(ratingMap["r2"]).toBeCloseTo(3);
    expect(ratingMap["r3"]).toBe(0);
  });

  it("uses 0 as the rating for restaurants with no comments", async () => {
    const noCommentRestaurants = [{ _id: "r1", name: "Empty", comments: [] }];
    setupFetch({ restaurants: noCommentRestaurants as typeof mockRestaurants });
    const ui = await CardPanel();
    const { container } = render(ui as React.ReactElement);
    const swiperEl = container.querySelector("[data-testid='my-swiper']")!;
    const ratingMap = JSON.parse(swiperEl.getAttribute("data-rating-map")!);

    expect(ratingMap["r1"]).toBe(0);
  });

  it("handles missing comments field as empty array", async () => {
    const noFieldRestaurants = [{ _id: "r1", name: "NoField" }];
    setupFetch({ restaurants: noFieldRestaurants as typeof mockRestaurants });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    // Should render without throwing
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });

  // ── Empty restaurant list ──────────────────────────────────────────────────

  it("renders an empty swiper when the API returns no restaurants", async () => {
    setupFetch({ restaurants: [] });
    const ui = await CardPanel();
    render(ui as React.ReactElement);
    expect(screen.queryAllByTestId("swiper-item")).toHaveLength(0);
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });

  // ── API failure – second fetch (BACKEND_URL) ───────────────────────────────

  it("calls notFound() when the backend validation fetch returns non-ok", async () => {
    setupFetch({ secondOk: false });
    await expect(CardPanel()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  // ── API failure – first fetch (FetchData) ─────────────────────────────────

  it("throws when the first fetch returns a generic non-ok status", async () => {
    // status 500 → FetchData hits the text() branch and throws
    setupFetch({ firstOk: false });
    await expect(CardPanel()).rejects.toThrow("Fetch failed: 500");
  });

  it("throws Unauthorized when the first fetch returns 401", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, text: jest.fn(), json: jest.fn() })
      .mockResolvedValueOnce({ ok: true, status: 200, text: jest.fn(), json: jest.fn() });
    await expect(CardPanel()).rejects.toThrow("Unauthorized");
  });

  it("throws Forbidden when the first fetch returns 403", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 403, text: jest.fn(), json: jest.fn() })
      .mockResolvedValueOnce({ ok: true, status: 200, text: jest.fn(), json: jest.fn() });
    await expect(CardPanel()).rejects.toThrow("Forbidden");
  });

  it("calls notFound() when the first fetch returns 404", async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 404, text: jest.fn().mockResolvedValue(""), json: jest.fn() });

    await expect(CardPanel()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });

  it("handles null restaurants from the API without crashing", async () => {
    // Simulate the API returning a payload where data.data is null/undefined
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn(),
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { success: true, count: 0, data: null }, // <-- null triggers the ?.
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn(),
        json: jest.fn().mockResolvedValue({ success: true }),
      });

    const ui = await CardPanel();
    render(ui as React.ReactElement);
    // result will be undefined/null, ratingMapObj stays {}, swiper still renders
    expect(screen.getByTestId("my-swiper")).toBeInTheDocument();
  });
});