'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../providers/AuthProvider';

type Task = {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate?: string;
  location: string;
  attachments: string[];
};

type Weather = {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
};

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  location: '',
};

export default function Dashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    fromDate: '',
    toDate: '',
  });

  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<FileList | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [weather, setWeather] = useState<Record<string, Weather | null>>({});

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  async function loadTasks() {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '6',
      });

      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.fromDate) params.set('fromDate', filters.fromDate);
      if (filters.toDate) params.set('toDate', filters.toDate);

      const data = await apiFetch(`/tasks?${params.toString()}`, {}, token);

      setTasks(data.tasks);
      setPages(data.pagination.pages || 1);
      setTotal(data.pagination.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) loadTasks();
  }, [token, page, filters.status, filters.priority, filters.fromDate, filters.toDate]);

  async function saveTask(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const body = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) body.append(key, value);
      });

      if (files) {
        Array.from(files).forEach((file) => body.append('files', file));
      }

      const path = editingId ? `/tasks/${editingId}` : '/tasks';

      await apiFetch(
        path,
        {
          method: editingId ? 'PATCH' : 'POST',
          body,
        },
        token,
      );

      setForm(emptyForm);
      setFiles(null);
      setEditingId(null);
      setMessage(editingId ? 'Task updated' : 'Task created');
      await loadTasks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function editTask(task: Task) {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      location: task.location,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteTask(id: string) {
    if (!token) return;
    if (!window.confirm('Delete this task?')) return;

    try {
      await apiFetch(`/tasks/${id}`, { method: 'DELETE' }, token);
      await loadTasks();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function markDone(task: Task) {
    if (!token) return;

    const body = new FormData();
    body.append('status', 'done');

    try {
      await apiFetch(`/tasks/${task._id}`, { method: 'PATCH', body }, token);
      await loadTasks();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function getWeather(task: Task) {
    if (!token) return;

    setWeather((current) => ({ ...current, [task._id]: null }));

    try {
      const data = await apiFetch(
        `/weather?location=${encodeURIComponent(task.location)}`,
        {},
        token,
      );
      setWeather((current) => ({ ...current, [task._id]: data }));
    } catch (err: any) {
      setError(err.message);
      setWeather((current) => ({ ...current, [task._id]: null }));
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setFiles(null);
  }

  if (authLoading || !user) {
    return <div className="center">Loading...</div>;
  }

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <strong>Task Manager</strong>
          <div>
            Welcome, {user.name}{' '}
            <button
              className="btn secondary"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container" style={{ padding: '24px 0' }}>
        <section className="card" style={{ marginBottom: 18 }}>
          <h2>{editingId ? 'Edit task' : 'Create task'}</h2>

          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}

          <form onSubmit={saveTask}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  placeholder="Lucknow"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="todo">To do</option>
                  <option value="in-progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Attachments</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="actions">
              <button className="btn" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update task' : 'Create task'}
              </button>

              {editingId && (
                <button type="button" className="btn secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2>Tasks ({total})</h2>

          <div className="filters">
            <select
              value={filters.status}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, status: e.target.value });
              }}
            >
              <option value="">All status</option>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, priority: e.target.value });
              }}
            >
              <option value="">All priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, fromDate: e.target.value });
              }}
            />

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => {
                setPage(1);
                setFilters({ ...filters, toDate: e.target.value });
              }}
            />
          </div>

          {loading && <p>Loading tasks...</p>}

          {!loading && tasks.length === 0 && (
            <div className="card">No tasks found.</div>
          )}

          <div className="grid">
            {tasks.map((task) => (
              <article className="card" key={task._id}>
                <h3>{task.title}</h3>
                <p>{task.description || 'No description'}</p>

                <div className="task-meta">
                  <span className="badge">Status: {task.status}</span>
                  <span className="badge">Priority: {task.priority}</span>
                  <span className="badge">Location: {task.location}</span>
                  {task.dueDate && (
                    <span className="badge">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {task.attachments.length > 0 && (
                  <div>
                    <strong>Attachments</strong>
                    {task.attachments.map((url) => (
                      <a
                        className="attachment"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        key={url}
                      >
                        Open attachment
                      </a>
                    ))}
                  </div>
                )}

                {weather[task._id] && (
                  <div className="weather">
                    Weather: {weather[task._id]!.temperature}°C,{' '}
                    {weather[task._id]!.description}
                    <br />
                    Humidity: {weather[task._id]!.humidity}% | Wind:{' '}
                    {weather[task._id]!.windSpeed} m/s
                  </div>
                )}

                <div className="actions">
                  <button className="btn secondary" onClick={() => editTask(task)}>
                    Edit
                  </button>

                  <button className="btn danger" onClick={() => deleteTask(task._id)}>
                    Delete
                  </button>

                  {task.status !== 'done' && (
                    <button className="btn" onClick={() => markDone(task)}>
                      Mark done
                    </button>
                  )}

                  <button className="btn secondary" onClick={() => getWeather(task)}>
                    Get weather
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">
            <button
              className="btn secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              className="btn secondary"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
