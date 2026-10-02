import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTodo, updateTodo } from "../api.js";

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function EditTodoScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setError("Invalid todo id");
      setLoading(false);
      return;
    }
    getTodo(id)
      .then(setTodo)
      .catch((problem: unknown) =>
        setError(problem instanceof Error ? problem.message : String(problem)),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleCompleted = () => {
    setTodo((prev) => {
      if (!prev) return null;
      return { ...prev, completed: !prev.completed };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todo) return;
    setSaving(true);
    setError(null);
    const { title, completed } = todo;
    try {
      await updateTodo(todo.id, { title, completed });
      navigate("/");
    } catch (problem: unknown) {
      setError(
        problem instanceof Error ? problem.message : String(problem),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h1 className="text-4xl font-semibold">Edit Todo</h1>
      {loading ? (
        <p className="mt-4 text-slate-400">Loading todo</p>
      ) : error ? (
        <p className="mt-4 text-slate-400">
          Could not load todo: {error}
        </p>
      ) : todo ? (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className="block mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={todo.title}
              onChange={(e) =>
                setTodo((prev) => {
                  if (!prev) return null;
                  return { ...prev, title: e.target.value };
                })
              }
              disabled={saving}
              className="w-full px-3 py-2 border rounded disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleCompleted}
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition disabled:opacity-50"
            >
              Toggle Completed
            </button>
            <span className="text-slate-400">
              {todo.completed ? "Completed" : "Not completed"}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={saving}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
          {saving && <p className="text-slate-400">Saving...</p>}
          {error && (
            <p className="mt-2 text-slate-400">
              Could not save todo: {error}
            </p>
          )}
        </form>
      ) : (
        <p className="mt-4 text-slate-400">Todo not found.</p>
      )}
    </section>
  );
}