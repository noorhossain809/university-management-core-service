import {
  PaymentStatus,
  Prisma,
  PrismaClient,
  StudentSemesterPayment,
} from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions,
} from '@prisma/client/runtime/library';
import axios from 'axios';
import httpStatus from 'http-status';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  studentSemesterPaymentRelationalFields,
  studentSemesterPaymentRelationalFieldsMapper,
  studentSemesterPaymentSearchableFields,
} from './studentSemesterPayment.constant';
import { IStudentSemesterPaymentFilterRequest } from './studentSemesterPayment.interface';

const createSemesterPayment = async (
  transactionClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  payload: {
    studentId: string;
    academicSemesterId: string;
    fullPaymentAmount: number;
  }
) => {
  const isExist = await transactionClient.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: payload.studentId,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
  });

  if (!isExist) {
    const dataToInsert = {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
      fullPaymentAmount: payload.fullPaymentAmount,
      partialPaymentAmount: payload.fullPaymentAmount * 0.5,
      totalDueAmount: payload.fullPaymentAmount,
      totalPaidAmount: 0,
    };

    await transactionClient.studentSemesterPayment.create({
      data: dataToInsert,
    });
  }
};

const getAllFromDB = async (
  filter: IStudentSemesterPaymentFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentSemesterPayment[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const { searchTerm, ...filtersData } = filter;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: studentSemesterPaymentSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => {
        if (studentSemesterPaymentRelationalFields.includes(key)) {
          return {
            [studentSemesterPaymentRelationalFieldsMapper[key]]: {
              id: (filtersData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filtersData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.studentSemesterPayment.findMany({
    include: {
      academicSemester: true,
      student: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.studentSemesterPayment.count({
    where: whereConditions,
  });

  return {
    meta: {
      limit,
      page,
      total,
    },
    data: result,
  };
};

const initiatePayment = async (payload: any, user: any) => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: user.userId,
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const studentSemesterPayment = await prisma.studentSemesterPayment.findFirst({
    where: {
      student: {
        id: student.id,
      },
      academicSemester: {
        id: payload.academicSemesterId,
      },
    },
    include: {
      academicSemester: true,
    },
  });

  console.log("payment info", studentSemesterPayment)

  if (!studentSemesterPayment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment information not found');
  }

  if (studentSemesterPayment.paymentStatus === PaymentStatus.FULL_PAID) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already paid');
  }

  if (
    studentSemesterPayment.paymentStatus === PaymentStatus.PARTIAL_PAID &&
    payload.paymentType !== 'FULL'
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already partial paid');
  }

  const isPendingPaymentExist =
    await prisma.studentSemesterPaymentHistory.findFirst({
      where: {
        studentSemesterPayment: {
          id: studentSemesterPayment.id,
        },
        isPaid: false,
      },
    });

  if (isPendingPaymentExist) {
    const paymentResponse = await axios.post(
      config.init_payment_endpoint ||
        'http://localhost:3333/api/v1/payment/init',
      {
        amount: isPendingPaymentExist.dueAmount,
        transactionId: isPendingPaymentExist.transactionId,
        studentId: student.studentId,
        customerName: `${student.firstName} ${student.lastName}`,
        customerEmail: student.email,
        address: 'Dhaka, Bangladesh',
        phone: student.contactNo,
      }
    );

    return {
      paymentUrl: paymentResponse.data,
      paymentDetails: isPendingPaymentExist,
    };
  }

  let payableAmount = 0;

  if (
    payload.paymentType === 'PARTIAL' &&
    studentSemesterPayment.totalPaidAmount === 0
  ) {
    payableAmount = studentSemesterPayment.partialPaymentAmount as number;
  } else {
    payableAmount = studentSemesterPayment.totalDueAmount as number;
  }

  const dataToInsert = {
    studentSemesterPaymentId: studentSemesterPayment.id,
    transactionId: `${student.studentId}-${
      studentSemesterPayment.academicSemester.title
    }-${Date.now()}`,
    dueAmount: payableAmount,
    paidAmount: 0,
  };

  const studentSemesterPaymentHistory =
    await prisma.studentSemesterPaymentHistory.create({
      data: dataToInsert,
    });

  const paymentResponse = await axios.post(
    config.init_payment_endpoint || 'http://localhost:3333/api/v1/payment/init',
    {
      amount: studentSemesterPaymentHistory.dueAmount,
      transactionId: studentSemesterPaymentHistory.transactionId,
      studentId: student.studentId,
      customerName: `${student.firstName} ${student.lastName}`,
      customerEmail: student.email,
      address: 'Dhaka, Bangladesh',
      phone: student.contactNo,
    }
  );

  return {
    paymentUrl: paymentResponse.data,
    paymentDetails: isPendingPaymentExist,
  };
};

const completePayment = async (payload: { transactionId: string }) => {
  const paymentDetails = await prisma.studentSemesterPaymentHistory.findFirst({
    where: {
      transactionId: payload.transactionId,
    },
  });

  if (!paymentDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment details not found');
  }

  if (paymentDetails.isPaid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Already paid');
  }

  const studentSemesterPayment = await prisma.studentSemesterPayment.findFirst({
    where: {
      id: paymentDetails.studentSemesterPaymentId,
    },
  });

  if (!studentSemesterPayment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Student Semester info not found!'
    );
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.studentSemesterPaymentHistory.update({
      where: {
        id: paymentDetails.id,
      },
      data: {
        isPaid: true,
        paidAmount: paymentDetails.dueAmount,
        dueAmount: 0,
      },
    });

    await transactionClient.studentSemesterPayment.update({
      where: {
        id: paymentDetails.studentSemesterPaymentId,
      },
      data: {
        totalPaidAmount:
          (studentSemesterPayment.totalPaidAmount as number) +
          paymentDetails.dueAmount,
        totalDueAmount:
          (studentSemesterPayment.totalDueAmount as number) -
          paymentDetails.dueAmount,
        paymentStatus:
          (studentSemesterPayment.totalDueAmount as number) -
            paymentDetails.dueAmount ===
          0
            ? PaymentStatus.FULL_PAID
            : PaymentStatus.PARTIAL_PAID,
      },
    });
  });

  return {
    message: 'Payment completed successfully!!!',
  };
};

const getMySemesterPayment = async (
  filters: IStudentSemesterPaymentFilterRequest,
  options: IPaginationOptions,
  authUser: any
): Promise<IGenericResponse<StudentSemesterPayment[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const student = await prisma.student.findFirst({
    where: {
      studentId: authUser.userId,
    },
  });
  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  filterData.studentId = student.id;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: studentSemesterPaymentSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (studentSemesterPaymentRelationalFields.includes(key)) {
          return {
            [studentSemesterPaymentRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.StudentSemesterPaymentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.studentSemesterPayment.findMany({
    include: {
      academicSemester: true,
      student: true,
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });

  const total = await prisma.studentSemesterPayment.count({
    where: whereConditions
  })


  return {
    meta: {
      limit,
      page,
      total
    },
    data: result
  }
};

export const StudentSemesterPaymentService = {
  createSemesterPayment,
  initiatePayment,
  completePayment,
  getAllFromDB,
  getMySemesterPayment,
};
