import { PaginationHelper } from './../../../../../university-management-auth-service/src/helper/paginationHelper';
import {
  ExamType,
  PrismaClient,
  StudentEnrolledCourseMarks,
  StudentEnrolledCourseStatus
} from '@prisma/client';
import {
  DefaultArgs,
  PrismaClientOptions
} from '@prisma/client/runtime/library';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { StudentEnrolledCourseMarkUtils } from './studentEnrolledCourseMark.utils';
import { IStudentEnrolledCourseMarkRequest } from './studentEnrolledCourseMark.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';

const createStudentEnrolledCourseDefaultMark = async (
  transactionClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  // prismaClient: Omit<PrismaClient<PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  payload: {
    studentId: string;
    studentEnrolledCourseId: string;
    academicSemesterId: string;
  }
) => {
  const isExistMidtermData =
    await transactionClient.studentEnrolledCourseMarks.findFirst({
      where: {
        exam: ExamType.MIDTERM,
        student: {
          id: payload.studentId
        },
        studentEnrolledCourse: {
          id: payload.studentEnrolledCourseId
        },
        academicSemester: {
          id: payload.academicSemesterId
        }
      }
    });

  if (!isExistMidtermData) {
    await transactionClient.studentEnrolledCourseMarks.create({
      data: {
        student: {
          connect: {
            id: payload.studentId
          }
        },
        studentEnrolledCourse: {
          connect: {
            id: payload.studentEnrolledCourseId
          }
        },
        academicSemester: {
          connect: {
            id: payload.academicSemesterId
          }
        },
        exam: ExamType.MIDTERM
      }
    });
  }

  const isExistFinalData =
    await transactionClient.studentEnrolledCourseMarks.findFirst({
      where: {
        exam: ExamType.FINAL,
        student: {
          id: payload.studentId
        },
        studentEnrolledCourse: {
          id: payload.studentEnrolledCourseId
        },
        academicSemester: {
          id: payload.academicSemesterId
        }
      }
    });

  if (!isExistFinalData) {
    await transactionClient.studentEnrolledCourseMarks.create({
      data: {
        student: {
          connect: {
            id: payload.studentId
          }
        },
        studentEnrolledCourse: {
          connect: {
            id: payload.studentEnrolledCourseId
          }
        },
        academicSemester: {
          connect: {
            id: payload.academicSemesterId
          }
        },
        exam: ExamType.FINAL
      }
    });
  }
};

const getAllFromDB = async (
  filters: IStudentEnrolledCourseMarkRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<StudentEnrolledCourseMarks[]>> => {
  const { limit, page } = paginationHelpers.calculatePagination(options);

  const marks = await prisma.studentEnrolledCourseMarks.findMany({
    where: {
      student: {
        id: filters.studentId
      },
      academicSemester: {
        id: filters.academicSemesterId
      },
      studentEnrolledCourse: {
        course: {
          id: filters.courseId
        }
      }
    },
    include: {
      student: true,
      studentEnrolledCourse: {
        include: {
          course: true
        }
      }
    }
  });

  return {
    meta: {
      total: marks.length,
      limit,
      page
    },
    data: marks
  };
};

const updateMarks = async (payload: any) => {
  const { studentId, academicSemesterId, courseId, exam, marks } = payload;
  const studentEnrolledCourseMark =
    await prisma.studentEnrolledCourseMarks.findFirst({
      where: {
        student: {
          id: studentId
        },
        academicSemester: {
          id: academicSemesterId
        },
        studentEnrolledCourse: {
          course: {
            id: courseId
          }
        },
        exam
      }
    });

  if (!studentEnrolledCourseMark) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Student enrolled course mark not found!'
    );
  }

  const result = StudentEnrolledCourseMarkUtils.getGradeFromMarks(marks);

  const updateStudentMarks = await prisma.studentEnrolledCourseMarks.updateMany(
    {
      where: {
        id: studentEnrolledCourseMark.id
      },
      data: {
        marks,
        grade: result.grade
      }
    }
  );
  return updateStudentMarks;
};

