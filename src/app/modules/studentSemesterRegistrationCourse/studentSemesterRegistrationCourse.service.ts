import { SemesterRegistrationStatus } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { IEnrolledCourse } from '../semesterRegistration/semesterRegistration.interface';

const enrollIntoCourse = async (
  authUserId: string,
  payload: IEnrolledCourse
): Promise<{ message: string }> => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId
    }
  });

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING
    }
  });

  const offeredCourse = await prisma.offerdCourse.findFirst({
    include: {
      course: true
    },
    where: {
      id: payload.offeredCourseId
    }
  });

  const offeredCourseSection = await prisma.offeredCourseSection.findFirst({
    where: {
      id: payload.offeredCourseSectionId
    }
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student Not Found');
  }
  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Semester registration not found');
  }
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }
  if (!offeredCourseSection) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Offered course section not found'
    );
  }

  if (
    offeredCourseSection.maxCapacity &&
    offeredCourseSection.currentlyEnrolledStudent &&
    offeredCourseSection.currentlyEnrolledStudent >=
      offeredCourseSection.maxCapacity
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student capacity is full!');
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.studentSemesterRegistrationCourse.create({
      data: {
        studentId: student?.id,
        semesterRegistrationId: semesterRegistration?.id,
        offeredCourseId: payload.offeredCourseId,
        offeredCourseSectionId: payload.offeredCourseSectionId
      }
    });

    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId
      },
      data: {
        currentlyEnrolledStudent: {
          increment: 1
        }
      }
    });

    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student?.id
        },
        semesterRegistration: {
          id: semesterRegistration?.id
        }
      },
      data: {
        totalCreditsTaken: {
          increment: offeredCourse.course.credits
        }
      }
    });
  });

  return {
    message: 'Successfully enrolled!'
  };
};

const withdrawFromCourse = async (
  authUserId: string,
  payload: IEnrolledCourse
): Promise<{ message: string }> => {
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUserId
    }
  });

  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING
    }
  });

  const offeredCourse = await prisma.offerdCourse.findFirst({
    include: {
      course: true
    },
    where: {
      id: payload.offeredCourseId
    }
  });

  console.log(offeredCourse);

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student Not Found');
  }
  if (!semesterRegistration) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Semester registration not found');
  }
  if (!offeredCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Offered Course not found');
  }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.studentSemesterRegistrationCourse.delete({
      where: {
        semesterRegistrationId_studentId_offeredCourseId: {
          semesterRegistrationId: semesterRegistration?.id,
          studentId: student?.id,
          offeredCourseId: payload.offeredCourseId
        }
      }
    });

    await transactionClient.offeredCourseSection.update({
      where: {
        id: payload.offeredCourseSectionId
      },
      data: {
        currentlyEnrolledStudent: {
          decrement: 1
        }
      }
    });

    await transactionClient.studentSemesterRegistration.updateMany({
      where: {
        student: {
          id: student?.id
        },
        semesterRegistration: {
          id: semesterRegistration?.id
        }
      },
      data: {
        totalCreditsTaken: {
          decrement: offeredCourse.course.credits
        }
      }
    });
  });

  return {
    message: 'Successfully withdraw from course!'
  };
};

export const StudentSemesterRegistrationCourseService = {
  enrollIntoCourse,
  withdrawFromCourse
};
