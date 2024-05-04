import express from 'express';
import { AcademicFacultyController } from './academicFaculty.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get('/', AcademicFacultyController.getAllAcademicFaculty);
router.get('/:id', AcademicFacultyController.singleAcademicFaculty);

router.post('/', AcademicFacultyController.createAcademicFaculty);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  AcademicFacultyController.updateOneFromDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  AcademicFacultyController.deleteByIdFromDB
);

export const AcademicFacultyRoutes = router;
