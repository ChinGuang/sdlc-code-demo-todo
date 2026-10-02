import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TodoScreen } from "./TodoScreen.js";

afterEach(() => vi.unstubAllGlobals());

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <TodoScreen />
    </MemoryRouter>,
  );
}

describe("TodoScreen", () => {
  it("shows loading state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    renderAt("/todos");

    // Header and link always present
    expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/loading todos/i)).toBeInTheDocument();
  });

  it("shows empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify([]), {
            status: 200,
          }),
      ),
    );

    renderAt("/todos");

    expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/no todos/i)).toBeInTheDocument();
  });

  it("shows error state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 500,
          }),
      ),
    );

    renderAt("/todos");

    expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  });

  it("renders todo list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              { id: "1", title: "Buy milk", completed: false, createdAt: "", updatedAt: "" },
              { id: "2", title: "Walk dog", completed: true, createdAt: "", updatedAt: "" },
            ]),
            {
              status: 200,
            },
          ),
      ),
    );

    renderAt("/todos");

    expect(screen.getByRole("heading", { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add todo/i })).toBeInTheDocument();
    expect(await screen.findByText(/buy milk/i)).toBeInTheDocument();
    expect(await screen.findByText(/walk dog/i)).toBeInTheDocument();
  });
});