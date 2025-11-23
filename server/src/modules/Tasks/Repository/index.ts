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

// Get all tasks for the authenticated user with pagination, filtering, and search
export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get filter and search parameters
    const status = req.query.status as string | undefined; // 'completed', 'pending', or undefined
    const search = req.query.search as string | undefined; // search term for title
    
    // Validate pagination parameters
    const pageNumber = Math.max(1, page);
    const pageSize = Math.min(Math.max(1, limit), 100); // Max 100 items per page
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const whereClause: any = {
      userId: userId,
    };

    // Add status filter
    if (status === 'completed' || status === 'pending') {
      whereClause.completed = status === 'completed';
    }

    // Add search filter (case-insensitive partial match)
    if (search && search.trim() !== '') {
      whereClause.title = {
        contains: search.trim(),
        mode: 'insensitive', // Case-insensitive search
      };
    }

    // Get total count and paginated tasks
    const [totalTasks, tasks] = await Promise.all([
      prisma.task.count({ where: whereClause }),
      prisma.task.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip: skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalTasks / pageSize);

    return res.status(200).json({
      message: "Tasks retrieved successfully",
      tasks,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalTasks,
        totalPages: totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      filters: {
        status: status || 'all',
        search: search || '',
      },
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

// Update a task (title only)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.userId;
    const { title } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
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

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: title.trim(),
      },
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

// Toggle task completion status
export const toggleTask = async (req: AuthRequest, res: Response) => {
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

    // Toggle the completed status
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        completed: !existingTask.completed,
      },
    });

    return res.status(200).json({
      message: "Task toggled successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Toggle task error:", error);
    return res.status(500).json({ message: "Error toggling task" });
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

