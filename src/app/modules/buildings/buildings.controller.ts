import { Building } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { BuildingFilterableFields } from './buildings.constants';
import { BuildingService } from './buildings.service';

const createBuildings = catchAsync(async (req: Request, res: Response) => {
  const result = await BuildingService.createBuildings(req.body);

  sendResponse<Building>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'academic Building created successfully!!!',
    data: result
  });
});

const getAllBuildings = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, BuildingFilterableFields);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);
  const result = await BuildingService.getAllBuildings(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'academic Building retrieve successfully!!!',
    meta: result.meta,
    data: result.data
  });
});

export const BuildingController = {
  createBuildings,
  getAllBuildings
};
