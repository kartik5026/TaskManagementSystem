import { Router } from "express";
import { authMiddleware } from "../../Users/Middlewares";
import TaskController from "../Controller";

const {
  createTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} = new TaskController();

export const taskRouter = Router();

// All task routes require authentication
taskRouter.post("/", authMiddleware, createTaskController);
taskRouter.get("/", authMiddleware, getAllTasksController);
taskRouter.get("/:id", authMiddleware, getTaskByIdController);
taskRouter.put("/:id", authMiddleware, updateTaskController);
taskRouter.delete("/:id", authMiddleware, deleteTaskController);

