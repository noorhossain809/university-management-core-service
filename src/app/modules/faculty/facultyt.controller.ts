import { Faculty } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { FacultyService } from './faculty.service';

const createFaculty = async (req: Request, res: Response) => {
  try {
    const result = await FacultyService.insertIntoDB(req.body);

    sendResponse<Faculty>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'faculty created successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllFaculty = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, [
    'searchTerm',
    'title',
    'code',
    'startMonth',
    'endMonth'
  ]);
  console.log(options);
  const result = await FacultyService.getAllFaculty(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'faculty retrieve successfully!!!',
    meta: result.meta,
    data: result.data
  });
});

const singleFaculty = async (req: Request, res: Response) => {
  try {
    const result = await FacultyService.singleFaculty(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'faculty retrieve successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const assignCourses = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.courses;
  const result = await FacultyService.assignCourses(req.params.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty assigned successfully!!!',
    data: result
  });
});

const removeCourses = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.courses;
  const result = await FacultyService.removeCourses(req.params.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty remove successfully!!!',
    data: result
  });
});

const myCourses = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const filter = pick(req.query, ['courseId', 'academicSemesterId']);
  const result = await FacultyService.myCourses(user.userId, filter);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'faculty courses retrieve successfully!!!',
    data: result
  });
});

const getMyCourseStudent = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const filter = pick(req.query, [
    'academicSemesterId',
    'courseId',
    'offeredCourseSectionId'
  ]);
  const options = pick(req.query, ['limit', 'page']);

  const result = await FacultyService.getMyCourseStudent(filter, options, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'faculty course student retrieve successfully!!!',
    meta: result.meta,
    data: result.data
  });
});

export const FacultyController = {
  createFaculty,
  getAllFaculty,
  singleFaculty,
  assignCourses,
  removeCourses,
  myCourses,
  getMyCourseStudent
};
