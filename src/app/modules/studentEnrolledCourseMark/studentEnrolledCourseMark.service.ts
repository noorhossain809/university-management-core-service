import {
  ExamType,
  PrismaClient,
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

const createStudentEnrolledCourseDefaultMark = async (
  transactionClient: Omit<
    PrismaClient<PrismaClientOptions, never, DefaultArgs>,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
  >,
  payload: {
    studentId: string;
    studentEnrolledCourseId: string;
    academicSemesterId: string;
  }
) => {
  const isExistMidtermData =
    await transactionClient.studentEnrolledCourseMarks.findFirst({
      where: {
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
          id: studentEnrolledCourse?.id
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

export const StudentEnrolledCourseMarkService = {
  createStudentEnrolledCourseDefaultMark,
  updateMarks,
  updateFinalMark
};
