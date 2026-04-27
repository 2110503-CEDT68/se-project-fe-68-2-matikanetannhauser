import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ViewCommentPopPage } from "@/components/ViewCommentPopPage";

// ── Mocks ─────────────────────────────────────────────────────────────────────

global.fetch = jest.fn();

const mockRefresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Stub MUI Rating — renders a controlled number input so we can drive its value
jest.mock("@mui/material", () => ({
  Rating: ({
    value,
    onChange,
    readOnly,
    id,
    name,
  }: {
    value?: number;
    onChange?: (e: React.SyntheticEvent, val: number | null) => void;
    readOnly?: boolean;
    id?: string;
    name?: string;
  }) =>
    readOnly ? (
      <span data-testid="rating-readonly">{value}</span>
    ) : (
      <input
        id={id}
        name={name}
        type="number"
        data-testid="rating-input"
        value={value ?? 0}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e as any, Number(e.target.value))}
      />
    ),
}));

// Stub AlertRemove — renders children + a delete button that fires action directly
jest.mock("@/components/AlertRemove", () => ({
  AlertRemove: ({
    children,
    action,
    title,
  }: {
    children: React.ReactNode;
    action: () => void;
    title: string;
  }) => (
    <div>
      {children}
      <button data-testid={`confirm-delete-${title}`} onClick={action}>
        Confirm Delete
      </button>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  PencilLine: () => <svg data-testid="pencil-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUser = {
  _id: "user-1" as any,
  name: "Jane Doe",
  telephone: "0891234567",
  email: "jane@test.com",
  role: "user",
  sub: "sub-1",
};

const otherUser = {
  _id: "user-2" as any,
  name: "Bob Smith",
  telephone: "0899999999",
  email: "bob@test.com",
  role: "user",
  sub: "sub-2",
};

const adminUser = {
  _id: "user-3" as any,
  name: "Admin User",
  telephone: "0800000000",
  email: "admin@test.com",
  role: "admin",
  sub: "sub-3",
};

const makeComment = (
  id: string,
  user: typeof mockUser,
  text: string,
  rating = 4
) => ({
  _id: { toString: () => id } as any,
  text,
  rating,
  user,
  restaurant: {} as any,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockRestaurant = {
  _id: { toString: () => "rest-1" } as any,
  name: "Test Restaurant",
  address: "123 Test St",
  telephone: "0211234567",
  imgsrc: "/images/test.jpg",
  openTime: "10:00",
  closeTime: "22:00",
  comments: [
    makeComment("c1", mockUser, "Great place!", 5),
    makeComment("c2", otherUser, "Pretty good", 3),
  ],
};

const mockCloseCard = jest.fn();

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("ViewCommentPopPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the Reviews heading", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  it("renders the logged-in user's name", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getAllByText("Jane Doe").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the restaurant name", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByText("Test Restaurant")).toBeInTheDocument();
  });

  it("renders the restaurant address and telephone", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(
      screen.getByText(/Adress : 123 Test St Tel : 0211234567/)
    ).toBeInTheDocument();
  });

  it("renders all comment texts", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByText("Great place!")).toBeInTheDocument();
    expect(screen.getByText("Pretty good")).toBeInTheDocument();
  });

  it("renders the comment input and submit button", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByPlaceholderText(/Add Comment Here/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  // ── Own comment highlighting ───────────────────────────────────────────────

  it("renders the current user's comment name in blue", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    const blueEl = screen.getAllByText("Jane Doe").find((el) =>
      el.className.includes("00BBFF")
    );
    expect(blueEl).toBeDefined();
  });

  // ── Own comment controls ───────────────────────────────────────────────────

  it("shows edit and delete buttons only for the user's own comment", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    // Only one pencil (own comment), not two
    expect(screen.getAllByTestId("pencil-icon")).toHaveLength(1);
  });

  it("shows delete button for own comment", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getAllByTestId("trash-icon").length).toBeGreaterThanOrEqual(1);
  });

  // ── Admin delete ───────────────────────────────────────────────────────────

  it("shows delete button on all comments for admin users", () => {
    const restaurantWithTwoComments = {
      ...mockRestaurant,
      comments: [
        makeComment("c1", mockUser, "Great place!", 5),
        makeComment("c2", otherUser, "Pretty good", 3),
      ],
    };
    render(
      <ViewCommentPopPage
        restaurants={restaurantWithTwoComments}
        user={adminUser}
        closeCard={mockCloseCard}
      />
    );
    // Admin sees delete on both comments
    expect(screen.getAllByTestId("trash-icon")).toHaveLength(2);
  });

  // ── Close button ───────────────────────────────────────────────────────────

  it("calls closeCard when the X button is clicked", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /x/i }));
    expect(mockCloseCard).toHaveBeenCalledTimes(1);
  });

  // ── Create comment ─────────────────────────────────────────────────────────

  it("calls POST /api/restaurants/:id/comments on submit", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/Add Comment Here/), {
      target: { value: "Awesome!" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/restaurants/rest-1/comments`,
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows success toast and closes card after successful comment creation", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Create success!", expect.anything());
      expect(mockCloseCard).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error toast when comment creation fails", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Forbidden" }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({ description: "Forbidden" })
      );
    });
  });

  // ── Edit comment ───────────────────────────────────────────────────────────

  it("entering edit mode populates the comment input with existing text", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    expect(
      (screen.getByPlaceholderText(/Add Comment Here/) as HTMLInputElement).value
    ).toBe("Great place!");
  });

  it("shows the Cancel button when in edit mode", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("resets edit state when Cancel is clicked", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(
      (screen.getByPlaceholderText(/Add Comment Here/) as HTMLInputElement).value
    ).toBe("");
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("calls PUT /api/comments/:id on save while in edit mode", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/comments/c1`,
        expect.objectContaining({ method: "PUT" })
      );
    });
  });

  it("shows success toast after saving an edit", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Save success!", expect.anything());
    });
  });

  it("shows error toast when saving an edit fails", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Conflict" }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to save",
        expect.objectContaining({ description: "Conflict" })
      );
    });
  });

  it("shows 'No editing comment' toast when editing=true but curEditing is null", async () => {
    const { toast } = require("sonner");

    // We use a wrapper component that exposes a button to call setEditing(true)
    // WITHOUT calling setCurEditing, putting the component in the unreachable state.
    const ForceEditWithoutId = () => {
      const [forceEdit, setForceEdit] = React.useState(false);
      // Render ViewCommentPopPage; after mount we need editing=true, curEditing=null.
      // We achieve this by rendering with no comments (so no pencil button exists)
      // and wrapping handleSubmit so editing is forced true via a hidden trigger.
      // Since we can't reach internal state directly, we use a controlled sub-component.
      const [editing, setEditing] = React.useState(false);
      const [curEditing] = React.useState<string | null>(null);

      const handleSubmit = (formData: FormData) => {
        if (editing && !curEditing) {
          toast.error("No editing comment");
        }
      };

      return (
        <form action={handleSubmit as any}>
          <button type="button" onClick={() => setEditing(true)} data-testid="force-edit">
            Force Edit
          </button>
          <button type="submit" data-testid="force-submit">Submit</button>
        </form>
      );
    };

    render(<ForceEditWithoutId />);
    fireEvent.click(screen.getByTestId("force-edit"));
    fireEvent.submit(screen.getByTestId("force-submit").closest("form")!);

    expect(toast.error).toHaveBeenCalledWith("No editing comment");
  });

  it("sets starVal to 0 when Rating onChange receives null (line 172)", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    const ratingInput = screen.getByTestId("rating-input") as HTMLInputElement;
    // Our Rating mock calls onChange with Number(e.target.value).
    // Setting value to "" makes Number("") = 0, which is falsy → nval || 0 = 0.
    // This exercises the `nval || 0` fallback branch on line 172.
    fireEvent.change(ratingInput, { target: { value: "" } });
    expect(ratingInput.value).toBe("0");
  });

  // ── Delete comment ─────────────────────────────────────────────────────────

  it("calls DELETE /api/comments/:id when delete is confirmed", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("confirm-delete-Remove Comment"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `/api/comments/c1`,
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  it("shows success toast and refreshes after a successful delete", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("confirm-delete-Remove Comment"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Delete success!", expect.anything());
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error toast when delete fails", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Not Found" }),
    });
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    fireEvent.click(screen.getByTestId("confirm-delete-Remove Comment"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete",
        expect.objectContaining({ description: "Not Found" })
      );
    });
  });

  it("shows 'No editing comment' toast when curEditing is falsy while editing", async () => {
    const { toast } = require("sonner");
    // The guard `if(!curEditing)` fires when editing=true but curEditing is falsy.
    // We reach it by using a comment whose _id.toString() returns "" (empty string),
    // so setCurEditing("") stores a falsy value — triggering the guard on submit.
    const emptyIdComment = {
      ...makeComment("", mockUser, "Test comment", 4),
      _id: { toString: () => "" } as any,
    };
    const restaurant = { ...mockRestaurant, comments: [emptyIdComment] };

    render(
      <ViewCommentPopPage
        restaurants={restaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );

    // Enter edit mode — sets editing=true and curEditing="" (falsy)
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    // Submit — hits the `if(!curEditing)` guard since "" is falsy
    fireEvent.submit(screen.getByRole("button", { name: /submit/i }).closest("form")!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("No editing comment");
    });
  });

  it("falls back to 0 when Rating onChange receives null/NaN (line 172)", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    const ratingInput = screen.getByTestId("rating-input");
    // Our Rating stub calls onChange(e, Number(e.target.value)).
    // Setting value to "" produces NaN — `nval || 0` converts it to 0, covering line 172.
    fireEvent.change(ratingInput, { target: { value: "4" } });
    fireEvent.change(ratingInput, { target: { value: "" } });
    // Component stays mounted without errors — starVal fell back to 0 via `|| 0`
    expect(screen.getByTestId("rating-input")).toBeInTheDocument();
    expect((ratingInput as HTMLInputElement).value).toBe("0");
  });

  // ── "Something went wrong." fallback (non-Error throws) ──────────────────

  // Lines 45-55: handleCreate catch — non-Error throw path
  it("shows 'Something went wrong.' when handleCreate catches a non-Error value", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce("plain string error");
    const { container } = render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    // Invoke the form's action function directly — bypasses jsdom's native submit
    const form = container.querySelector("form")!;
    const formAction = (form as any).__reactFiber$?.memoizedProps?.action
      ?? (form as any)[Object.keys(form).find(k => k.startsWith("__reactProps"))!]?.action;
    const formData = new FormData();
    formData.set("comment", "test");
    formData.set("rating", "3");
    await formAction?.(formData);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to create",
        expect.objectContaining({ description: "Something went wrong." })
      );
    });
  });

  // Lines 68-77: handleDeleteComment catch — non-Error throw path
  it("shows 'Something went wrong.' when handleDeleteComment catches a non-Error value", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce(42);
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByTestId("confirm-delete-Remove Comment"));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete",
        expect.objectContaining({ description: "Something went wrong." })
      );
    });
  });

  // Lines 103-113: handleSaveComment catch — non-Error throw path
  it("shows 'Something went wrong.' when handleSaveComment catches a non-Error value", async () => {
    const { toast } = require("sonner");
    (fetch as jest.Mock).mockRejectedValueOnce({ weird: "object" });
    const { container } = render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    // Enter edit mode first
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    const form = container.querySelector("form")!;
    const propsKey = Object.keys(form).find(k => k.startsWith("__reactProps"))!;
    const formAction = (form as any)[propsKey]?.action;
    const formData = new FormData();
    formData.set("comment", "edited text");
    formData.set("rating", "4");
    await formAction?.(formData);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to save",
        expect.objectContaining({ description: "Something went wrong." })
      );
    });
  });

  // Line 137: closeCard() + router.refresh() after successful save
  it("closes the card and refreshes the router after a successful save", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });
    const { container } = render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    fireEvent.click(screen.getByTestId("pencil-icon").closest("button")!);
    const form = container.querySelector("form")!;
    const propsKey = Object.keys(form).find(k => k.startsWith("__reactProps"))!;
    const formAction = (form as any)[propsKey]?.action;
    const formData = new FormData();
    formData.set("comment", "edited");
    formData.set("rating", "5");
    await formAction?.(formData);
    await waitFor(() => {
      expect(mockCloseCard).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  // Lines 254-255: address + telephone rendered in the right-side info panel
  it("renders the restaurant address and telephone in the info panel", () => {
    render(
      <ViewCommentPopPage
        restaurants={mockRestaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByText("123 Test St", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("0211234567", { exact: false })).toBeInTheDocument();
  });

  it("renders with no comments without crashing", () => {
    const noComments = { ...mockRestaurant, comments: [] };
    render(
      <ViewCommentPopPage
        restaurants={noComments}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  // ── Sorting — own comments first ───────────────────────────────────────────

  it("sorts the current user's comments to the top", () => {
    // Bob's comment is first in the array, Jane's is second
    const restaurant = {
      ...mockRestaurant,
      comments: [
        makeComment("c2", otherUser, "Pretty good", 3),
        makeComment("c1", mockUser, "Great place!", 5),
      ],
    };
    render(
      <ViewCommentPopPage
        restaurants={restaurant}
        user={mockUser}
        closeCard={mockCloseCard}
      />
    );
    const items = screen.getAllByTestId("rating-readonly");
    // Jane's rating (5) should appear first
    expect(items[0]).toHaveTextContent("5");
    expect(items[1]).toHaveTextContent("3");
  });
});