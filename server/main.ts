import { createApp } from "./app.js";
import { registerTodosRoutes } from "./todos.js";

const app = createApp(registerTodosRoutes);

const port = process.env.PORT ?? 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}

export default app;