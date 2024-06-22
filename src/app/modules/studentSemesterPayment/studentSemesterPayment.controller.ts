import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { studentSemesterPaymentFilterableFields } from "./studentSemesterPayment.constant";
import { StudentSemesterPaymentService } from "./studentSemesterPayment.service";

const getAllFromDB = catchAsync(async(req: Request, res: Response) => {
       const filters = pick(req.query, studentSemesterPaymentFilterableFields)
       const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder'])
    const result = await StudentSemesterPaymentService.getAllFromDB(filters, options)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Student semester payment fetched successfully!!!',
        data: result
    })
})
const getMySemesterPayment = catchAsync(async(req: Request, res: Response) => {
       const filters = pick(req.query, studentSemesterPaymentFilterableFields)
       const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder'])
       const user = (req as any).user
    const result = await StudentSemesterPaymentService.getMySemesterPayment(filters, options, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'My semester payment fetched successfully!!!',
        data: result
    })
})

const initiatePayment = catchAsync(async(req: Request, res: Response) => {
    console.log('req', req)
       const user = (req as any).user;
       console.log('user', user)
    const result = await StudentSemesterPaymentService.initiatePayment(req.body, user)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment initiate',
        data: result
    })
})


const completePayment = catchAsync(async(req: Request, res: Response) => {
    const result = await StudentSemesterPaymentService.completePayment(req.body)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment completed',
        data: result
    })
})

export const StudentSemesterPaymentController = {
    initiatePayment,
    completePayment,
    getAllFromDB,
    getMySemesterPayment
}