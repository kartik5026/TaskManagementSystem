import { Request, Response } from "express";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../Repository";

export const createTaskService = (req: Request, res: Response) => {
  return createTask(req, res);
};

export const getAllTasksService = (req: Request, res: Response) => {
  return getAllTasks(req, res);
};

export const getTaskByIdService = (req: Request, res: Response) => {
  return getTaskById(req, res);
};

export const updateTaskService = (req: Request, res: Response) => {
  return updateTask(req, res);
};

export const deleteTaskService = (req: Request, res: Response) => {
  return deleteTask(req, res);
};

