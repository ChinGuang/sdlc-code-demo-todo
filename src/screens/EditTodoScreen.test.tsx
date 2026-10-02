import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditTodoScreen } from "./EditTodoScreen.js";

afterEach(() => vi.unstubAllGlobals());

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/edit/:id" element={<EditTodoScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EditTodoScreen", () => {
  it("shows loading state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    renderAt("/edit/123");

    expect(screen.getByRole("heading", { name: /edit todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/loading todo/i)).toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 500,
          }),
      ),
    );

    renderAt("/edit/123");

    expect(screen.getByRole("heading", { name: /edit todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  });

  it("renders todo data and allows editing", async () => {
    const todo = {
      id: "123",
      title: "Test todo",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (url: string, options?: any) => {
          if (url.endsWith("/api/todos/123") && options?.method === "PATCH") {
            // Simulate network delay
            return await new Promise<void>(resolve => setTimeout(resolve, 10))
              .then(() => {
                return new Response(
                  JSON.stringify({ ...todo, ...JSON.parse(options.body) }),
                  { status: 200 },
                );
              });
          }
          if (url.endsWith("/api/todos/123")) {
            // Simulate network delay for GET as well
            return await new Promise<void>(resolve => setTimeout(resolve, 10))
              .then(() => {
                return new Response(JSON.stringify(todo), { status: 200 });
              });
          }
          // fallback for other calls
          return await new Promise<void>(resolve => setTimeout(resolve, 10))
            .then(() => {
              return new Response(JSON.stringify({ error: "Not implemented" }), { status: 404 });
            });
        }
      ),
    );

    renderAt("/edit/123");

    expect(screen.getByRole("heading", { name: /edit todo/i })).toBeInTheDocument();
    expect(await screen.findByLabelText(/title/i)).toHaveValue(todo.title);
    expect(screen.getByRole("button", { name: /toggle completed/i })).toBeEnabled();

    // Toggle completed
    const toggleBtn = await screen.findByRole("button", { name: /toggle completed/i });
    // Initially, we expect "Not completed"
    expect(screen.getByText(/^not completed$/i)).toBeInTheDocument();
    await toggleBtn.click();
    expect(await screen.findByLabelText(/title/i)).toHaveValue(todo.title);
    // After one toggle, we expect "Completed"
    expect(await screen.findByText(/^completed$/i)).toBeInTheDocument();

    // Change title
    const titleInput = await screen.findByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: "New title" } });

    // Save
    const saveBtn = await screen.findByRole("button", { name: /save/i });
    await saveBtn.click();
    // Wait for the saving text to disappear
    await waitForElementToBeRemoved(() => screen.getByText(/saving/i));
  });
});