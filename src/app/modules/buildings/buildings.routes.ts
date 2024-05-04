import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BuildingController } from './buildings.controller';
import { BuildingValidation } from './buildings.validation';

const router = express.Router();

router.get('/', BuildingController.getAllBuildings);
router.get('/:id', BuildingController.getBuildingById);
router.patch(
  '/:id',
  validateRequest(BuildingValidation.update),
  auth(ENUM_USER_ROLE.ADMIN),
  BuildingController.updateBuildingById
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  BuildingController.deleteBuildingById
);

router.post(
  '/',
  validateRequest(BuildingValidation.createBuildingsZodSchema),
  auth(ENUM_USER_ROLE.ADMIN),
  BuildingController.createBuildings
);

export const BuildingRoutes = router;
