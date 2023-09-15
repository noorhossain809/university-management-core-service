import express from 'express';
import { StudentEnrolledCourseMarkController } from './studentEnrolledCourseMark.controller';

const router = express.Router();

router.patch('/update-marks', StudentEnrolledCourseMarkController.updateMark);
router.patch(
  '/update-final-marks',
  StudentEnrolledCourseMarkController.updateFinalMark
);

export const StudentEnrolledCourseMarkRoutes = router;
