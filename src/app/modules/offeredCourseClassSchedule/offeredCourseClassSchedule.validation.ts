import { z } from 'zod';

// Define a Zod schema for WeekDays enum
const WeekDays = z.enum([
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
]);

const create = z.object({
  body: z.object({
    startTime: z.string({
      required_error: 'start time is required'
    }),
    endTime: z.string({
      required_error: 'End time is required'
    }),
    dayOfWeek: WeekDays.default('SATURDAY'),
    offeredCourseSectionId: z.string({
      required_error: 'offered course section is required'
    }),
    semesterRegistrationId: z.string({
      required_error: 'semester Registration is required'
    }),
    roomId: z.string({
      required_error: 'Room is required'
    }),
    facultyId: z.string({
      required_error: 'Faculty is required'
    })
  })
});

export const OfferedCourseClassScheduleValidations = {
  create
};
