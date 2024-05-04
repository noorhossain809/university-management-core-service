import { AcademicDepartment } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { AcademicDepartmentService } from './academicDepartment.service';

const createAcademicDepartment = async (req: Request, res: Response) => {
  try {
    const result = await AcademicDepartmentService.createAcademicDepartment(
      req.body
    );

    sendResponse<AcademicDepartment>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic Department created successfully!!!',
      data: result
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllAcademicDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
    const filters = pick(req.query, ['searchTerm', 'title']);
    console.log(options);
    const result = await AcademicDepartmentService.getAllAcademicDepartment(
      filters,
      options
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'academic Department retrieve successfully!!!',
      meta: result.meta,
      data: result.data
    });
  }
);

const singleAcademicDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicDepartmentService.singleAcademicDepartment(
      req.params.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single academic Department retrieve successfully!!!',
      data: result
    });
  }
);

const updateAcademicDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicDepartmentService.updateOneFromDB(
      req.params.id,
      req.body
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Academic Department updated successfully!!!',
      data: result
    });
  }
);
const deleteAcademicDepartment = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AcademicDepartmentService.deleteOneFromDB(
      req.params.id
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Academic Department deleted successfully!!!',
      data: result
    });
  }
);

export const AcademicDepartmentController = {
  createAcademicDepartment,
  getAllAcademicDepartment,
  singleAcademicDepartment,
  updateAcademicDepartment,
  deleteAcademicDepartment
};
