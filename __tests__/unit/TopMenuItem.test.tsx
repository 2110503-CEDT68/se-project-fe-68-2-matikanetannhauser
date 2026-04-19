import React from "react";
import { render, screen } from "@testing-library/react";
import TopMenuItem from "@/components/TopMenuItem";

// Mock next/link so it renders a plain <a> in the test environment
jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    className,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <a href={href} className={className} style={style}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const defaultProps = {
  title: "HOME",
  pageRef: "/",
  cstart: "#E8D9D9",
  cend: "#3A231E",
};

describe("TopMenuItem", () => {
  it("renders the title text", () => {
    render(<TopMenuItem {...defaultProps} />);
    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("renders an <li> as the root element", () => {
    const { container } = render(<TopMenuItem {...defaultProps} />);
    expect(container.firstChild?.nodeName).toBe("LI");
  });

  it("renders a link with the correct href", () => {
    render(<TopMenuItem {...defaultProps} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("uses cstart and cend colours in the gradient background style", () => {
    render(<TopMenuItem {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveStyle({
      background: "linear-gradient(to top right, #E8D9D9, #3A231E)",
    });
  });

  it("renders different title and pageRef correctly", () => {
    render(
      <TopMenuItem
        title="RESERVE"
        pageRef="/reservations"
        cstart="#111111"
        cend="#222222"
      />
    );
    expect(screen.getByText("RESERVE")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/reservations");
  });

  it("renders the LOGIN nav item with the correct sign-in href", () => {
    render(
      <TopMenuItem
        title="LOGIN"
        pageRef="/api/auth/signin"
        cstart="#BBAABF"
        cend="#CD8181"
      />
    );
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/api/auth/signin"
    );
  });

  it("renders the LOGOUT nav item with the correct sign-out href", () => {
    render(
      <TopMenuItem
        title="LOGOUT"
        pageRef="/api/auth/signout"
        cstart="#BBAABF"
        cend="#CD8181"
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/api/auth/signout"
    );
  });
});
