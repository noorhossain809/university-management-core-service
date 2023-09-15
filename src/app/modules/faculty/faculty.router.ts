import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FacultyValidation } from './faculty.validation';
import { FacultyController } from './facultyt.controller';

const router = express.Router();

router.get('/', FacultyController.getAllFaculty);
router.get(
  '/my-courses',
  auth(ENUM_USER_ROLE.FACULTY),
  FacultyController.myCourses
);
router.get('/:id', FacultyController.singleFaculty);
router.post(
  '/',
  validateRequest(FacultyValidation.createFacultyZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  FacultyController.createFaculty
);
router.post(
  '/:id/assign-course',
  validateRequest(FacultyValidation.assignOrRemoveCourses),
  auth(ENUM_USER_ROLE.ADMIN),
  FacultyController.assignCourses
);
router.delete('/:id/remove-course', FacultyController.removeCourses);

export const FacultyRoutes = router;
