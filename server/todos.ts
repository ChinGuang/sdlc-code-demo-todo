import { prisma } from "./prisma.js";
import { route } from "./app.js";
import type { Express } from "express";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
});

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

  app.post(
    "/todos",
    route(async (request, response) => {
      const parseResult = createTodoSchema.safeParse(request.body);
      if (!parseResult.success) {
        response.status(400).json({ error: "Invalid request body" });
        return;
      }
      const { title } = parseResult.data;
      const todo = await prisma.todo.create({
        data: { title },
      });
      response.status(201).json(todo);
    }),
  );
}