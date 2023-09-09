import { Faculty, Prisma, PrismaClient, courseFaculty } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { FacultySearchAbleFields } from './faculty.constant';
import { IFacultyFilterableFields } from './faculty.interface';

const prisma = new PrismaClient();

const createFaculty = async (facultyData: Faculty): Promise<Faculty> => {
  const result = await prisma.faculty.create({
    data: facultyData
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

export const FacultyService = {
  createFaculty,
  getAllFaculty,
  singleFaculty,
  assignCourses,
  removeCourses
};
