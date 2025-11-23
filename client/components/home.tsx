"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

// ------------------------
// Types
// ------------------------
interface Task {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // ---------------------------
  // Fetch Tasks on Mount
  // ---------------------------
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get<{ tasks: Task[]; message: string }>("/tasks");
      setTasks(res.data.tasks);
    } catch (error: any) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // Create Task
  // ---------------------------
  async function createTask() {
    if (!newTask.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      const res = await axiosInstance.post<{ task: Task; message: string }>(
        "/tasks",
        { title: newTask.trim() }
      );

      setTasks((prev) => [res.data.task, ...prev]);
      setNewTask("");
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError(error.response?.data?.message || "Failed to create task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setIsCreating(false);
    }
  }

  // ---------------------------
  // Toggle Task Status
  // ---------------------------
  async function toggleTask(id: number, currentStatus: boolean) {
    try {
      setError(null);
      const res = await axiosInstance.put<{ task: Task; message: string }>(
        `/tasks/${id}`,
        { completed: !currentStatus }
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
    } catch (error: any) {
      console.error("Error updating task:", error);
      setError(error.response?.data?.message || "Failed to update task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  }

  // ---------------------------
  // Update Task Title
  // ---------------------------
  async function updateTaskTitle(id: number, newTitle: string) {
    if (!newTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      setError(null);
      const res = await axiosInstance.put<{ task: Task; message: string }>(
        `/tasks/${id}`,
        { title: newTitle.trim() }
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
    } catch (error: any) {
      console.error("Error updating task:", error);
      setError(error.response?.data?.message || "Failed to update task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  }

  // ---------------------------
  // Delete Task
  // ---------------------------
  async function deleteTask(id: number) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError(null);
      await axiosInstance.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error: any) {
      console.error("Error deleting task:", error);
      setError(error.response?.data?.message || "Failed to delete task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  }

  // ---------------------------
  // Logout
  // ---------------------------
  async function handleLogout() {
    try {
      await axiosInstance.post("/users/logout");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if logout fails, redirect to login
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Task Manager</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Create Task */}
          <div className="flex gap-2">
            <input
              className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  createTask();
                }
              }}
              disabled={isCreating}
            />
            <button
              onClick={createTask}
              disabled={isCreating || !newTask.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {isCreating ? "Adding..." : "Add Task"}
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Tasks ({tasks.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No tasks yet. Create your first task above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task.id, task.completed)}
                  onDelete={() => deleteTask(task.id)}
                  onUpdateTitle={(newTitle) => updateTaskTitle(task.id, newTitle)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// Task Item Component
// ---------------------------
interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onUpdateTitle: (newTitle: string) => void;
}

function TaskItem({ task, onToggle, onDelete, onUpdateTitle }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdateTitle(editTitle);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setIsEditing(false);
  };

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        task.completed
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggle}
          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />

        {/* Task Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="border border-gray-300 p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <p
                className={`text-lg ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800 font-medium"
                }`}
                onDoubleClick={() => setIsEditing(true)}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    task.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                task.completed
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {task.completed ? "Mark Pending" : "Mark Done"}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
