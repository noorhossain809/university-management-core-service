import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OfferedCourseSectionService } from './offeredCourseSection.service';
import pick from '../../../shared/pick';
import { offeredCourseSectionFilterableFields } from './offeredCourseSection.constants';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseSectionService.insertIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offered Course section created successfully!!!',
    data: result
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, offeredCourseSectionFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await OfferedCourseSectionService.getAllFromDB(
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Offer course section retrieve successfully!!!',
    data: result
  });
});
const getOfferedCourseSectionById = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OfferedCourseSectionService.getOfferedCourseSectionById(
        req.params.id
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single Offer course section retrieve successfully!!!',
      data: result
    });
  }
);

export const OfferedCourseSectionController = {
  insertIntoDB,
  getAllFromDB,
  getOfferedCourseSectionById
};
