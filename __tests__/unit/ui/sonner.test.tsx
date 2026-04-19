import React from "react";
import { render } from "@testing-library/react";
import { Toaster } from "@/components/ui/sonner";

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Capture props passed to the underlying Sonner <Toaster>
const mockSonner = jest.fn(() => null);
jest.mock("sonner", () => ({
  Toaster: (props: Record<string, unknown>) => {
    mockSonner(props);
    return null;
  },
}));

// Control the theme returned by next-themes
const mockUseTheme = jest.fn();
jest.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

// Stub lucide icons to avoid ESM transform issues
jest.mock("lucide-react", () => ({
  CircleCheckIcon: () => null,
  InfoIcon: () => null,
  TriangleAlertIcon: () => null,
  OctagonXIcon: () => null,
  Loader2Icon: () => null,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Toaster (sonner wrapper)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ theme: "light" });
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders without crashing", () => {
    expect(() => render(<Toaster />)).not.toThrow();
  });

  // ── Theme forwarding ───────────────────────────────────────────────────────

  it("forwards the current theme to the underlying Sonner Toaster", () => {
    mockUseTheme.mockReturnValue({ theme: "dark" });
    render(<Toaster />);
    expect(mockSonner).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "dark" })
    );
  });

  it("uses 'system' as the theme when useTheme returns undefined", () => {
    mockUseTheme.mockReturnValue({ theme: undefined });
    render(<Toaster />);
    expect(mockSonner).toHaveBeenCalledWith(
      expect.objectContaining({ theme: "system" })
    );
  });

  it.each(["light", "dark", "system"] as const)(
    "correctly forwards theme='%s'",
    (theme) => {
      mockUseTheme.mockReturnValue({ theme });
      render(<Toaster />);
      expect(mockSonner).toHaveBeenCalledWith(
        expect.objectContaining({ theme })
      );
    }
  );

  // ── Custom icons ───────────────────────────────────────────────────────────

  it("passes an icons object to the underlying Sonner Toaster", () => {
    render(<Toaster />);
    const call = mockSonner.mock.calls[0][0] as Record<string, unknown>;
    expect(call).toHaveProperty("icons");
    expect(call.icons).toMatchObject({
      success: expect.anything(),
      info: expect.anything(),
      warning: expect.anything(),
      error: expect.anything(),
      loading: expect.anything(),
    });
  });

  // ── CSS variable style ─────────────────────────────────────────────────────

  it("passes the CSS-variable style object to the underlying Sonner Toaster", () => {
    render(<Toaster />);
    const call = mockSonner.mock.calls[0][0] as Record<string, unknown>;
    expect(call).toHaveProperty("style");
    const style = call.style as Record<string, string>;
    expect(style["--normal-bg"]).toBe("var(--popover)");
    expect(style["--normal-text"]).toBe("var(--popover-foreground)");
    expect(style["--normal-border"]).toBe("var(--border)");
    expect(style["--border-radius"]).toBe("var(--radius)");
  });

  // ── toastOptions ──────────────────────────────────────────────────────────

  it("passes toastOptions with the cn-toast classname", () => {
    render(<Toaster />);
    const call = mockSonner.mock.calls[0][0] as Record<string, unknown>;
    expect(call).toHaveProperty("toastOptions");
    const toastOptions = call.toastOptions as {
      classNames: { toast: string };
    };
    expect(toastOptions.classNames.toast).toBe("cn-toast");
  });

  // ── className ─────────────────────────────────────────────────────────────

  it("always passes className='toaster group' to the underlying Sonner Toaster", () => {
    render(<Toaster />);
    expect(mockSonner).toHaveBeenCalledWith(
      expect.objectContaining({ className: "toaster group" })
    );
  });

  // ── Extra props pass-through ───────────────────────────────────────────────

  it("forwards extra ToasterProps to the underlying Sonner Toaster", () => {
    render(<Toaster position="top-center" richColors />);
    expect(mockSonner).toHaveBeenCalledWith(
      expect.objectContaining({ position: "top-center", richColors: true })
    );
  });
});
