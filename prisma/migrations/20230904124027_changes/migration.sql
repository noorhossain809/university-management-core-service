/*
  Warnings:

  - You are about to drop the `offered_course_class_schedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "offered_course_class_schedule" DROP CONSTRAINT "offered_course_class_schedule_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "offered_course_class_schedule" DROP CONSTRAINT "offered_course_class_schedule_offeredCourseSectionId_fkey";

-- DropForeignKey
ALTER TABLE "offered_course_class_schedule" DROP CONSTRAINT "offered_course_class_schedule_roomId_fkey";

-- DropForeignKey
ALTER TABLE "offered_course_class_schedule" DROP CONSTRAINT "offered_course_class_schedule_semesterRegistrationId_fkey";

-- DropTable
DROP TABLE "offered_course_class_schedule";
