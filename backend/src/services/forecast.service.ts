import { prisma } from '../config/db';

export interface ForecastResponse {
  employeeId: string;
  name: string;
  capacity: number;
  plannedHours: number;
  utilization: number;
  warning: 'GREEN' | 'YELLOW' | 'RED';
}

export class ForecastService {
  static async getWeeklyForecast(weekStartStr: string): Promise<ForecastResponse[]> {
    // Parse the start of the week
    const weekStart = new Date(`${weekStartStr}T00:00:00.000Z`);
    if (isNaN(weekStart.getTime())) {
      throw new Error('Invalid weekStart date format');
    }

    // Calculate end of the week (7 days inclusive: e.g. Monday to Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    // Fetch all employees and their tasks within the selected week that are not completed
    const employees = await prisma.employee.findMany({
      include: {
        tasks: {
          where: {
            status: {
              not: 'COMPLETED',
            },
            dueDate: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return employees.map((employee : { tasks: any[]; weeklyCapacity: any; id: any; name: any; }) => {
      // Sum the estimated hours for the non-completed tasks
      const plannedHours = employee.tasks.reduce((sum: number, task: { estimatedHours: any; }) => {
        return sum + Number(task.estimatedHours);
      }, 0);

      const capacity = employee.weeklyCapacity;
      
      // Calculate utilization percentage (rounded to nearest integer)
      const utilization = capacity > 0 
        ? Math.round((plannedHours / capacity) * 100) 
        : (plannedHours > 0 ? 100 : 0);

      // Determine warning level
      let warning: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
      if (utilization >= 100) {
        warning = 'RED';
      } else if (utilization >= 80) {
        warning = 'YELLOW';
      }

      return {
        employeeId: employee.id,
        name: employee.name,
        capacity,
        plannedHours: Number(plannedHours.toFixed(2)), // ensure nice formatting for decimals
        utilization,
        warning,
      };
    });
  }
}
