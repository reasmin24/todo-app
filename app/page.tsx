"use client";

import { useEffect, useState, type FormEvent } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
};

const STORAGE_KEY = "vercel-todo-app:todos";

function loadTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<NonNullable<Todo["priority"]>>("medium");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  function addTodo(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        dueDate,
        priority,
      },
    ]);
    setText("");
    setDueDate("");
    setPriority("medium");
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function clearCompleted() {
    setTodos((prev) => prev.filter((t) => !t.completed));
  }

  const visibleTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="app">
      <div className="brand-lockup">
        <div className="logo-mark" aria-label="Rukhsana To Do logo">
          <span className="logo-check" aria-hidden="true">&#10003;</span>
          <span className="logo-heart" aria-hidden="true">&#9825;</span>
        </div>
        <h1 className="title">Rukhsana To Do APP!</h1>
      </div>

      <div className="card">
        <form className="add-form" onSubmit={addTodo}>
          <div className="form-main">
            <input
              className="input"
              type="text"
              placeholder="What needs to be done?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              aria-label="New todo"
              autoFocus
            />
            <label className="date-field">
              <span>Due date</span>
              <input
                className="date-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>
          <fieldset className="priority-field">
            <legend>Priority</legend>
            <div className="priority-options">
              {(["low", "medium", "high"] as const).map((level) => (
                <label key={level} className={`priority-option priority-${level}`}>
                  <input
                    type="radio"
                    name="priority"
                    value={level}
                    checked={priority === level}
                    onChange={() => setPriority(level)}
                  />
                  {level}
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-add" type="submit">
            Add
          </button>
        </form>

        {visibleTodos.length === 0 && (
          <p className="empty">
            {todos.length === 0 ? "Nothing here yet. Add your first todo above!" : "No todos match this filter."}
          </p>
        )}

        <ul className="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span className="todo-details">
                  <span className={`todo-text ${todo.completed ? "done" : ""}`}>{todo.text}</span>
                  <span className="todo-meta">
                    {todo.dueDate && <span>Due {todo.dueDate}</span>}
                    {todo.priority && <span className={`priority-badge priority-${todo.priority}`}>{todo.priority}</span>}
                  </span>
                </span>
              </label>
              <button
                className="btn btn-delete"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete ${todo.text}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="footer">
          <span>
            {remaining} {remaining === 1 ? "item" : "items"} left
          </span>
          <div className="filters">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                className={`btn btn-filter ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="btn btn-clear" onClick={clearCompleted}>
            Clear completed
          </button>
        </div>
      </div>

      <p className="hint">Todos are saved in your browser (localStorage).</p>
    </main>
  );
}
