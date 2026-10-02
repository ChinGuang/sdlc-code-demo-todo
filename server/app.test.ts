import request from "supertest";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createApp, route } from "./app.js";
import { prisma } from "./prisma.js";
import { registerTodosRoutes } from "./todos.js";

describe("GET /health", () => {
  it("reports the API and its database", async () => {
    const response = await request(createApp()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "up" });
  });

  it("reports degraded when database is down", async () => {
    vi.spyOn(prisma, "$queryRaw").mockRejectedValueOnce(new Error());
    const app = createApp();
    const response = await request(app).get("/health");
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "degraded", database: "down" });
    vi.restoreAllMocks();
  });

  it("answers 404 for a route that does not exist", async () => {
    const response = await request(createApp()).get("/nope");

    expect(response.status).toBe(404);
  });
});

describe("a body that is not JSON", () => {
  it("answers 400, the client's mistake, saying nothing more", async () => {
    const response = await request(createApp())
      .post("/health")
      .set("Content-Type", "application/json")
      .send("{not json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Bad Request" });
  });
});

describe("a route that throws", () => {
  it("answers 500 without leaking anything about the server (SEC-03)", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const app = createApp((server) =>
      server.get(
        "/boom",
        route(async () => {
          throw new Error("connection string user:hunter2@db");
        }),
      ),
    );

    const response = await request(app).get("/boom");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
    expect(JSON.stringify(response.body)).not.toMatch(/hunter2|at Object|\.ts:/);
    vi.restoreAllMocks();
  });
});

describe("GET /todos", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  afterEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("returns an empty list when there are no todos", async () => {
    const response = await request(createApp(registerTodosRoutes)).get("/todos");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns a list of todos", async () => {
    await prisma.todo.createMany({
      data: [
        { title: "First todo", completed: false },
        { title: "Second todo", completed: true },
      ],
    });

    const response = await request(createApp(registerTodosRoutes)).get("/todos");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    // Check shape of each todo
    const [first, second] = response.body;
    expect(first).toMatchObject({
      id: expect.any(String),
      title: "First todo",
      completed: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(second).toMatchObject({
      id: expect.any(String),
      title: "Second todo",
      completed: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    // Ensure order by createdAt ascending
    expect(new Date(first.createdAt).getTime()).toBeLessThanOrEqual(
      new Date(second.createdAt).getTime(),
    );
  });
});

describe("POST /todos", () => {
  beforeEach(async () => {
    await prisma.todo.deleteMany();
  });

  afterEach(async () => {
    await prisma.todo.deleteMany();
  });

  it("creates a todo with valid title", async () => {
    const response = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send({ title: "Buy milk" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: "Buy milk",
      completed: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("returns 400 when title is missing", async () => {
    const response = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send({})
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });

  it("returns 400 when title is empty string", async () => {
    const response = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send({ title: "" })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });

  it("returns 400 when title exceeds 200 characters", async () => {
    const longTitle = "a".repeat(201);
    const response = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send({ title: longTitle })
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid request body" });
  });

  it("returns 400 when non-JSON body", async () => {
    const response = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send("not json")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Bad Request" });
  });

  it("created todo appears in the list", async () => {
    const createResponse = await request(createApp(registerTodosRoutes))
      .post("/todos")
      .send({ title: "Test todo" })
      .set("Content-Type", "application/json");
    expect(createResponse.status).toBe(201);

    const listResponse = await request(createApp(registerTodosRoutes)).get("/todos");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0]).toMatchObject({
      id: createResponse.body.id,
      title: "Test todo",
      completed: false,
    });
  });
});