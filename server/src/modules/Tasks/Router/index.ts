import { Router } from "express";
import { authMiddleware } from "../../Users/Middlewares";
import TaskController from "../Controller";

const {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  toggleTaskController,
  deleteTaskController,
} = new TaskController();

export const taskRouter = Router();

// All task routes require authentication
// GET /tasks - Get all tasks (with pagination)
// POST /tasks - Create new task
taskRouter.get("/", authMiddleware, getAllTasksController);
taskRouter.post("/", authMiddleware, createTaskController);

// GET /tasks/:id - Get single task
// PUT /tasks/:id - Update task title
// DELETE /tasks/:id - Delete task
taskRouter.get("/:id", authMiddleware, getTaskByIdController);
taskRouter.put("/:id", authMiddleware, updateTaskController);
taskRouter.delete("/:id", authMiddleware, deleteTaskController);

// POST /tasks/:id/toggle - Toggle task completion status
taskRouter.post("/:id/toggle", authMiddleware, toggleTaskController);

