export const offeredCourseFilterableFields: string[] = [
  'searchTerm',
  'id',
  'semesterRegistrationId',
  'courseId',
  'academicDepartmentId'
];

export const offeredCourseSearchableFields: string[] = ['course.title'];

export const offeredCourseRelationalFields: string[] = [
  'semesterRegistrationId',
  'courseId',
  'academicDepartmentId'
];
export const offeredCourseRelationalFieldsMapper: { [key: string]: string } = {
  semesterRegistrationId: 'semesterRegistration',
  courseId: 'course',
  academicDepartmentId: 'academicDepartment'
};
