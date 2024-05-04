import { RedisClient } from '../../../shared/redis';
import {
  EVENT_FACULTY_CREATED,
  EVENT_FACULTY_UPDATED
} from './faculty.constant';
import { FacultyService } from './faculty.service';

const initFacultyEvents = () => {
  RedisClient.subscribe(EVENT_FACULTY_CREATED, async (e: string) => {
    const data = JSON.parse(e);
    await FacultyService.createFacultyFromEvents(data);
  });

  RedisClient.subscribe(EVENT_FACULTY_UPDATED, async (e: string) => {
    const data = JSON.parse(e);
    await FacultyService.updateFacultyFromEvents(data);
  });
};
export default initFacultyEvents;
