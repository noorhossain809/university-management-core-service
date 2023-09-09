import express from 'express';
import { AcademicDepartmentController } from './academicDepartment.controller';

const router = express.Router();

router.get('/', AcademicDepartmentController.getAllAcademicDepartment);
router.get('/:id', AcademicDepartmentController.singleAcademicDepartment);
router.post(
  '/create-department',
  AcademicDepartmentController.createAcademicDepartment
);

export const AcademicDepartmentRoutes = router;
