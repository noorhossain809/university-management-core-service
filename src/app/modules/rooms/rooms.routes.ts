import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RoomController } from './rooms.controller';
import { RoomValidation } from './rooms.validation';

const router = express.Router();

router.get('/', RoomController.getAllFromDB);
router.get('/:id', RoomController.getByIdFromDB);
router.post(
  '/',
  validateRequest(RoomValidation.createRoomZodSchema),
  RoomController.createARoom
);
router.patch(
  '/:id',
  validateRequest(RoomValidation.updateRoomZodSchema),
  RoomController.updateByIdFromDB
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  RoomController.deleteByIdFromDB
);

export const RoomRoutes = router;
