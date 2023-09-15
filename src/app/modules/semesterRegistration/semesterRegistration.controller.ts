import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SemesterRegistrationService } from './semesterRegistration.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.insertIntoDB(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Semester registration created successfully!!!',
    data: result
  });
});
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.getAllFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Semester registration retrieve successfully!!!',
    data: result
  });
});
const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.getByIdFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Single Semester registration retrieve successfully!!!',
    data: result
  });
});
const update = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.update(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Semester registration updated successfully!!!',
    data: result
  });
});
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.deleteFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Semester registration deleted successfully!!!',
    data: result
  });
});

const startMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await SemesterRegistrationService.startMyRegistration(
    user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student Semester registration started successfully!!!',
    data: result
  });
});

const enrollIntoCourse = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await SemesterRegistrationService.enrollIntoCourse(
    user.userId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student Semester registration course enrolled successfully!!!',
    data: result
  });
});

const withdrawFromCourse = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await SemesterRegistrationService.withdrawFromCourse(
    user.userId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Student Semester registration course withdraw successfully!!!',
    data: result
  });
});

const confirmMyRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    const result = await SemesterRegistrationService.confirmMyRegistration(
      user.userId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Confirm your registration!',
      data: result
    });
  }
);

const getMyRegistration = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const result = await SemesterRegistrationService.getMyRegistration(
    user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My registration data fetched!',
    data: result
  });
});

const startNewSemester = catchAsync(async (req: Request, res: Response) => {
  const result = await SemesterRegistrationService.startNewSemester(
    req.params.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Semester Started Successfully!!',
    data: result
  });
});

export const SemesterRegistrationController = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  update,
  deleteFromDB,
  startMyRegistration,
  enrollIntoCourse,
  withdrawFromCourse,
  confirmMyRegistration,
  getMyRegistration,
  startNewSemester
};
