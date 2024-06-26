import { AcademicSemester } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { AcademicSemesterService } from './academicSemester.service';

const createAcademicSemester = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicSemesterService.createAcademicSemester(
      req.body
    );

    sendResponse<AcademicSemester>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester created successfully!!!',
      data: result
    });
  }
);

const getAllAcademicSemester = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, [
      'searchTerm',
      'title',
      'code',
      'startMonth',
      'endMonth'
    ]);
    console.log(options);
    const result = await AcademicSemesterService.getAllAcademicSemester(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester retrieve successfully!!!',
      meta: result.meta,
      data: result.data
    });
  }
);

const singleAcademicSemester = async (req: Request, res: Response) => {
  try {
    const result = await AcademicSemesterService.singleAcademicSemester(
      req.params.id
    );

    sendResponse<AcademicSemester>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester retrieve successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};
const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await AcademicSemesterService.updateIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'academic semester updated successfully!!!',
    data: result
  });
});
const deleteAcademicSemester = async (req: Request, res: Response) => {
  try {
    const result = await AcademicSemesterService.deleteAcademicSemester(
      req.params.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic semester deleted successfully!!!'
    });
  } catch (error) {
    res.send(error);
  }
};

export const AcademicSemesterController = {
  createAcademicSemester,
  getAllAcademicSemester,
  singleAcademicSemester,
  deleteAcademicSemester,
  updateIntoDB
};
