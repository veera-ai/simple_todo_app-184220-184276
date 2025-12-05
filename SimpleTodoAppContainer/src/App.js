import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoInput from './components/TodoInput';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './utils/storageKeys';

/**
 * PUBLIC_INTERFACE
 * Root App component for the Simple To-Do application.
 * - Manages theme (light/dark) and persists preference.
 * - Renders the to-do application UI with CRUD, filters, counts, and clear completed.
 * - Uses localStorage for persistence through a custom hook.
 * - Includes optional backend placeholder controlled via REACT_APP_FEATURE_FLAGS.
 */
function App() {
  const featureFlags = useMemo(() => {
    try {
      // Expecting JSON string, fallback to empty object if not set
      const raw = process.env.REACT_APP_FEATURE_FLAGS || '{}';
      return typeof raw === 'string' ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const useBackend = featureFlags?.useBackend === true || featureFlags?.useBackend === 'true';

  // Theme with persistence
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.theme, 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Todos state persisted in localStorage
  const [todos, setTodos] = useLocalStorage(STORAGE_KEYS.todos, []);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'

  // Derived values
  const remainingCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // PUBLIC_INTERFACE
  const addTodo = async (text) => {
    const newTodo = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (useBackend) {
      // Placeholder for future backend integration
      // Example:
      // await fetch(`${process.env.REACT_APP_BACKEND_URL}/todos`, { method: 'POST', body: JSON.stringify(newTodo) })
    }

    setTodos(prev => [newTodo, ...prev]);
  };

  // PUBLIC_INTERFACE
  const toggleTodo = async (id) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t))
    );
  };

  // PUBLIC_INTERFACE
  const editTodo = async (id, newText) => {
    const text = newText.trim();
    if (!text) return;
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, text, updatedAt: Date.now() } : t)));
  };

  // PUBLIC_INTERFACE
  const deleteTodo = async (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // PUBLIC_INTERFACE
  const clearCompleted = async () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }, [todos, filter]);

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <div className="container">
          <h1 className="title">Simple To-Do</h1>
          <p className="subtitle">Stay organized. Track what matters.</p>

          <TodoInput onAdd={addTodo} />

          <div className="controls" role="group" aria-label="Filter todos">
            <div className="filters">
              <button
                className={`btn ${filter === 'all' ? 'btn-active' : ''}`}
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
              >
                All
              </button>
              <button
                className={`btn ${filter === 'active' ? 'btn-active' : ''}`}
                onClick={() => setFilter('active')}
                aria-pressed={filter === 'active'}
              >
                Active
              </button>
              <button
                className={`btn ${filter === 'completed' ? 'btn-active' : ''}`}
                onClick={() => setFilter('completed')}
                aria-pressed={filter === 'completed'}
              >
                Completed
              </button>
            </div>
            <div className="meta">
              <span className="count" aria-live="polite">
                {remainingCount} {remainingCount === 1 ? 'item' : 'items'} left
              </span>
              <button
                className="btn btn-danger"
                onClick={clearCompleted}
                disabled={todos.length === remainingCount}
                title="Clear completed tasks"
              >
                Clear Completed
              </button>
            </div>
          </div>

          <TodoList
            todos={filteredTodos}
            onToggle={toggleTodo}
            onEdit={editTodo}
            onDelete={deleteTodo}
          />

          {useBackend && (
            <div className="backend-banner" role="note">
              Backend mode placeholder active (no API calls yet).
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
