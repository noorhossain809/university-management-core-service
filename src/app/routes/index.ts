import express from 'express';
import { AcademicDepartmentRoutes } from '../modules/academicDepartment/academicDepartment.routes';
import { AcademicFacultyRoutes } from '../modules/academicFaculty/academicFaculty.routes';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.router';
import { BuildingRoutes } from '../modules/buildings/buildings.routes';
import { CourseRoutes } from '../modules/courses/course.routes';
import { FacultyRoutes } from '../modules/faculty/faculty.router';
import { OfferedCourseClassScheduleRoutes } from '../modules/offeredCourseClassSchedule/offeredCourseClassSchedule.routes';
import { OfferedCourseSectionRoutes } from '../modules/offeredCourseSection/offeredCourseSection.routes';
import { OfferedCourseRoutes } from '../modules/offeredCourses/offeredCourses.routes';
import { RoomRoutes } from '../modules/rooms/rooms.routes';
import { SemesterRegistrationRoutes } from '../modules/semesterRegistration/semesterRegistration.routes';
import { StudentEnrolledCourseMarkRoutes } from '../modules/studentEnrolledCourseMark/studentEnrolledCourseMark.routes';
import { StudentsRoutes } from '../modules/students/students.router';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/academic-semester',
    route: AcademicSemesterRoutes
  },
  {
    path: '/academic-faculty',
    route: AcademicFacultyRoutes
  },
  {
    path: '/academic-department',
    route: AcademicDepartmentRoutes
  },
  {
    path: '/students',
    route: StudentsRoutes
  },
  {
    path: '/faculties',
    route: FacultyRoutes
  },
  {
    path: '/buildings',
    route: BuildingRoutes
  },
  {
    path: '/rooms',
    route: RoomRoutes
  },
  {
    path: '/course',
    route: CourseRoutes
  },
  {
    path: '/semesters',
    route: SemesterRegistrationRoutes
  },
  {
    path: '/offer-courses',
    route: OfferedCourseRoutes
  },
  {
    path: '/offered-course-section',
    route: OfferedCourseSectionRoutes
  },
  {
    path: '/offered-course-class-schedule',
    route: OfferedCourseClassScheduleRoutes
  },
  {
    path: '/student-enrolled-course-marks',
    route: StudentEnrolledCourseMarkRoutes
  }
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
