import { OfferdCourse, Prisma } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { asyncForEch } from '../../../shared/utils';
import {
  ICourseOffer,
  IOfferedCourseFilterRequest
} from './offeredCourses.interface';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import {
  offeredCourseRelationalFields,
  offeredCourseRelationalFieldsMapper,
  offeredCourseSearchableFields
} from './offeredCourse.constants';

const insertIntoDB = async (data: ICourseOffer): Promise<OfferdCourse[]> => {
  const { academicDepartmentId, semesterRegistrationId, courseIds } = data;

  const result: OfferdCourse[] = [];
  await asyncForEch(courseIds, async (courseId: string) => {
    const alreadyExist = await prisma.offerdCourse.findFirst({
      where: {
        academicDepartmentId,
        semesterRegistrationId,
        courseId
      }
    });

    if (!alreadyExist) {
      const insertOfferCourse = await prisma.offerdCourse.create({
        data: {
          academicDepartmentId,
          semesterRegistrationId,
          courseId
        },
        include: {
          academicDepartment: true,
          semesterRegistration: true,
          course: true
        }
      });
      result.push(insertOfferCourse);
    }
  });
  return result;
};

const getAllFromDB = async (
  filters: IOfferedCourseFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: offeredCourseSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (offeredCourseRelationalFields.includes(key)) {
          return {
            [offeredCourseRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key]
            }
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key]
            }
          };
        }
      })
    });
  }

  const whereConditions: Prisma.OfferdCourseWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.offerdCourse.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc'
          },
    include: {
      academicDepartment: true,
      semesterRegistration: true,
      course: true
    }
  });

  const total = await prisma.offerdCourse.count({
    where: whereConditions
  });

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

export const OfferedCourseService = {
  insertIntoDB,
  getAllFromDB
};
