const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) return response.status(404).json({ error: "User not found!" });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  if (users.some((user) => user.username === username))
    return response.status(400).json({ error: "User already exists" });

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  user.todos = user.todos.map((todo) =>
    todo.id === id ? { ...todo, title, deadline: new Date(deadline) } : todo
  );

  const newTodo = user.todos.find((todo) => todo.id === id);

  if (!newTodo) return response.status(404).json({ error: "Todo not found" });

  return response.status(200).json(newTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos = user.todos.map((todo) =>
    todo.id === id ? { ...todo, done: true } : todo
  );

  const newTodo = user.todos.find((todo) => todo.id === id);

  if (!newTodo) return response.status(404).json({ error: "Todo not found" });

  return response.status(200).json(newTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const newTodo = user.todos.find((todo) => todo.id === id);

  if (!newTodo) return response.status(404).json({ error: "Todo not found" });

  user.todos = user.todos.filter((todo) => (todo.id === id ? null : todo));

  return response.status(204).json(user.todos);
});

module.exports = app;
