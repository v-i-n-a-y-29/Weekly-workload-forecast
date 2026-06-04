import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export class EmployeeController {
  static async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, role, weeklyCapacity } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
      }
      if (name.length > 100) {
        return res.status(400).json({ error: 'Name must not exceed 100 characters' });
      }

      if (!role || typeof role !== 'string' || role.trim().length === 0) {
        return res.status(400).json({ error: 'Role is required and must be a non-empty string' });
      }
      if (role.length > 50) {
        return res.status(400).json({ error: 'Role must not exceed 50 characters' });
      }

      let parsedCapacity = 40;
      if (weeklyCapacity !== undefined) {
        if (typeof weeklyCapacity === 'number') {
          parsedCapacity = weeklyCapacity;
        } else {
          parsedCapacity = parseInt(weeklyCapacity, 10);
        }
        
        if (isNaN(parsedCapacity) || parsedCapacity < 0) {
          return res.status(400).json({ error: 'weeklyCapacity must be a non-negative integer' });
        }
      }

      const employee = await prisma.employee.create({
        data: {
          name: name.trim(),
          role: role.trim(),
          weeklyCapacity: parsedCapacity,
        },
      });

      return res.status(201).json(employee);
    } catch (error) {
      return next(error);
    }
  }

  static async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await prisma.employee.findMany({
        orderBy: {
          name: 'asc',
        },
      });
      return res.status(200).json(employees);
    } catch (error) {
      return next(error);
    }
  }
}
