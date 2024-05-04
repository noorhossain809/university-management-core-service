import { Course, courseFaculty } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { asyncForEch } from '../../../shared/utils';
import { ICourseSearchableFields } from './course.constant';
import {
  ICourseData,
  ICourseRequest,
  IPrerequisiteCourseRequest
} from './course.interface';

const createACourse = async (data: ICourseData): Promise<any> => {
  const { preRequisiteCourses, ...courseData } = data;
  console.log('pre', preRequisiteCourses);

  const newCourse = await prisma.$transaction(async transactionClient => {
    const result = await transactionClient.course.create({
      data: courseData
    });

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
    }

    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      await asyncForEch(
        preRequisiteCourses,
        async (prerequisiteCourse: IPrerequisiteCourseRequest) => {
          const createPrerequisite =
            await transactionClient.courseToPrerequisite.create({
              data: {
                courseId: result.id,
                preRequisiteId: prerequisiteCourse.courseId
              }
            });
          console.log(createPrerequisite);
        }
      );
    }

    return result;
  });

  if (newCourse) {
    const responseData = await prisma.course.findUnique({
      where: {
        id: newCourse.id
      },
      include: {
        Prerequisite: {
          include: {
            preRequisite: true
          }
        },
        PrerequisiteFor: {
          include: {
            course: true
          }
        }
      }
    });

    return responseData;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to create course');
};

const getAllCourses = async (
  filters: ICourseRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Course[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ICourseSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key]
        }
      }))
    });
  }

  const whereConditions =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.course.findMany({
    include: {
      Prerequisite: {
        include: {
          preRequisite: true
        }
      },
      PrerequisiteFor: {
        include: {
          course: true
        }
      }
    },
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });

  const total = await prisma.course.count();

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

const getSingleCourse = async (id: string): Promise<Course | null> => {
  const result = await prisma.course.findUnique({
    where: {
      id
    },
    include: {
      Prerequisite: {
        include: {
          preRequisite: true
        }
      },
      PrerequisiteFor: {
        include: {
          course: true
        }
      }
    }
  });

  return result;
};

const updateOneCourse = async (
  id: string,
  payload: ICourseData
): Promise<Course | null> => {
  const { prerequisiteCourses, ...courseData } = payload;

  await prisma.$transaction(async transactionClient => {
    const result = await transactionClient.course.update({
      where: {
        id
      },
      data: courseData
    });

    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to update course');
    }

    if (prerequisiteCourses && prerequisiteCourses.length > 0) {
      const deletePrerequisite = prerequisiteCourses.filter(
        coursePrerequisite =>
          coursePrerequisite.courseId && coursePrerequisite.isDeleted
      );

      const newPrerequisite = prerequisiteCourses.filter(
        coursePrerequisite =>
          coursePrerequisite.courseId && !coursePrerequisite.isDeleted
      );

      await asyncForEch(
        deletePrerequisite,
        async (deleteCourse: IPrerequisiteCourseRequest) => {
          await transactionClient.courseToPrerequisite.deleteMany({
            where: {
              AND: [
                {
                  courseId: id
                },
                {
                  preRequisiteId: deleteCourse.courseId
                }
              ]
            }
          });
        }
      );

      await asyncForEch(
        newPrerequisite,
        async (insertPrerequisite: IPrerequisiteCourseRequest) => {
          await transactionClient.courseToPrerequisite.create({
            data: {
              courseId: id,
              preRequisiteId: insertPrerequisite.courseId
            }
          });
        }
      );
    }
    return result;
  });

  const responseData = await prisma.course.findUnique({
    where: {
      id
    },
    include: {
      Prerequisite: {
        include: {
          preRequisite: true
        }
      },
      PrerequisiteFor: {
        include: {
          course: true
        }
      }
    }
  });

  return responseData;
};

const assignFaculty = async (
  id: string,
  payload: string[]
): Promise<courseFaculty[]> => {
  await prisma.courseFaculty.createMany({
    data: payload.map(facultyId => ({
      courseId: id,
      facultyId: facultyId
    }))
  });

  const assignFacultiesData = await prisma.courseFaculty.findMany({
    where: {
      courseId: id
    },
    include: {
      faculty: true
    }
  });
  return assignFacultiesData;
};

const removeFaculties = async (
  id: string,
  payload: string[]
): Promise<courseFaculty[] | null> => {
  await prisma.courseFaculty.deleteMany({
    where: {
      courseId: id,
      facultyId: {
        in: payload
      }
    }
  });

  const removeFacultiesData = await prisma.courseFaculty.findMany({
    where: {
      courseId: id
    },
    include: {
      faculty: true
    }
  });

  return removeFacultiesData;
};
export const CourseService = {
  createACourse,
  getAllCourses,
  getSingleCourse,
  updateOneCourse,
  assignFaculty,
  removeFaculties
};
