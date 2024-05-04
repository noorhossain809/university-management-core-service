import {
  IAcademicSemesterCodes,
  IAcademicSemesterMonths,
  IAcademicSemesterTitles
} from './academicSemester.interface';

export const AcademicSemesterSearchAbleFields = [
  'title',
  'code',
  'startMonth',
  'endMonth',
  'year'
];

export const AcademicSemesterFilterAbleFileds = [
  'searchTerm',
  'code',
  'startMonth',
  'endMonth'
];

export const academicSemesterMonths: IAcademicSemesterMonths[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export const academicSemesterTitles: IAcademicSemesterTitles[] = [
  'Autumn',
  'Summer',
  'Fall'
];

export const academicSemesterCodes: IAcademicSemesterCodes[] = [
  '01',
  '02',
  '03'
];

export const academicSemesterTitleCodeMapper: {
  [key: string]: string;
} = {
  Autumn: '01',
  Summer: '02',
  Fall: '03'
};

export const EVENT_ACADEMIC_SEMESTER_CREATED = 'academic-semester.created';
export const EVENT_ACADEMIC_SEMESTER_UPDATED = 'academic-semester.updated';
export const EVENT_ACADEMIC_SEMESTER_DELETED = 'academic-semester.deleted';
