const getAvailableCourses = (
  studentCompletedCourse: any,
  studentCurrentSemesterTakenCourse: any,
  offeredCourse: any
) => {
  const completeCourseId = studentCompletedCourse.map(
    (course: any) => course.courseId
  );
  const availableCourseList = offeredCourse
    .filter(
      (offerCourse: any) => !completeCourseId.includes(offerCourse.courseId)
    )
    .filter((course: any) => {
      const prerequisites = course.course.Prerequisite;
      if (prerequisites.length === 0) {
        return true;
      } else {
        const preRequisiteIds = prerequisites.map(
          (prerequisite: any) => prerequisite.preRequisiteId
        );
        return preRequisiteIds.every((id: string) =>
          completeCourseId.includes(id)
        );
      }
    })
    .map((course: any) => {
      const isAlreadyTakenCourse = studentCurrentSemesterTakenCourse.find(
        (c: any) => c.offeredCourseId === course.id
      );

      if (isAlreadyTakenCourse) {
        course.offeredCourseSections.map((section: any) => {
          if (section.id === isAlreadyTakenCourse.offeredCourseSectionId) {
            section.isTaken = true;
          } else {
            section.isTaken = false;
          }
        });
        return {
          ...course,
          isTaken: true
        };
      } else {
        course.offeredCourseSections.map((section: any) => {
          section.isTaken = false;
        });
        return {
          ...course,
          isTaken: false
        };
      }
    });

  return availableCourseList;
};

export const SemesterRegistrationUtils = {
  getAvailableCourses
};
