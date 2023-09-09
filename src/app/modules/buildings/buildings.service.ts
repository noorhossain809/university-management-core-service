import { Building, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { BuildingSearchableFields } from './buildings.constants';
import { IBuildingRequest } from './buildings.interface';

const createBuildings = async (data: Building): Promise<Building> => {
  const result = await prisma.building.create({
    data
  });

  return result;
};

const getAllBuildings = async (
  filters: IBuildingRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Building[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: BuildingSearchableFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    });
  }

  const whereConditions = (Prisma.BuildingWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {});

  const result = await prisma.building.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' }
  });

  const total = await prisma.building.count();

  return {
    meta: {
      page,
      limit,
      total
    },
    data: result
  };
};

export const BuildingService = {
  createBuildings,
  getAllBuildings
};
