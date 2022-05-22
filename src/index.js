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

  if (!user) return response.status(400).json({ error: "User not found!" });

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists)
    response.status(400).json({ error: "Username already exists!" });

  const id = uuidv4();
  const newUser = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).send(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  const todos = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todos);

  return response.status(201).send(todos);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find((todo) => todo.id === id);

  if (!task) return response.status(404).json({ error: "task not found!" });

  task.title = title;
  task.deadline = deadline;

  return response.status(201).send(task);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find((todo) => todo.id === id);

  if (!task) return response.status(404).json({ error: "task not found!" });

  task.done = true;

  response.status(200).send(task);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find((todo) => todo.id === id);

  if (!task) return response.status(404).json({ error: "task not found!" });

  user.todos.splice(task, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
