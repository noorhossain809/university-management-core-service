import initFacultyEvents from '../app/modules/faculty/faculty.events';
import initRoomsEvent from '../app/modules/rooms/rooms.events';
import initStudentEvent from '../app/modules/students/student.events';

const subscribeToEvent = () => {
  initStudentEvent();
  initRoomsEvent();
  initFacultyEvents();
};
export default subscribeToEvent;
