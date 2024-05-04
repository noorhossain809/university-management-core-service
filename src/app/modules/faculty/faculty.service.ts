import { Faculty, Prisma, Student, courseFaculty } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { FacultySearchAbleFields } from './faculty.constant';
import {
  IFacultyCourseStudentRequest,
  IFacultyFilterableFields
} from './faculty.interface';
import prisma from '../../../shared/prisma';

// const prisma = new PrismaClient();

// const createFaculty = async (facultyData: Faculty): Promise<Faculty> => {
//   const result = await prisma.faculty.create({
//     data: facultyData,
//     include: {
//       academicDepartment: true,
//       academicFaculty: true
//     }
//   });

//   return result;
// };

const insertIntoDB = async (data: Faculty): Promise<Faculty> => {
  const result = await prisma.faculty.create({
    data,
    include: {
      academicDepartment: true,
      academicFaculty: true
    }
  });
  return result;
};

const getAllFaculty = async (
  filters: IFacultyFilterableFields,
  options: IPaginationOptions
): Promise<IGenericResponse<Faculty[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: FacultySearchAbleFields.map(field => ({
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

  const whereConditions = (Prisma.FacultyWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {});

  const result = await prisma.faculty.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });
  const total = await prisma.faculty.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const singleFaculty = async (id: string): Promise<Faculty | null> => {
  const result = await prisma.faculty.findUnique({
    where: {
      id
    }
  });
  return result;
};

const assignCourses = async (
  id: string,
  payload: string[]
): Promise<courseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map(courseId => ({
      facultyId: id,
      courseId: courseId
    }))
  });

  const assignCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id
    },
    include: {
      course: true
    }
  });
  return assignCoursesData;
};

const removeCourses = async (
  id: string,
  payload: string[]
): Promise<courseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      facultyId: id,
      courseId: {
        in: payload
      }
    }
  });

  const removeCoursesData = await prisma.courseFaculty.findMany({
    where: {
      facultyId: id
    },
    include: {
      course: true
    }
  });

  return removeCoursesData;
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

  const offeredCourseSection = await prisma.offeredCourseSection.findMany({
    where: {
      offeredCourseClassSchedules: {
        some: {
          Faculty: {
            facultyId: authUserId
          }
        }
      },
      OfferedCourse: {
        semesterRegistration: {
          academicSemester: {
            id: filter.academicSemesterId
          }
        }
      }
    },
    include: {
      OfferedCourse: {
        include: {
          course: true
        }
      },
      offeredCourseClassSchedules: {
        include: {
          Room: {
            include: {
              building: true
            }
          }
        }
      }
    }
  });

  const courseAndSchedule = offeredCourseSection.reduce(
    (acc: any, obj: any) => {
      const course = obj.OfferedCourse.course;
      const classSchedule = obj.offeredCourseClassSchedules;

      const existingCourse = acc.find(
        (item: any) => item.course?.id === course?.id
      );

      if (existingCourse) {
        existingCourse.sections.push({
          section: obj,
          classSchedule
        });
      } else {
        acc.push({
          course,
          sections: [
            {
              section: obj,
              classSchedule
            }
          ]
        });
      }
      return acc;
    },
    []
  );
  return courseAndSchedule;
};

const getMyCourseStudent = async (
  filters: IFacultyCourseStudentRequest,
  options: IPaginationOptions,
  authUser: any
): Promise<IGenericResponse<Student[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  if (!filters.academicSemesterId) {
    const currentSemester = await prisma.academicSemester.findFirst({
      where: {
        isCurrent: true
      }
    });
    if (currentSemester) {
      filters.academicSemesterId = currentSemester.id;
    }
  }

  const offeredCourseSections =
    await prisma.studentSemesterRegistrationCourse.findMany({
      where: {
        offeredCourse: {
          course: {
            id: filters.courseId
          }
        },
        offeredCourseSection: {
          OfferedCourse: {
            semesterRegistration: {
              academicSemester: {
                id: filters.academicSemesterId
              }
            }
          },
          id: filters.offeredCourseSectionId
        }
      },
      include: {
        student: true
      },
      take: limit,
      skip
    });

  const students = offeredCourseSections.map(
    offeredCourseSection => offeredCourseSection.student
  );

  const total = await prisma.studentSemesterRegistrationCourse.count({
    where: {
      offeredCourse: {
        course: {
          id: filters.courseId
        }
      },
      offeredCourseSection: {
        SemesterRegistration: {
          academicSemester: {
            id: filters.academicSemesterId
          }
        },
        id: filters.offeredCourseSectionId
      }
    }
  });

  return {
    meta: {
      page,
      limit,
      total
    },
    data: students
  };
};

const createFacultyFromEvents = async (e: any) => {
  const facultyData: Partial<Faculty> = {
    facultyId: e.id,
    firstName: e.name.firstName,
    middleName: e.name.middleName,
    lastName: e.name.lastName,
    email: e.email,
    contactNo: e.contactNo,
    gender: e.gender,
    bloodGroup: e.bloodGroup,
    designation: e.designation,
    academicDepartmentId: e.academicDepartment.syncId,
    academicFacultyId: e.academicFaculty.syncId
  };

  await insertIntoDB(facultyData as Faculty);
};

const updateFacultyFromEvents = async (e: any) => {
  const isExist = await prisma.faculty.findFirst({
    where: {
      facultyId: e.id
    }
  });
  if (!isExist) {
    createFacultyFromEvents(e);
  } else {
    const facultyData: Partial<Faculty> = {
      facultyId: e.id,
      firstName: e.name.firstName,
      middleName: e.name.middleName,
      lastName: e.name.lastName,
      email: e.email,
      contactNo: e.contactNo,
      gender: e.gender,
      bloodGroup: e.bloodGroup,
      designation: e.designation,
      academicDepartmentId: e.academicDepartment.syncId,
      academicFacultyId: e.academicFaculty.syncId
    };

    const result = await prisma.faculty.updateMany({
      where: {
        facultyId: e.id
      },
      data: facultyData
    });
    console.log(result);
  }
};

export const FacultyService = {
  insertIntoDB,
  getAllFaculty,
  singleFaculty,
  assignCourses,
  removeCourses,
  myCourses,
  createFacultyFromEvents,
  updateFacultyFromEvents,
  getMyCourseStudent
};
