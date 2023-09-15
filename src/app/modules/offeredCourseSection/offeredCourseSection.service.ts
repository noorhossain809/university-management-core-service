import { OfferedCourseSection } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';
import { asyncForEch } from '../../../shared/utils';
import { OfferedCourseClassScheduleUtils } from '../offeredCourseClassSchedule/offeredCourseClassSchedule.utils';
import {
  IClassSchedule,
  IOfferedCourseSectionCreate
} from './offeredCourseSection.interface';

const insertIntoDB = async (
  payload: IOfferedCourseSectionCreate
): Promise<OfferedCourseSection | null> => {
  const { classSchedules, ...data } = payload;
  const isExistOfferedCourse = await prisma.offerdCourse.findFirst({
    where: {
      id: data.offeredCourseId
    }
  });

  if (!isExistOfferedCourse) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Offered Course does not exist!'
    );
  }

  await asyncForEch(classSchedules, async (schedule: any) => {
    await OfferedCourseClassScheduleUtils.checkRoomAvailable(schedule);
    await OfferedCourseClassScheduleUtils.checkFacultyAvailable(schedule);
  });

  // data.semesterRegistrationId = isExistOfferedCourse.semesterRegistrationId;

  const offeredCourseSectionData = await prisma.offeredCourseSection.findFirst({
    where: {
      OfferedCourse: {
        id: data.offeredCourseId
      },
      title: data.title
    }
  });

  if (offeredCourseSectionData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Course Section already exists');
  }

  const createSection = await prisma.$transaction(async transactionClient => {
    const createOfferedCourseSection =
      await transactionClient.offeredCourseSection.create({
        data: {
          maxCapacity: data.maxCapacity,
          title: data.title,
          offeredCourseId: data.offeredCourseId,
          semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId
        }
      });

    const scheduleData = classSchedules.map((schedule: IClassSchedule) => ({
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      dayOfWeek: schedule.dayOfWeek,
      offeredCourseSectionId: createOfferedCourseSection.id,
      semesterRegistrationId: isExistOfferedCourse.semesterRegistrationId,
      roomId: schedule.roomId,
      facultyId: schedule.facultyId
    }));

    await transactionClient.offeredCourseClassSchedule.createMany({
      data: scheduleData
    });
    return createOfferedCourseSection;
  });

  const result = await prisma.offeredCourseSection.findFirst({
    where: {
      id: createSection.id
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
          },
          Faculty: true
        }
      }
    }
  });

  return result;
};

const getAllFromDB = async () => {
  const result = await prisma.offeredCourseSection.findMany();

  return result;
};
const getOfferedCourseSectionById = async (id: string) => {
  const result = await prisma.offeredCourseSection.findUnique({
    where: {
      id
    }
  });

  return result;
};

export const OfferedCourseSectionService = {
  insertIntoDB,
  getAllFromDB,
  getOfferedCourseSectionById
};