const updateFinalMark = async (payload: any) => {
  const { studentId, academicSemesterId, courseId } = payload;
  const studentEnrolledCourse = await prisma.studentEnrolledCourse.findFirst({
    where: {
      student: {
        id: studentId
      },
      academicSemester: {
        id: academicSemesterId
      },
      course: {
        id: courseId
      }
    }
  });
  if (!studentEnrolledCourse) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Student enrolled course data not found!'
    );
  }
  // console.log(studentEnrolledCourse);

  const studentEnrolledCourseMarks =
    await prisma.studentEnrolledCourseMarks.findMany({
      where: {
        student: {
          id: studentId
        },
        academicSemester: {
          id: academicSemesterId
        },
        studentEnrolledCourse: {
          course: {
            id: courseId
          }
        }
      }
    });
  if (!studentEnrolledCourseMarks.length) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'student enrolled course mark not found!'
    );
  }

  const midTermMarks =
    studentEnrolledCourseMarks.find(item => item.exam === ExamType.MIDTERM)
      ?.marks || 0;
  const finalMarks =
    studentEnrolledCourseMarks.find(item => item.exam === ExamType.FINAL)
      ?.marks || 0;

  const totalMarks =
    Math.ceil(midTermMarks * 0.4) + Math.ceil(finalMarks * 0.6);
  const result = StudentEnrolledCourseMarkUtils.getGradeFromMarks(totalMarks);

  await prisma.studentEnrolledCourse.updateMany({
    where: {
      student: {
        id: studentId
      },
      academicSemester: {
        id: academicSemesterId
      },
      course: {
        id: courseId
      }
    },
    data: {
      grade: result.grade,
      point: result.point,
      totalMarks: totalMarks,
      status: StudentEnrolledCourseStatus.COMPLETED
    }
  });

  const grades = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        id: studentId
      },
      status: StudentEnrolledCourseStatus.COMPLETED
    },
    include: {
      course: true
    }
  });
  const academicResult = await StudentEnrolledCourseMarkUtils.calcCGPAandGrade(
    grades
  );

  const studentAcademicInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      student: {
        id: studentId
      }
    }
  });

  if (studentAcademicInfo) {
    await prisma.studentAcademicInfo.update({
      where: {
        id: studentAcademicInfo.id
      },
      data: {
        student: {
          connect: {
            id: studentId
          }
        },
        totalCompletedCredit: academicResult.totalCompletedCredit,
        cgpa: academicResult.cgpa
      }
    });
  } else {
    await prisma.studentAcademicInfo.create({
      data: {
        student: {
          connect: {
            id: studentId
          }
        },
        totalCompletedCredit: academicResult.totalCompletedCredit,
        cgpa: academicResult.cgpa
      }
    });
  }

  return grades;
};

const getMyCourseMarks = async (
  filter: IStudentEnrolledCourseMarkRequest,
  options: IPaginationOptions,
  authUser: any
): Promise<IGenericResponse<StudentEnrolledCourseMarks[]>> => {
  const { limit, page } = PaginationHelper.calculatePagination(options);
  const student = await prisma.student.findFirst({
    where: {
      studentId: authUser.userId
    }
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found');
  }

  const marks = await prisma.studentEnrolledCourseMarks.findMany({
    where: {
      student: {
        id: student.id
      },
      academicSemester: {
        id: filter.academicSemesterId
      },
      studentEnrolledCourse: {
        course: {
          id: filter.courseId
        }
      }
    },
    include: {
      studentEnrolledCourse: {
        include: {
          course: true
        }
      }
    }
  });

  return {
    meta: {
      page,
      limit,
      total: marks.length
    },
    data: marks
  };
};

export const StudentEnrolledCourseMarkService = {
  createStudentEnrolledCourseDefaultMark,
  getAllFromDB,
  updateMarks,
  updateFinalMark,
  getMyCourseMarks
};
