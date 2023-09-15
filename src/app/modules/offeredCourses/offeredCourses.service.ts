import { OfferdCourse } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { asyncForEch } from '../../../shared/utils';
import { ICourseOffer } from './offeredCourses.interface';

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

const getAllFromDB = async () => {
  const result = await prisma.offerdCourse.findMany();

  return result;
};

export const OfferedCourseService = {
  insertIntoDB,
  getAllFromDB
};
