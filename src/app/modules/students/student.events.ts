import { RedisClient } from '../../../shared/redis';
import { EVENT_STUDENT_CREATED } from './students.constant';
import { StudentsService } from './students.service';

const initStudentEvent = () => {
  RedisClient.subscribe(EVENT_STUDENT_CREATED, async e => {
    const data = JSON.parse(e);
    console.log(data);
    await StudentsService.createStudentFromEvents(data);
  });
};

export default initStudentEvent;
