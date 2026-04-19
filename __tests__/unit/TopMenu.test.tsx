import React from "react";
import { render, screen } from "@testing-library/react";
import TopMenu from "@/components/TopMenu";

// 1. Mock next/link to render a simple <a> tag for easier testing
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// 2. Mock next-auth COMPLETELY (Avoid jest.requireActual)
const mockGetServerSession = jest.fn();
jest.mock("next-auth", () => ({
  getServerSession: () => mockGetServerSession(),
}));

// Mock the auth options to avoid path resolution errors
jest.mock("@/lib/auth", () => ({
  authOptions: {},
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
      // Mock getServerSession returning null (no user)
      mockGetServerSession.mockResolvedValue(null);
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
      expect(loginLink).toHaveAttribute("href", "/api/auth/signin");
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
    };

    beforeEach(() => {
      // Mock getServerSession returning a valid session
      mockGetServerSession.mockResolvedValue({ user: mockUser });
    });

    it("displays the user's name", async () => {
      await renderTopMenu();
      expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    });

    it("shows the Logout button with correct link", async () => {
      await renderTopMenu();
      const logoutLink = screen.getByText("LOGOUT").closest("a");
      expect(logoutLink).toHaveAttribute("href", "/api/auth/signout");
    });

    it("does not show Login or Register buttons", async () => {
      await renderTopMenu();
      expect(screen.queryByText("LOGIN")).not.toBeInTheDocument();
      expect(screen.queryByText("REGISTER")).not.toBeInTheDocument();
    });
  });
});