import React from "react";
import { render, screen } from "@testing-library/react";
import TopMenu from "@/components/TopMenu";

// 1. Mock next/link to render a simple <a> tag for easier testing
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// 2. Mock getUser directly so next/headers cookies() is never invoked
const mockGetUser = jest.fn();
jest.mock("@/lib/getUser", () => ({
  getUser: () => mockGetUser(),
}));

// Helper to render the async server component
async function renderTopMenu() {
  const ResolvedComponent = await TopMenu();
  return render(ResolvedComponent);
}

describe("TopMenu Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Unauthenticated State (Logged Out)", () => {
    beforeEach(() => {
      // No user — getUser returns null
      mockGetUser.mockResolvedValue(null);
    });

    it("renders core navigation links", async () => {
      await renderTopMenu();

      expect(screen.getByText("HOME")).toBeInTheDocument();
      expect(screen.getByText("RESTAURANT")).toBeInTheDocument();
      expect(screen.getByText("RESERVE")).toBeInTheDocument();
    });

    it("shows Register and Login buttons when logged out", async () => {
      await renderTopMenu();

      const registerLink = screen.getByText("REGISTER").closest("a");
      const loginLink = screen.getByText("LOGIN").closest("a");

      expect(registerLink).toHaveAttribute("href", "/register");
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("does not show the Logout button or username", async () => {
      await renderTopMenu();

      expect(screen.queryByText("LOGOUT")).not.toBeInTheDocument();
    });
  });

  describe("Authenticated State (Logged In)", () => {
    const mockUser = {
      name: "Alice Wonderland",
      email: "alice@test.com",
      role: "user",
    };

    beforeEach(() => {
      // Valid user returned from getUser
      mockGetUser.mockResolvedValue(mockUser);
    });

    it("displays the user's name", async () => {
      await renderTopMenu();

      expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    });

    it("shows the Logout button with correct link", async () => {
      await renderTopMenu();

      const logoutLink = screen.getByText("LOGOUT").closest("a");
      expect(logoutLink).toHaveAttribute("href", "/logout");
    });

    it("does not show Login or Register buttons", async () => {
      await renderTopMenu();

      expect(screen.queryByText("LOGIN")).not.toBeInTheDocument();
      expect(screen.queryByText("REGISTER")).not.toBeInTheDocument();
    });
  });

  describe("Owner Role", () => {
    const mockOwner = {
      name: "Bob Owner",
      email: "bob@test.com",
      role: "owner",
    };

    beforeEach(() => {
      mockGetUser.mockResolvedValue(mockOwner);
    });

    it("shows MY RESTAURANTS link for owner role", async () => {
      await renderTopMenu();

      const myRestaurantsLink = screen.getByText("MY RESTAURANTS").closest("a");
      expect(myRestaurantsLink).toHaveAttribute("href", "/yourRestaurants");
    });
  });
});