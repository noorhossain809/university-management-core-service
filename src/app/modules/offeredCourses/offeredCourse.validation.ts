import { z } from 'zod';

const create = z.object({
  body: z.object({
    courseIds: z.array(
      z.string({
        required_error: 'Course ids is required'
      }),
      {
        required_error: 'Course is required'
      }
    ),
    academicDepartmentId: z.string({
      required_error: 'Academic department is required'
    }),
    semesterRegistrationId: z.string({
      required_error: 'Semester registration is required'
    })
  })
});

export const OfferedCourseValidations = {
  create
};
