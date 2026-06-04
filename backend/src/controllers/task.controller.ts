import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const VALID_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class TaskController {
  static async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, estimatedHours, priority, status, dueDate, assignedEmployeeId } = req.body;

      // Validation
      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
      }
      if (title.length > 150) {
        return res.status(400).json({ error: 'Title must not exceed 150 characters' });
      }

      const parsedHours = Number(estimatedHours);
      if (estimatedHours === undefined || isNaN(parsedHours) || parsedHours < 0) {
        return res.status(400).json({ error: 'estimatedHours is required and must be a non-negative number' });
      }

      if (!priority || !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: `Priority is required and must be one of: ${VALID_PRIORITIES.join(', ')}` });
      }

      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Status is required and must be one of: ${VALID_STATUSES.join(', ')}` });
      }

      if (!dueDate || typeof dueDate !== 'string' || !DATE_REGEX.test(dueDate)) {
        return res.status(400).json({ error: 'dueDate is required and must be in YYYY-MM-DD format' });
      }
      const parsedDate = new Date(`${dueDate}T00:00:00.000Z`);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'dueDate is an invalid calendar date' });
      }

      // Check employee assignment
      let employeeId: string | null = null;
      if (assignedEmployeeId) {
        if (typeof assignedEmployeeId !== 'string') {
          return res.status(400).json({ error: 'assignedEmployeeId must be a valid UUID string' });
        }
        // Verify employee exists
        const employee = await prisma.employee.findUnique({
          where: { id: assignedEmployeeId },
        });
        if (!employee) {
          return res.status(404).json({ error: `Employee with ID ${assignedEmployeeId} not found` });
        }
        employeeId = assignedEmployeeId;
      }

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          estimatedHours: parsedHours,
          priority,
          status,
          dueDate: parsedDate,
          assignedEmployeeId: employeeId,
        },
      });

      return res.status(201).json(task);
    } catch (error) {
      return next(error);
    }
  }

  static async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, estimatedHours, priority, status, dueDate, assignedEmployeeId } = req.body;

      // Find task first
      const existingTask = await prisma.task.findUnique({
        where: { id },
      });
      if (!existingTask) {
        return res.status(404).json({ error: `Task with ID ${id} not found` });
      }

      const updateData: any = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          return res.status(400).json({ error: 'Title must be a non-empty string' });
        }
        if (title.length > 150) {
          return res.status(400).json({ error: 'Title must not exceed 150 characters' });
        }
        updateData.title = title.trim();
      }

      if (estimatedHours !== undefined) {
        const parsedHours = Number(estimatedHours);
        if (isNaN(parsedHours) || parsedHours < 0) {
          return res.status(400).json({ error: 'estimatedHours must be a non-negative number' });
        }
        updateData.estimatedHours = parsedHours;
      }

      if (priority !== undefined) {
        if (!VALID_PRIORITIES.includes(priority)) {
          return res.status(400).json({ error: `Priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
        }
        updateData.priority = priority;
      }

      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
          return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        updateData.status = status;
      }

      if (dueDate !== undefined) {
        if (typeof dueDate !== 'string' || !DATE_REGEX.test(dueDate)) {
          return res.status(400).json({ error: 'dueDate must be in YYYY-MM-DD format' });
        }
        const parsedDate = new Date(`${dueDate}T00:00:00.000Z`);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ error: 'dueDate is an invalid calendar date' });
        }
        updateData.dueDate = parsedDate;
      }

      if (assignedEmployeeId !== undefined) {
        if (assignedEmployeeId === null || assignedEmployeeId === '') {
          updateData.assignedEmployeeId = null;
        } else {
          if (typeof assignedEmployeeId !== 'string') {
            return res.status(400).json({ error: 'assignedEmployeeId must be a valid UUID string' });
          }
          // Verify employee exists
          const employee = await prisma.employee.findUnique({
            where: { id: assignedEmployeeId },
          });
          if (!employee) {
            return res.status(404).json({ error: `Employee with ID ${assignedEmployeeId} not found` });
          }
          updateData.assignedEmployeeId = assignedEmployeeId;
        }
      }

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json(updatedTask);
    } catch (error) {
      return next(error);
    }
  }

  static async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await prisma.task.findMany({
        orderBy: {
          dueDate: 'asc',
        },
      });
      return res.status(200).json(tasks);
    } catch (error) {
      return next(error);
    }
  }
}
