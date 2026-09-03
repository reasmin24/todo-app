"use client";

import { useEffect, useState, type FormEvent } from "react";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  category?: "personal" | "work" | "shopping" | "health" | "other";
};

const STORAGE_KEY = "vercel-todo-app:todos";

function createTodoId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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
  const [category, setCategory] = useState<NonNullable<Todo["category"]>>("personal");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [search, setSearch] = useState("");
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
        id: createTodoId(),
        text: trimmed,
        completed: false,
        createdAt: Date.now(),
        dueDate,
        priority,
        category,
      },
    ]);
    setText("");
    setDueDate("");
    setPriority("medium");
    setCategory("personal");
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
  }).filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));

  const remaining = todos.filter((t) => !t.completed).length;
  const completed = todos.length - remaining;
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const categories = [
    ["personal", "Personal", "✿"],
    ["work", "Work", "▣"],
    ["shopping", "Shopping", "▤"],
    ["health", "Health", "♡"],
    ["other", "Other", "✦"],
  ] as const;

  return (
    <main className="app">
      <header className="topbar">
        <div className="avatar" aria-hidden="true">R</div>
        <div>
          <p className="date-label">{today.toUpperCase()}</p>
          <h1>{greeting}, Rukhsana <span aria-hidden="true">&#10024;</span></h1>
        </div>
        <button className="theme-button" type="button" aria-label="Toggle theme" onClick={() => document.body.classList.toggle("night-mode")}>
          <span aria-hidden="true">&#127769;</span>
        </button>
      </header>

      <section className="progress-card" aria-label="Task progress">
        <div>
          <p className="progress-kicker">{todos.length ? `${remaining} tasks waiting` : "Your board is clear"}</p>
          <h2>{todos.length ? "Keep the momentum going" : "Add your first task"}</h2>
          <span className="done-pill"><span aria-hidden="true">&#10003;</span> {completed} wrapped up</span>
        </div>
        <div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
          <span>{progress}%</span>
        </div>
      </section>

      <section className="composer-card">
        <form className="add-form" onSubmit={addTodo}>
          <div className="form-main">
            <input className="input" type="text" placeholder="What needs to be done?" value={text} onChange={(e) => setText(e.target.value)} aria-label="New todo" autoFocus />
            <button className="btn btn-add" type="submit"><span aria-hidden="true">+</span> Add</button>
          </div>
          <div className="form-options">
            <fieldset className="category-field">
              <legend>Category</legend>
              <div className="category-options">
                {categories.map(([value, label, icon]) => <label key={value} className={`category-option ${category === value ? "selected" : ""}`}><input type="radio" name="category" value={value} checked={category === value} onChange={() => setCategory(value)} /><span>{icon}</span> {label}</label>)}
              </div>
            </fieldset>
            <fieldset className="priority-field">
              <legend>Priority</legend>
              <div className="priority-options">
                {(["low", "medium", "high"] as const).map((level) => <label key={level} className={`priority-option priority-${level} ${priority === level ? "selected" : ""}`}><input type="radio" name="priority" value={level} checked={priority === level} onChange={() => setPriority(level)} /><span className="priority-dot" />{level}</label>)}
              </div>
            </fieldset>
            <label className="date-field"><span>Due date</span><input className="date-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
          </div>
        </form>
      </section>

      <section className="tasks-section">
        <div className="task-toolbar">
          <div className="filters">
            {(["all", "active", "completed"] as const).map((f) => <button key={f} className={`btn btn-filter ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f === "completed" ? "Done" : f[0].toUpperCase() + f.slice(1)}</button>)}
          </div>
          <label className="search-box"><span aria-hidden="true">&#128269;</span><input type="search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search tasks" /></label>
        </div>
        {visibleTodos.length === 0 && (
          <p className="empty">
            {todos.length === 0 ? "Your task list is waiting for its first spark." : "No tasks match this view."}
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
                    {todo.category && <span>{categories.find(([value]) => value === todo.category)?.[2]} {todo.category}</span>}
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
          <button className="btn btn-clear" onClick={clearCompleted}>
            Clear completed
          </button>
        </div>
      </section>
    </main>
  );
}
