import { RedisClient } from '../../../shared/redis';
import { EVENT_ROOMS_CREATED } from './rooms.constant';

const initRoomsEvent = () => {
  RedisClient.subscribe(EVENT_ROOMS_CREATED, async e => {
    const data = JSON.parse(e);
    console.log(data);
  });
};

export default initRoomsEvent;
