import { AcademicFaculty, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { RedisClient } from '../../../shared/redis';
import {
  EVENT_ACADEMIC_FACULTY_CREATED,
  EVENT_ACADEMIC_FACULTY_DELETED,
  EVENT_ACADEMIC_FACULTY_UPDATED,
  IAcademicFacultySearchAbleFields
} from './academicFaculty.constant';
import { IAcademicFacultyFilterableFields } from './academicFaculty.interface';

const createAcademicFaculty = async (
  academicFaculty: AcademicFaculty
): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.create({ data: academicFaculty });
  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_FACULTY_CREATED,
      JSON.stringify(result)
    );
  }
  return result;
};

const getAllAcademicFaculty = async (
  filters: IAcademicFacultyFilterableFields,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicFaculty[]>> => {
  const { searchTerm, ...filtersData } = filters;
  console.log(filters);
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: IAcademicFacultySearchAbleFields.map(field => ({
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

  const result = await prisma.academicFaculty.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });
  const total = await prisma.academicFaculty.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const singleAcademicFaculty = async (
  id: string
): Promise<AcademicFaculty | null> => {
  const result = await prisma.academicFaculty.findUnique({
    where: {
      id
    }
  });

  return result;
};

const updateOneFromDB = async (id: string, payload: Partial<AcademicFaculty>): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.update({
    where: {
      id
    },
    data: payload
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_FACULTY_UPDATED,
      JSON.stringify(result)
    );
  }
  return result;
};
const deleteByIdFromDB = async (id: string): Promise<AcademicFaculty> => {
  const result = await prisma.academicFaculty.delete({
    where: {
      id
    }
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_FACULTY_DELETED,
      JSON.stringify(result)
    );
  }
  return result;
};

export const AcademicFacultyService = {
  createAcademicFaculty,
  getAllAcademicFaculty,
  singleAcademicFaculty,
  deleteByIdFromDB,
  updateOneFromDB
};
