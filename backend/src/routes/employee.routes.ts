import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';

const router = Router();

router.post('/', EmployeeController.createEmployee);
router.get('/', EmployeeController.getEmployees);

export default router;
