const groupByAcademicInfo = (data: any) => {
  const groupData = data.reduce((result: any, course: any) => {
    const academicSemester = course.academicSemester;
    const academicSemesterId = academicSemester.id;

    const existingGroup = result.find(
      (group: any) => group.academicSemester.id === academicSemesterId
    );

    if (existingGroup) {
      existingGroup.completedCourses.push({
        id: course.id,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        studentId: course.studentId,
        courseId: course.courseId,
        grade: course.grade,
        point: course.point,
        totalMarks: course.totalMarks,
        course: course.course,
        status: course.status
      });
    } else {
      result.push({
        academicSemester,
        completedCourses: [
          {
            id: course.id,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            studentId: course.studentId,
            courseId: course.courseId,
            grade: course.grade,
            point: course.point,
            totalMarks: course.totalMarks,
            course: course.course,
            status: course.status
          }
        ]
      });
    }
    return result;
  }, []);
  return groupData;
};

export const StudentUtils = {
  groupByAcademicInfo
};
