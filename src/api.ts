/** The only way the app talks to the API (STRUCT-01). */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`/api${path}`);
  if (!response.ok) throw new Error(`GET ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export async function postJson<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`POST ${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export type Health = { status: "ok" | "degraded"; database: "up" | "down" };

export const getHealth = () => getJson<Health>("/health");

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export const createTodo = (title: string) => postJson<Todo>("/todos", { title });

export const updateTodo = (id: string, updates: Partial<Pick<Todo, "title" | "completed">>) =>
  fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`PATCH /todos/${id} failed: ${response.status}`);
      return (await response.json()) as Todo;
    });

export const getTodo = (id: string) => getJson<Todo>(`/todos/${id}`);

export const deleteTodo = (id: string) =>
  fetch(`/api/todos/${id}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`DELETE /todos/${id} failed: ${response.status}`);
      // 204 No Content, no JSON body
    });
