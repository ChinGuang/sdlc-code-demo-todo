import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App.js";
import { MemoryRouter } from "react-router-dom";

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("CreateTodoScreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows initial state", async () => {
    renderAt("/create");

    expect(screen.getByRole("heading", { name: /create todo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("updates title when typing", async () => {
    renderAt("/create");
    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    await userType(input, "Buy milk");
    expect(input).toHaveValue("Buy milk");
  });

  it("shows loading state on submit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    renderAt("/create");
    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    await userType(input, "Buy milk");
    await userClick(screen.getByRole("button", { name: /save/i }));

    const savingText = await screen.findByText(/saving/i);
    expect(savingText).toBeInTheDocument();
    // Save button should be disabled
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });

  it("shows error state when API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve().then(() =>
          new Response(null, {
            status: 400,
          })
        )
      ),
    );

    renderAt("/create");
    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    await userType(input, "Buy milk");
    await userClick(screen.getByRole("button", { name: /save/i }));

    const errorText = await screen.findByText(/could not save/i);
    expect(errorText).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
  });

  it("resets form and hides loading on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "1",
              title: "Buy milk",
              completed: false,
              createdAt: "",
              updatedAt: "",
            }),
        })
      ),
    );

    renderAt("/create");
    const input = screen.getByLabelText(/title/i) as HTMLInputElement;
    await userType(input, "Buy milk");
    await userClick(screen.getByRole("button", { name: /save/i }));

    // Wait for loading to appear
    await screen.findByText(/saving/i);
    // Wait for loading to disappear and input to be cleared (state update)
    await waitFor(() => {
      expect(input).toHaveValue("");
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
    // Wait for navigation to occur (Todos heading appears)
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    });
  });

  it("navigates to todos list when cancel clicked", async () => {
    renderAt("/create");
    await userClick(screen.getByRole("button", { name: /cancel/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    });
  });
});

// Helper functions to simulate user events
async function userType(element: HTMLInputElement, text: string) {
  element.value = "";
  await element.dispatchEvent(new Event("input", { bubbles: true }));
  element.value = text;
  await element.dispatchEvent(new Event("input", { bubbles: true }));
}

async function userClick(element: HTMLElement) {
  await element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}