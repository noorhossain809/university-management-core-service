import {
  Course,
  OfferdCourse,
  SemesterRegistration,
  SemesterRegistrationStatus,
  StudentSemesterRegistration,
  StudentSemesterRegistrationCourse
} from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { asyncForEch } from '../../../shared/utils';
import { StudentEnrolledCourseMarkService } from '../studentEnrolledCourseMark/studentEnrolledCourseMark.service';
import { StudentSemesterPaymentService } from '../studentSemesterPayment/studentSemesterPayment.service';
import { StudentSemesterRegistrationCourseService } from '../studentSemesterRegistrationCourse/studentSemesterRegistrationCourse.service';
import { IEnrolledCourse } from './semesterRegistration.interface';

const insertIntoDB = async (
  data: SemesterRegistration
): Promise<SemesterRegistration> => {
  const isAnySemesterRegUpcomingOrOngoing =
    await prisma.semesterRegistration.findFirst({
      where: {
        OR: [
          {
            status: SemesterRegistrationStatus.UPCOMING
          },
          {
            status: SemesterRegistrationStatus.ONGOING
          }
        ]
      }
    });

  if (isAnySemesterRegUpcomingOrOngoing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `There is an already ${isAnySemesterRegUpcomingOrOngoing.status} registration`
    );
  }
  const result = await prisma.semesterRegistration.create({
    data
  });

  return result;
};

const getAllFromDB = async () => {
  const result = await prisma.semesterRegistration.findMany();

  return result;
};

const getByIdFromDB = async (id: string) => {
  const result = await prisma.semesterRegistration.findUnique({
    where: {
      id
    }
  });

  return result;
};
const update = async (
  id: string,
  payload: Partial<SemesterRegistration>
): Promise<SemesterRegistration> => {
  const isExist = await prisma.semesterRegistration.findUnique({
    where: {
      id
    }
  });

  if (!isExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Data not found');
  }

  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.UPCOMING &&
    payload.status !== SemesterRegistrationStatus.ONGOING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Can only move from ${SemesterRegistrationStatus.UPCOMING} to ${SemesterRegistrationStatus.ONGOING}`
    );
  }
  if (
    payload.status &&
    isExist.status === SemesterRegistrationStatus.ONGOING &&
    payload.status !== SemesterRegistrationStatus.ENDED
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Can only move from ONGOING to ENDED'
    );
  }

  const result = await prisma.semesterRegistration.update({
    where: {
      id
    },
    data: payload
  });

  return result;
};

const deleteFromDB = async (id: string) => {
  const result = await prisma.semesterRegistration.delete({
    where: {
      id
    }
  });

  return result;
};

const startMyRegistration = async (
  authUserId: string
): Promise<{
  semesterRegistration: SemesterRegistration | null;
  studentSemesterRegistration: StudentSemesterRegistration | null;
}> => {
  const studentInfo = await prisma.student.findFirst({
    where: {
      studentId: authUserId
    }
  });

  if (!studentInfo) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Student Not Found');
  }

  const semesterRegistrationInfo = await prisma.semesterRegistration.findFirst({
    where: {
      status: {
        in: [
          SemesterRegistrationStatus.ONGOING,
          SemesterRegistrationStatus.UPCOMING
        ]
      }
    }
  });

  if (
    semesterRegistrationInfo?.status === SemesterRegistrationStatus.UPCOMING
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Registration is not started yet'
    );
  }

  let studentRegistration = await prisma.studentSemesterRegistration.findFirst({
    where: {
      student: {
        id: studentInfo?.id
      },
      semesterRegistration: {
        id: semesterRegistrationInfo?.id
      }
    }
  });

  if (!studentRegistration) {
    studentRegistration = await prisma.studentSemesterRegistration.create({
      data: {
        student: {
          connect: {
            id: studentInfo?.id
          }
        },
        semesterRegistration: {
          connect: {
            id: semesterRegistrationInfo?.id
          }
        }
      }
    });
  }
  return {
    semesterRegistration: semesterRegistrationInfo,
    studentSemesterRegistration: studentRegistration
  };
};

const enrollIntoCourse = async (
  authUserId: string,
  payload: IEnrolledCourse
): Promise<{ message: string }> => {
  return StudentSemesterRegistrationCourseService.enrollIntoCourse(
    authUserId,
    payload
  );
};

const withdrawFromCourse = async (
  authUserId: string,
  payload: IEnrolledCourse
): Promise<{ message: string }> => {
  return StudentSemesterRegistrationCourseService.withdrawFromCourse(
    authUserId,
    payload
  );
};

const confirmMyRegistration = async (authUserId: string) => {
  console.log(authUserId);
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING
    }
  });

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id
        },
        student: {
          studentId: authUserId
        }
      }
    });
  if (!studentSemesterRegistration) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You are not recognized for this semester!'
    );
  }
  if (studentSemesterRegistration.totalCreditsTaken === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You are not enrolled in any course!'
    );
  }

  if (
    studentSemesterRegistration?.totalCreditsTaken &&
    semesterRegistration?.minCredit &&
    semesterRegistration.maxCredit &&
    (studentSemesterRegistration?.totalCreditsTaken <
      semesterRegistration?.minCredit ||
      studentSemesterRegistration?.totalCreditsTaken >
        semesterRegistration?.maxCredit)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You can take only ${semesterRegistration.minCredit} to ${semesterRegistration.maxCredit} credits`
    );
  }

  await prisma.studentSemesterRegistration.update({
    where: {
      id: studentSemesterRegistration?.id
    },
    data: {
      isConfirm: true
    }
  });

  return {
    message: 'Your registration is confirmed!'
  };
};

