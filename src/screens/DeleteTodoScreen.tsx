import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteTodo } from "../api.js";

export function DeleteTodoScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // If id is missing, redirect to todos list
  if (!id) {
    navigate("/");
    return null;
  }

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteTodo(id);
      navigate("/"); // Back to todo list
    } catch (problem: unknown) {
      setError(
        problem instanceof Error ? problem.message : String(problem)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="text-4xl font-semibold">Delete Todo</h1>
      {loading ? (
        <p className="mt-4 text-slate-400">Deleting...</p>
      ) : error ? (
        <p className="mt-4 text-slate-400">
          Could not delete todo: {error}
        </p>
      ) : (
        <>
          <p className="mt-4 text-slate-400">
            Are you sure you want to delete this todo?
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </section>
  );
}