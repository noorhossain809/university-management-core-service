export type IFacultyFilterableFields = {
  searchTerm?: string;
};

export type IFacultyCourseStudentRequest = {
  academicSemesterId?: string | undefined;
  courseId?: string | undefined;
  offeredCourseSectionId?: string | undefined;
};
