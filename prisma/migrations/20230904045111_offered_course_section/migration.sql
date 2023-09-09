/*
  Warnings:

  - You are about to drop the `offered_course_section` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "offered_course_section" DROP CONSTRAINT "offered_course_section_offeredCourseId_fkey";

-- DropForeignKey
ALTER TABLE "offered_course_section" DROP CONSTRAINT "offered_course_section_semesterRegistrationId_fkey";

-- DropTable
DROP TABLE "offered_course_section";

-- CreateTable
CREATE TABLE "OfferedCourseSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentlyEnrolledStudent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "offeredCourseId" TEXT NOT NULL,
    "semesterRegistrationId" TEXT NOT NULL,

    CONSTRAINT "OfferedCourseSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OfferedCourseSection" ADD CONSTRAINT "OfferedCourseSection_offeredCourseId_fkey" FOREIGN KEY ("offeredCourseId") REFERENCES "offerd_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferedCourseSection" ADD CONSTRAINT "OfferedCourseSection_semesterRegistrationId_fkey" FOREIGN KEY ("semesterRegistrationId") REFERENCES "semester_registration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
