"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "@/const/page";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

// ------------------------
// Types
// ------------------------
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");

  // ---------------------------
  // Fetch Tasks + Authentication Check
  // ---------------------------
useEffect(() => {
  async function fetchData() {
    try {
      const res = await axiosInstance.get('/users/protected');
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  }

  fetchData();
}, []); // empty dependency array → runs only once


  // ---------------------------
  // Create Task
  // ---------------------------
  async function createTask() {
    if (!newTask.trim()) return;

    const res = await axios.post<{ task: Task }>(
      `${backendUrl}/tasks`,
      { title: newTask },
      { withCredentials: true }
    );

    setTasks((prev) => [...prev, res.data.task]);
    setNewTask("");
  }

  // ---------------------------
  // Toggle Status
  // ---------------------------
  async function toggleTask(id: number) {
    const res = await axios.put<{ task: Task }>(
      `${backendUrl}/tasks/${id}/toggle`,
      {},
      { withCredentials: true }
    );

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? res.data.task : t))
    );
  }

  // ---------------------------
  // Delete Task
  // ---------------------------
  async function deleteTask(id: number) {
    await axios.delete(`${backendUrl}/tasks/${id}`, {
      withCredentials: true,
    });

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Task Manager</h1>

      {/* Create Task */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 w-full rounded"
          placeholder="Enter a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <button
          onClick={createTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border p-3 rounded flex items-center justify-between"
          >
            <div>
              <p
                className={
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-black"
                }
              >
                {task.title}
              </p>
              <span className="text-sm text-gray-400">
                {task.completed ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleTask(task.id)}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Toggle
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <p className="text-gray-500">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
