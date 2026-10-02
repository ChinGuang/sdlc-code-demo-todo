import { Link, Route, Routes } from "react-router-dom";
import { HealthScreen } from "./screens/HealthScreen.js";
import { TodoScreen } from "./screens/TodoScreen.js";
import { CreateTodoScreen } from "./screens/CreateTodoScreen.js";

/**
 * Every screen of the UI Spec is a Route here, and screens move between each
 * other with <Link> or useNavigate. The Router itself is in main.tsx, so a
 * test can render this inside a MemoryRouter (see App.test.tsx).
 */
export function App() {
  return (
    <div className="min-h-screen bg-slate-950 p-16 text-slate-100">
      <nav className="mb-8 flex gap-4 text-sm text-slate-400">
        <Link to="/">Todos</Link>
        <Link to="/health">Health Check</Link>
        <Link to="/create">Create Todo</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<TodoScreen />} />
          <Route path="/health" element={<HealthScreen />} />
          <Route path="/create" element={<CreateTodoScreen />} />
          <Route path="*" element={<p>This page does not exist.</p>} />
        </Routes>
      </main>
    </div>
  );
}
