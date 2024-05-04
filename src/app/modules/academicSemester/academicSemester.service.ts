import { AcademicSemester, Prisma, PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { RedisClient } from '../../../shared/redis';
import {
  AcademicSemesterSearchAbleFields,
  EVENT_ACADEMIC_SEMESTER_CREATED,
  EVENT_ACADEMIC_SEMESTER_DELETED,
  EVENT_ACADEMIC_SEMESTER_UPDATED,
  academicSemesterTitleCodeMapper
} from './academicSemester.constant';
import { IAcademicSemesterFilterableFields } from './academicSemester.interface';

const prisma = new PrismaClient();

const createAcademicSemester = async (
  payload: AcademicSemester
): Promise<AcademicSemester> => {
  if (academicSemesterTitleCodeMapper[payload.title] !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Semester Code');
  }

  const result = await prisma.academicSemester.create({
    data: payload
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_CREATED,
      JSON.stringify(result)
    );
  }

  return result;
};

const getAllAcademicSemester = async (
  filters: IAcademicSemesterFilterableFields,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicSemester[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: AcademicSemesterSearchAbleFields.map(field => ({
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

  const whereConditions = (Prisma.AcademicSemesterWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {});

  const result = await prisma.academicSemester.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });
  const total = await prisma.academicSemester.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const singleAcademicSemester = async (
  id: string
): Promise<AcademicSemester | null> => {
  const result = await prisma.academicSemester.findUnique({
    where: {
      id
    }
  });
  return result;
};

const updateIntoDB = async (id: string, payload: Partial<AcademicSemester>) => {
  const result = await prisma.academicSemester.update({
    where: {
      id
    },
    data: payload
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_UPDATED,
      JSON.stringify(result)
    );
  }

  return result;
};
const deleteAcademicSemester = async (id: string) => {
  const result = await prisma.academicSemester.delete({
    where: {
      id
    }
  });

  if (result) {
    RedisClient.publish(
      EVENT_ACADEMIC_SEMESTER_DELETED,
      JSON.stringify(result)
    );
  }
  return result;
};

// const createAcademicSemesterEvent = async (e: any) => {
//   const academicSemesterData: Partial<AcademicSemester> = {
//     year: e.year,
//     title: e.title,
//     code: e.code,
//     startMonth: e.startMonth,
//     endMonth: e.endMonth
//   };

//   await createAcademicSemester(academicSemesterData as AcademicSemester);
// };
// const deleteAcademicSemesterEvent = async (e: any) => {
//   await prisma.academicSemester.delete({
//     where: {
//       id: e.id
//     }
//   });
// };

export const AcademicSemesterService = {
  createAcademicSemester,
  getAllAcademicSemester,
  singleAcademicSemester,
  deleteAcademicSemester,
  updateIntoDB
};
