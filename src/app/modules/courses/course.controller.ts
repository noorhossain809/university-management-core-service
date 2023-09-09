import { Course } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ICourseFilterableFields } from './course.constant';
import { CourseService } from './course.service';

const createACourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createACourse(req.body);

  sendResponse<Course>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course created successfully!!!',
    data: result
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ICourseFilterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const result = await CourseService.getAllCourses(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course retrieve successfully!!!',
    meta: result.meta,
    data: result.data
  });
});

const getSingleCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getSingleCourse(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single course retrieve successfully!!!',
    data: result
  });
});
const updateOneCourse = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await CourseService.updateOneCourse(req.params.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single course updated successfully!!!',
    data: result
  });
});

const assignFaculty = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.faculties;
  const result = await CourseService.assignFaculty(req.params.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty assigned successfully!!!',
    data: result
  });
});

const removeFaculty = catchAsync(async (req: Request, res: Response) => {
  const data = req.body.faculties;
  const result = await CourseService.removeFaculties(req.params.id, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course faculty remove successfully!!!',
    data: result
  });
});

export const CourseController = {
  createACourse,
  getAllCourses,
  getSingleCourse,
  updateOneCourse,
  assignFaculty,
  removeFaculty
};
