import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BuildingController } from './buildings.controller';
import { BuildingValidation } from './buildings.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(BuildingValidation.createBuildingsZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  BuildingController.createBuildings
);
router.get('/', BuildingController.getAllBuildings);

export const BuildingRoutes = router;
