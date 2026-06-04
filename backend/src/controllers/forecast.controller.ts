import { Request, Response, NextFunction } from 'express';
import { ForecastService } from '../services/forecast.service';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class ForecastController {
  static async getForecast(req: Request, res: Response, next: NextFunction) {
    try {
      const { weekStart } = req.query;

      if (!weekStart || typeof weekStart !== 'string' || !DATE_REGEX.test(weekStart)) {
        return res.status(400).json({ error: 'weekStart query parameter is required and must be in YYYY-MM-DD format' });
      }

      const parsedDate = new Date(`${weekStart}T00:00:00.000Z`);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: 'weekStart is an invalid calendar date' });
      }

      const forecast = await ForecastService.getWeeklyForecast(weekStart);
      return res.status(200).json(forecast);
    } catch (error) {
      return next(error);
    }
  }
}
