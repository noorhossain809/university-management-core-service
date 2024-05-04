import { studentEnrolledCourseMarkFilterableFields } from './studentEnrolledCourseMark.constant';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StudentEnrolledCourseMarkService } from './studentEnrolledCourseMark.service';
import pick from '../../../shared/pick';

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, studentEnrolledCourseMarkFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await StudentEnrolledCourseMarkService.getAllFromDB(
    filter,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student course marks retrieve successfully',
    data: result
  });
});

const updateMark = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentEnrolledCourseMarkService.updateMarks(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Marks updated successfully',
    data: result
  });
});
const updateFinalMark = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentEnrolledCourseMarkService.updateFinalMark(
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Final Marks updated successfully',
    data: result
  });
});

const getMyCourseMarks = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filters = pick(req.query, studentEnrolledCourseMarkFilterableFields);
  const options = pick(req.query, ['page', 'limit']);
  const result = await StudentEnrolledCourseMarkService.getMyCourseMarks(
    filters,
    options,
    user
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student enrolled course marks retrieve successfully',
    meta: result.meta,
    data: result.data
  });
});

export const StudentEnrolledCourseMarkController = {
  getAllFromDB,
  updateMark,
  updateFinalMark,
  getMyCourseMarks
};
