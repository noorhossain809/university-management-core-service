import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseClassScheduleController } from './offeredCourseClassSchedule.controller';
import { OfferedCourseClassScheduleValidations } from './offeredCourseClassSchedule.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(OfferedCourseClassScheduleValidations.create),
  OfferedCourseClassScheduleController.insertIntoDB
);
router.get('/', OfferedCourseClassScheduleController.getAllFromDB);

export const OfferedCourseClassScheduleRoutes = router;
