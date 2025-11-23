import { Response } from "express";
import prisma from "../../../lib/prisma";
import { AuthRequest } from "../../Users/Middlewares";

// Create a new task
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        userId: userId,
        completed: false,
      },
    });

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({ message: "Error creating task" });
  }
};

// Get all tasks for the authenticated user
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    console.error("Get all tasks error:", error);
    return res.status(500).json({ message: "Error retrieving tasks" });
  }
};

// Get a single task by ID
export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId, // Ensure user can only access their own tasks
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.status(200).json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    console.error("Get task by ID error:", error);
    return res.status(500).json({ message: "Error retrieving task" });
  }
};

// Update a task
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.userId;
    const { title, completed } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Build update data
    const updateData: { title?: string; completed?: boolean } = {};
    if (title !== undefined) {
      if (title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      updateData.title = title.trim();
    }
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Error updating task" });
  }
};

// Delete a task
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Error deleting task" });
  }
};

