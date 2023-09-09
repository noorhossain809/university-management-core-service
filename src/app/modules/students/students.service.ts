import { Prisma, PrismaClient, Student } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
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

export const StudentsService = {
  createStudents,
  getAllStudents,
  singleStudents,
  updateStudent,
  deleteStudent
};
