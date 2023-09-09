import { Room } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { RoomService } from './rooms.service';

const createARoom = catchAsync(async (req: Request, res: Response) => {
  const result = await RoomService.createARoom(req.body);

  sendResponse<Room>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'academic building room created successfully!!!',
    data: result
  });
});

export const RoomController = {
  createARoom
};
