import { AcademicFaculty } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { AcademicFacultyService } from './academicFaculty.service';

const createAcademicFaculty = async (req: Request, res: Response) => {
  try {
    const result = await AcademicFacultyService.createAcademicFaculty(req.body);

    sendResponse<AcademicFaculty>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic Faculty created successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllAcademicFaculty = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, ['searchTerm', 'title']);
    console.log(options);
    const result = await AcademicFacultyService.getAllAcademicFaculty(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic Faculty retrieve successfully!!!',
      meta: result.meta,
      data: result.data
    });
  }
);

const singleAcademicFaculty = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicFacultyService.singleAcademicFaculty(
      req.params.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single academic Faculty retrieve successfully!!!',
      data: result
    });
  }
);

const updateOneFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AcademicFacultyService.updateOneFromDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Academic Faculty updated successfully',
    data: result
  });
});
const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AcademicFacultyService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'AcademicFaculty delete successfully',
    data: result
  });
});

export const AcademicFacultyController = {
  createAcademicFaculty,
  getAllAcademicFaculty,
  singleAcademicFaculty,
  updateOneFromDB,
  deleteByIdFromDB
};
