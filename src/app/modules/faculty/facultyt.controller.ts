import { Faculty } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { FacultyService } from './faculty.service';

const createFaculty = async (req: Request, res: Response) => {
  try {
    const result = await FacultyService.createFaculty(req.body);

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

export const FacultyController = {
  createFaculty,
  getAllFaculty,
  singleFaculty,
  assignCourses,
  removeCourses
};