const getMyRegistration = async (authUserId: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findFirst({
    where: {
      status: SemesterRegistrationStatus.ONGOING
    },
    include: {
      academicSemester: true
    }
  });

  const studentSemesterRegistration =
    await prisma.studentSemesterRegistration.findFirst({
      where: {
        semesterRegistration: {
          id: semesterRegistration?.id
        },
        student: {
          studentId: authUserId
        }
      },
      include: {
        semesterRegistration: true,
        student: true
      }
    });

  return {
    semesterRegistration,
    studentSemesterRegistration
  };
};

const startNewSemester = async (id: string) => {
  const semesterRegistration = await prisma.semesterRegistration.findUnique({
    where: {
      id
    },
    include: {
      academicSemester: true
    }
  });

  if (!semesterRegistration) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Semester Registration Not Found'
    );
  }

  if (semesterRegistration.status !== SemesterRegistrationStatus.ENDED) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Semester Registration is not ended yet!'
    );
  }

  // if (semesterRegistration.academicSemester.isCurrent) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     'Semester Registration is already started!'
  //   );
  // }

  await prisma.$transaction(async transactionClient => {
    await transactionClient.academicSemester.updateMany({
      where: {
        isCurrent: true
      },
      data: {
        isCurrent: false
      }
    });

    await transactionClient.academicSemester.update({
      where: {
        id: semesterRegistration.academicSemesterId
      },
      data: {
        isCurrent: true
      }
    });

    const studentSemesterRegistrations =
      await prisma.studentSemesterRegistration.findMany({
        where: {
          semesterRegistration: {
            id
          },
          isConfirm: true
        }
      });
    await asyncForEch(
      studentSemesterRegistrations,
      async (studentSemReg: StudentSemesterRegistration) => {
        if (studentSemReg.totalCreditsTaken) {
          const totalSemesterPaymentAmount =
            studentSemReg.totalCreditsTaken * 5000;
          await StudentSemesterPaymentService.createSemesterPayment(
            transactionClient,
            {
              studentId: studentSemReg.studentId,
              academicSemesterId: semesterRegistration.academicSemesterId,
              fullPaymentAmount: totalSemesterPaymentAmount
            }
          );
        }
        const studentSemesterRegCourses =
          await transactionClient.studentSemesterRegistrationCourse.findMany({
            where: {
              semesterRegistration: {
                id
              },
              student: {
                id: studentSemReg.studentId
              }
            },
            include: {
              offeredCourse: {
                include: {
                  course: true
                }
              }
            }
          });
        await asyncForEch(
          studentSemesterRegCourses,
          async (
            item: StudentSemesterRegistrationCourse & {
              offeredCourse: OfferdCourse & {
                course: Course;
              };
            }
          ) => {
            const isExistEnrolledCourse =
              await transactionClient.studentEnrolledCourse.findFirst({
                where: {
                  studentId: item.studentId,
                  courseId: item.offeredCourse.courseId,
                  academicSemesterId: semesterRegistration.academicSemesterId
                }
              });

            if (!isExistEnrolledCourse) {
              const enrolledCourseData = {
                studentId: item.studentId,
                courseId: item.offeredCourse.courseId,
                academicSemesterId: semesterRegistration.academicSemesterId
              };

              const studentEnrolledCourseData =
                await transactionClient.studentEnrolledCourse.create({
                  data: enrolledCourseData
                });

              await StudentEnrolledCourseMarkService.createStudentEnrolledCourseDefaultMark(
                transactionClient,
                {
                  studentId: studentSemReg.studentId,
                  studentEnrolledCourseId: studentEnrolledCourseData.id,
                  academicSemesterId:
                    studentEnrolledCourseData.academicSemesterId
                }
              );
            }
          }
        );
      }
    );
  });
  return {
    message: 'Semester started successfully!!!'
  };
};

export const SemesterRegistrationService = {
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
