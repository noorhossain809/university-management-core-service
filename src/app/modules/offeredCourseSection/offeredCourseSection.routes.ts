import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { OfferedCourseSectionController } from './offeredCourseSection.controller';
import { OfferedCourseSectionValidation } from './offeredCourseSection.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(OfferedCourseSectionValidation.create),
  OfferedCourseSectionController.insertIntoDB
);
router.get('/', OfferedCourseSectionController.getAllFromDB);
router.get('/:id', OfferedCourseSectionController.getOfferedCourseSectionById);

export const OfferedCourseSectionRoutes = router;
