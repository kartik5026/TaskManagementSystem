import { Request, Response } from "express";
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "../Services";

class TaskController {
  createTaskController(req: Request, res: Response) {
    return createTaskService(req, res);
  }

  getAllTasksController(req: Request, res: Response) {
    return getAllTasksService(req, res);
  }

  getTaskByIdController(req: Request, res: Response) {
    return getTaskByIdService(req, res);
  }

  updateTaskController(req: Request, res: Response) {
    return updateTaskService(req, res);
  }

  deleteTaskController(req: Request, res: Response) {
    return deleteTaskService(req, res);
  }
}

export default TaskController;

