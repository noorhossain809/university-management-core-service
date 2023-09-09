export type ICourseData = {
  title: string;
  code: string;
  credits: number;
  prerequisiteCourses: IPrerequisiteCourseRequest[];
};

export type IPrerequisiteCourseRequest = {
  courseId: string;
  isDeleted: null;
};

export type ICourseRequest = {
  searchTerm?: string | undefined;
};
