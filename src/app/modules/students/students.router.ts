import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { StudentValidation } from './student.validation';
import { StudentsController } from './students.controller';

const router = express.Router();


router.get('/', StudentsController.getAllStudents);
router.get(
  '/my-courses',
  auth(ENUM_USER_ROLE.STUDENT),
  StudentsController.myCourses
);
router.get(
  '/my-course-schedule',
  auth(ENUM_USER_ROLE.STUDENT),
  StudentsController.getMyCourseSchedules
);
router.get('/:id', StudentsController.singleStudents);

router.get(
  '/my-academic-info',
  auth(ENUM_USER_ROLE.STUDENT),
  StudentsController.getMyAcademicInfo
);
router.post('/', StudentsController.createStudents);
router.patch(
  '/:id',
  validateRequest(StudentValidation.updateStudentZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  StudentsController.updatedStudent
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  StudentsController.deleteStudent
);

export const StudentsRoutes = router;
