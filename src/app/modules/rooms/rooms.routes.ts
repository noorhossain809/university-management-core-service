import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RoomController } from './rooms.controller';
import { RoomValidation } from './rooms.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(RoomValidation.createRoomZodSchema),
  RoomController.createARoom
);

export const RoomRoutes = router;
