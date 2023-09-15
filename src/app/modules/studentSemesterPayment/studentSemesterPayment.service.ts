import { PrismaClient } from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions
} from '@prisma/client/runtime/library';

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
        id: payload.studentId
      },
      academicSemester: {
        id: payload.academicSemesterId
      }
    }
  });

  if (!isExist) {
    const dataToInsert = {
      studentId: payload.studentId,
      academicSemesterId: payload.academicSemesterId,
      fullPaymentAmount: payload.fullPaymentAmount,
      partialPaymentAmount: payload.fullPaymentAmount * 0.5,
      totalDueAmount: payload.fullPaymentAmount,
      totalPaidAmount: 0
    };

    await transactionClient.studentSemesterPayment.create({
      data: dataToInsert
    });
  }
};

export const StudentSemesterPaymentService = {
  createSemesterPayment
};
