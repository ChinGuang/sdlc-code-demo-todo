import { createApp } from "./app.js";

const app = createApp();

const port = process.env.PORT ?? 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}

export default app;