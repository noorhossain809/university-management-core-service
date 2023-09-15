import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseValidations } from './offeredCourse.validation';
import { OfferedCourseController } from './offeredCourses.controller';
const router = express.Router();

router.post(
  '/',
  validateRequest(OfferedCourseValidations.create),
  OfferedCourseController.insertIntoDB
);
router.get('/', OfferedCourseController.getAllFromDB);

export const OfferedCourseRoutes = router;
