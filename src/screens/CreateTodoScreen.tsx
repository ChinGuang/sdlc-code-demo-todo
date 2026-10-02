import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTodo } from "../api.js";

export function CreateTodoScreen() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Wait for the next tick to allow the loading state to render
    await Promise.resolve();
    try {
      await createTodo(title);
      // Reset form and go back to list
      setTitle("");
      setLoading(false);
      navigate("/");
    } catch (problem: unknown) {
      setError(
        problem instanceof Error ? problem.message : String(problem),
      );
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-4xl font-semibold">Create Todo</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="title" className="block mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border rounded disabled:opacity-50"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={loading}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        {loading && <p className="text-slate-400">Saving...</p>}
        {error && (
          <p className="mt-2 text-slate-400">
            Could not save todo: {error}
          </p>
        )}
      </form>
    </section>
  );
}