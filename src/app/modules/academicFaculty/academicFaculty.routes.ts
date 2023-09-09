import express from 'express';
import { AcademicFacultyController } from './academicFaculty.controller';

const router = express.Router();

router.get('/', AcademicFacultyController.getAllAcademicFaculty);
router.get('/:id', AcademicFacultyController.singleAcademicFaculty);
router.post('/create-faculty', AcademicFacultyController.createAcademicFaculty);

export const AcademicFacultyRoutes = router;
