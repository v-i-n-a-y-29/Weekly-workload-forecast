import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employee.routes';
import taskRoutes from './routes/task.routes';
import forecastRoutes from './routes/forecast.routes';

// Load environment variables
dotenv.config();

const app = express();

// Middlwares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/forecast', forecastRoutes);

// Catch 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
