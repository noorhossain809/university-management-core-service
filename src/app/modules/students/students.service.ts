import {
  Prisma,
  PrismaClient,
  Student,
  StudentEnrolledCourseStatus
} from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { StudentUtils } from './student.utils';
import { StudentsSearchAbleFields } from './students.constant';
import { IStudentsFilterableFields } from './students.interface';

const prisma = new PrismaClient();

const createStudents = async (studentsData: Student): Promise<Student> => {
  const result = await prisma.student.create({
    data: studentsData
  });

  return result;
};

const getAllStudents = async (
  filters: IStudentsFilterableFields,
  options: IPaginationOptions
): Promise<IGenericResponse<Student[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: StudentsSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      AND: Object.keys(filtersData).map(key => ({
        [key]: {
          equals: (filtersData as any)[key]
        }
      }))
    });
  }

  const whereConditions = (Prisma.studentsWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {});

  const result = await prisma.student.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });
  const total = await prisma.student.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const singleStudents = async (id: string): Promise<Student | null> => {
  const result = await prisma.student.findUnique({
    where: {
      id
    }
  });
  return result;
};

const updateStudent = async (
  id: string,
  payload: Partial<Student>
): Promise<Student> => {
  const result = await prisma.student.update({
    where: {
      id
    },
    data: payload
  });
  return result;
};

const deleteStudent = async (id: string): Promise<Student> => {
  const result = await prisma.student.delete({
    where: {
      id
    }
  });
  return result;
};

const myCourses = async (
  authUserId: string,
  filter: {
    courseId?: string | undefined;
    academicSemesterId?: string | undefined;
  }
) => {
  if (!filter.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true
      }
    });

    filter.academicSemesterId = currentSemester?.id;
  }

  const result = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: authUserId
      },
      ...filter
    },
    include: {
      course: true
    }
  });

  return result;
};

const getMyCourseSchedules = async (
  authUserId: string,
  filter: {
    courseId?: string | undefined;
    academicSemesterId?: string | undefined;
  }
) => {
  if (!filter.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true
      }
    });
    filter.academicSemesterId = currentSemester?.id;
  }

  const getEnrolledCourses = await myCourses(authUserId, filter);
  const studentEnrolledCourseIds = getEnrolledCourses.map(id => id.courseId);
  const result = await prisma.studentSemesterRegistrationCourse.findMany({
    where: {
      student: {
        studentId: authUserId
      },
      semesterRegistration: {
        academicSemester: {
          id: filter.academicSemesterId
        }
      },
      offeredCourse: {
        course: {
          id: {
            in: studentEnrolledCourseIds
          }
        }
      }
    },
    include: {
      offeredCourse: {
        include: {
          course: true
        }
      },
      offeredCourseSection: {
        include: {
          offeredCourseClassSchedules: {
            include: {
              Room: {
                include: {
                  building: true
                }
              },
              Faculty: true
            }
          }
        }
      }
    }
  });
  return result;
};

const getMyAcademicInfo = async (authUserId: string) => {
  const academicInfo = await prisma.studentAcademicInfo.findFirst({
    where: {
      student: {
        studentId: authUserId
      }
    }
  });

  const enrolledCourses = await prisma.studentEnrolledCourse.findMany({
    where: {
      student: {
        studentId: authUserId
      },
      status: StudentEnrolledCourseStatus.COMPLETED
    },
    include: {
      course: true,
      academicSemester: true
    }
  });

  const groupByAcademicInfo = await StudentUtils.groupByAcademicInfo(
    enrolledCourses
  );

  return {
    academicInfo,
    courses: groupByAcademicInfo
  };
};

const createStudentFromEvents = async (e: any) => {
  const studentData: Partial<Student> = {
    studentId: e.id,
    firstName: e.name.firstName,
    middleName: e.name.middleName,
    lastName: e.name.lastName,
    email: e.email,
    contactNo: e.contactNo,
    gender: e.gender,
    bloodGroup: e.bloodGroup,
    academicDepartmentId: e.academicDepartment.syncId,
    academicFacultyId: e.academicFaculty.syncId,
    academicSemesterId: e.academicSemester.syncId
  };

  await createStudents(studentData as Student);
};

export const StudentsService = {
  createStudents,
  getAllStudents,
  singleStudents,
  updateStudent,
  deleteStudent,
  myCourses,
  getMyCourseSchedules,
  getMyAcademicInfo,
  createStudentFromEvents
};
