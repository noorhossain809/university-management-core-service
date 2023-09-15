import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferedCourseService } from './offeredCourses.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer course created successfully!!!',
    data: result
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.getAllFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer course retrieve successfully!!!',
    data: result
  });
});

export const OfferedCourseController = {
  insertIntoDB,
  getAllFromDB
};
