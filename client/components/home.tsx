"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all', 'completed', 'pending'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const pageSize = 10;

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tasks when page, filter, or debounced search changes
  useEffect(() => {
    fetchTasks(currentPage, statusFilter, debouncedSearch);
  }, [currentPage, statusFilter, debouncedSearch]);

  async function fetchTasks(page: number, status: string = "all", search: string = "") {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      
      if (status !== "all") {
        params.append("status", status);
      }
      
      // Search is global - searches across ALL tasks, not just current page
      if (search.trim()) {
        params.append("search", search.trim());
      }
      
      const res = await axiosInstance.get<{
        tasks: Task[];
        pagination: Pagination;
      }>(`/tasks?${params.toString()}`);
      
      setTasks(res.data.tasks);
      setPagination(res.data.pagination);
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

  // Reset to page 1 when filter or search changes
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 when searching
  };

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

      if (currentPage === 1) {
        setTasks((prev) => [res.data.task, ...prev]);
        if (pagination) {
          setPagination({ ...pagination, total: pagination.total + 1 });
        }
      } else {
        setCurrentPage(1);
      }
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

  async function toggleTask(id: number) {
    try {
      setError(null);
      const res = await axiosInstance.post<{ task: Task; message: string }>(
        `/tasks/${id}/toggle`
      );

      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
    } catch (error: any) {
      console.error("Error toggling task:", error);
      setError(error.response?.data?.message || "Failed to toggle task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  }

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

  async function deleteTask(id: number) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError(null);
      await axiosInstance.delete(`/tasks/${id}`);

      const updatedTasks = tasks.filter((t) => t.id !== id);
      setTasks(updatedTasks);

      if (updatedTasks.length === 0 && currentPage > 1 && pagination) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchTasks(currentPage);
      }
    } catch (error: any) {
      console.error("Error deleting task:", error);
      setError(error.response?.data?.message || "Failed to delete task");
      if (error.response?.status === 401) {
        router.push("/login");
      }
    }
  }

  async function handleLogout() {
    try {
      await axiosInstance.post("/users/logout");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/login");
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Task Manager</h1>
              <p className="text-xs sm:text-sm text-gray-500">Stay organized and productive</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm text-sm sm:text-base w-full sm:w-auto"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 flex items-start sm:items-center gap-2 text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              className="border border-gray-300 p-2.5 sm:p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
              placeholder="What needs to be done?"
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
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isCreating ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Adding...</span>
                  <span className="sm:hidden">Add...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistics */}
        {pagination && pagination.total > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-3 sm:p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Your Tasks
            </h2>
            {pagination && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block">
                  {pagination.total} {pagination.total === 1 ? "task" : "tasks"}
                  {searchQuery && " found"}
                </span>
                {searchQuery && (
                  <span className="text-xs text-gray-500 italic">
                    (searching all pages)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Filter and Search Controls */}
          <div className="flex flex-col gap-3 mb-4 sm:mb-6">
            {/* Search Input - Global Search Across All Tasks */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search all tasks by title..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full border border-gray-300 p-2 sm:p-2.5 pl-9 sm:pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <svg
                  className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="px-2.5 sm:px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors flex-shrink-0"
                  title="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => handleStatusFilterChange("all")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilterChange("pending")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  statusFilter === "pending"
                    ? "bg-yellow-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusFilterChange("completed")}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  statusFilter === "completed"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                {searchQuery || statusFilter !== "all"
                  ? "No tasks found"
                  : "No tasks yet"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search"
                  : "Create your first task above to get started!"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onUpdateTitle={(newTitle) => updateTaskTitle(task.id, newTitle)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                      Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(currentPage * pageSize, pagination.total)}</span> of{" "}
                      <span className="font-medium">{pagination.total}</span> tasks
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>

                      <span className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                        Page {currentPage} of {pagination.totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
      className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all ${
        task.completed
          ? "bg-gray-50 border-gray-200 opacity-75"
          : "bg-white border-gray-300 hover:shadow-md hover:border-blue-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Toggle Switch */}
        <div className="flex-shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="relative w-12 h-6 sm:w-14 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700 min-w-[70px] sm:min-w-[80px]">
              {task.completed ? (
                <span className="text-green-600 font-semibold">Complete</span>
              ) : (
                <span className="text-yellow-600 font-semibold">Pending</span>
              )}
            </span>
          </label>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
                className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1 flex-1 sm:flex-initial"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p
                className={`text-base sm:text-lg mb-1 break-words ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-800 font-medium"
                }`}
                onDoubleClick={() => setIsEditing(true)}
              >
                {task.title}
              </p>
              <span className="text-xs text-gray-400">
                Created {new Date(task.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg transition-colors shadow-sm hover:shadow"
              title="Edit task"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-lg transition-colors shadow-sm hover:shadow"
              title="Delete task"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
