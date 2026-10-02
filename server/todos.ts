import { prisma } from "./prisma.js";
import { route } from "./app.js";
import type { Express } from "express";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1).max(200),
});

const updateTodoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  completed: z.boolean().optional(),
}).refine((data) => data.title !== undefined || data.completed !== undefined, {
  message: "Must provide at least one field to update",
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

  app.patch(
    "/todos/:id",
    route(async (request, response) => {
      const parseResult = updateTodoSchema.safeParse(request.body);
      if (!parseResult.success) {
        response.status(400).json({ error: "Invalid request body" });
        return;
      }
      const idParam = request.params.id;
      if (typeof idParam !== "string") {
        response.status(400).json({ error: "Invalid todo id" });
        return;
      }
      const id = idParam;
      const todo = await prisma.todo.findUnique({
        where: { id },
      });
      if (!todo) {
        response.status(404).json({ error: "Todo not found" });
        return;
      }
      const data = parseResult.data;
      const updated = await prisma.todo.update({
        where: { id },
        data,
      });
      response.json(updated);
    }),
  );
}