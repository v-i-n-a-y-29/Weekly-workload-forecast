import { Router } from 'express';
import { ForecastController } from '../controllers/forecast.controller';

const router = Router();

router.get('/', ForecastController.getForecast);

export default router;
