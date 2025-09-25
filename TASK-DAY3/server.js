import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const DATA_FILE = path.resolve("./todos.json");

async function readTodos() {
  try {
    const txt = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    // if file doesn't exist, start with empty array
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function saveTodos(todos) {
  await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
}

// --- validation middleware (use for POST/PUT later) ---
function validateTodoMiddleware(req, res, next) {
  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "" || title.length > 200) {
      return res.status(400).json({
        error: { message: "Invalid title", code: "VALIDATION_ERROR" },
      });
    }
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        error: { message: "Invalid completed value", code: "VALIDATION_ERROR" },
      });
    }
  }

  next();
}

// --- Routes required by the task ---

app.get("/api/todos", async (req, res) => {
  const todos = await readTodos();
  res.status(200).json({ items: todos, total: todos.length });
});

// GET /api/todos/:id -> 200 or 404
app.get("/api/todos/:id", async (req, res) => {
  const id = req.params.id;
  const todos = await readTodos();
  const todo = todos.find((t) => t.id.toString() === id);
  if (!todo) {
    return res.status(404).json({ error: { message: "Todo not found", code: "NOT_FOUND" } });
  }
  res.status(200).json(todo);
});

// DELETE /api/todos/:id -> 204 or 404
app.delete("/api/todos/:id", async (req, res) => {
  const id = req.params.id;
  const todos = await readTodos();
  const index = todos.findIndex((t) => t.id.toString() === id);
  if (index === -1) {
    return res.status(404).json({ error: { message: "Todo not found", code: "NOT_FOUND" } });
  }
  todos.splice(index, 1);
  await saveTodos(todos);
  res.status(204).send(); // No Content
});

// (Optional) convenience POST to add new todo for testing — uses validation middleware
app.post("/api/todos", validateTodoMiddleware, async (req, res) => {
  const { title, completed = false } = req.body;
  if (title === undefined) {
    return res.status(400).json({ error: { message: "Invalid title", code: "VALIDATION_ERROR" } });
  }
  const todos = await readTodos();
  const id = Date.now(); // simple unique id
  const newTodo = { id, title: title.trim(), completed };
  todos.push(newTodo);
  await saveTodos(todos);
  res.status(201).json(newTodo);
});

app.listen(PORT, () => {
  console.log(` Todo API listening: http://localhost:${PORT}/api/todos`);
});
