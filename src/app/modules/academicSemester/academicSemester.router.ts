import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AcademicSemesterController } from './academicSemester.controller';
import { AcademicSemesterValidation } from './academicSemester.validation';

const router = express.Router();

router.get('/', AcademicSemesterController.getAllAcademicSemester);
router.get('/:id', AcademicSemesterController.singleAcademicSemester);
router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN),
  validateRequest(AcademicSemesterValidation.createAcademicSemesterZodSchema),
  AcademicSemesterController.createAcademicSemester
);
router.patch('/:id', AcademicSemesterController.updateIntoDB);
router.delete('/:id', AcademicSemesterController.deleteAcademicSemester);

export const AcademicSemesterRoutes = router;
