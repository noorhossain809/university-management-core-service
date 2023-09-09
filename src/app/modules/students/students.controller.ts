import { Student } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { StudentsService } from './students.service';

const createStudents = async (req: Request, res: Response) => {
  try {
    const result = await StudentsService.createStudents(req.body);

    sendResponse<Student>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester created successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const filters = pick(req.query, [
    'searchTerm',
    'title',
    'code',
    'startMonth',
    'endMonth'
  ]);
  console.log(options);
  const result = await StudentsService.getAllStudents(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student retrieve successfully!!!',
    meta: result.meta,
    data: result.data
  });
});

const singleStudents = async (req: Request, res: Response) => {
  try {
    const result = await StudentsService.singleStudents(req.params.id);

    sendResponse<Student>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester retrieve successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};
const updatedStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await StudentsService.updateStudent(id, data);

    sendResponse<Student>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'student updated successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await StudentsService.deleteStudent(id);

    sendResponse<Student>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'student deleted successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

export const StudentsController = {
  createStudents,
  getAllStudents,
  singleStudents,
  updatedStudent,
  deleteStudent
};