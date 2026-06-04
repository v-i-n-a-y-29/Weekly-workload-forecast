import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();

router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.get('/', TaskController.getTasks);

export default router;
