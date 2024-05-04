import express from 'express';
import { StudentEnrolledCourseMarkController } from './studentEnrolledCourseMark.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.FACULTY),
  StudentEnrolledCourseMarkController.getAllFromDB
);

router.get(
  '/my-course-marks',
  auth(ENUM_USER_ROLE.STUDENT),
  StudentEnrolledCourseMarkController.getMyCourseMarks
);

router.patch('/update-marks', StudentEnrolledCourseMarkController.updateMark);
router.patch(
  '/update-final-marks',
  StudentEnrolledCourseMarkController.updateFinalMark
);

export const StudentEnrolledCourseMarkRoutes = router;
