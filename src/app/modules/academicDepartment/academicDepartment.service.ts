import { AcademicDepartment, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { RedisClient } from '../../../shared/redis';
import {
  EVENT_ACADEMIC_DEPARTMENT_CREATED,
  EVENT_ACADEMIC_DEPARTMENT_DELETED,
  EVENT_ACADEMIC_DEPARTMENT_UPDATED,
  IAcademicDepartmentSearchAbleFields
} from './academicDepartment.constant';
import { IAcademicDepartmentFilterableFields } from './academicDepartment.interface';

const createAcademicDepartment = async (
  academicDepartment: AcademicDepartment
): Promise<AcademicDepartment> => {
  const result = await prisma.academicDepartment.create({
    data: academicDepartment
  });
  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_DEPARTMENT_CREATED,
      JSON.stringify(result)
    );
  }

  return result;
};

const getAllAcademicDepartment = async (
  filters: IAcademicDepartmentFilterableFields,
  options: IPaginationOptions
): Promise<IGenericResponse<AcademicDepartment[]>> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip } = paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: IAcademicDepartmentSearchAbleFields.map(field => ({
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

  const result = await prisma.academicDepartment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
    include: {
      academicFaculty: true
    }
  });
  const total = await prisma.academicDepartment.count();

  return {
    meta: {
      total,
      page,
      limit
    },
    data: result
  };
};

const singleAcademicDepartment = async (
  id: string
): Promise<AcademicDepartment | null> => {
  const result = await prisma.academicDepartment.findUnique({
    where: {
      id
    }
  });

  return result;
};

const updateOneFromDB = async (
  id: string,
  payload: Partial<AcademicDepartment>
): Promise<AcademicDepartment | null> => {
  const result = await prisma.academicDepartment.update({
    where: {
      id
    },
    data: payload
  });

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_DEPARTMENT_UPDATED,
      JSON.stringify(result)
    );
  }

  return result;
};
const deleteOneFromDB = async (
  id: string
): Promise<AcademicDepartment | null> => {
  console.log(id);
  const result = await prisma.academicDepartment.delete({
    where: {
      id
    }
  });

  console.log(result);

  if (result) {
    await RedisClient.publish(
      EVENT_ACADEMIC_DEPARTMENT_DELETED,
      JSON.stringify(result)
    );
  }

  return result;
};

export const AcademicDepartmentService = {
  createAcademicDepartment,
  getAllAcademicDepartment,
  singleAcademicDepartment,
  updateOneFromDB,
  deleteOneFromDB
};
