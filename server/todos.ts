import { prisma } from "./prisma.js";
import { route } from "./app.js";
import type { Express } from "express";

export function registerTodosRoutes(app: Express) {
  app.get(
    "/todos",
    route(async (_request, response) => {
      const todos = await prisma.todo.findMany({
        orderBy: { createdAt: "asc" },
      });
      response.json(todos);
    }),
  );
}