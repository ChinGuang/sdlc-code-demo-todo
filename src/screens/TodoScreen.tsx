import { useEffect, useState } from "react";
import { getJson } from "../api.js";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function TodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<Todo[]>("/todos")
      .then(setTodos)
      .catch((problem: unknown) =>
        setError(problem instanceof Error ? problem.message : String(problem)),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h1 className="text-4xl font-semibold">Todos</h1>
        <p className="mt-4 text-slate-400">Loading todos...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h1 className="text-4xl font-semibold">Todos</h1>
        <p className="mt-4 text-slate-400">
          Could not load todos: {error}
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-4xl font-semibold">Todos</h1>
      {todos.length === 0 ? (
        <p className="mt-4 text-slate-400">No todos yet.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center gap-3 p-2 bg-slate-800 rounded">
              <input
                type="checkbox"
                checked={todo.completed}
                readOnly
                className="h-4 w-4"
              />
              <span className={todo.completed ? "line-through" : ""}>
                {todo.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}