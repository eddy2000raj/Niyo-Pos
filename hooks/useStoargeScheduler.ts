import moment from 'moment';
import Storage, { StorageKey } from '../utils/Storage';
import useTimer from './useTimer';

const lastUpdateScheduler = () => {
  const lastUpdatedTime = Storage.get(StorageKey.LAST_UPDATED_TIME, {});
  const newUpdatedTime = { ...lastUpdatedTime };
  for (const key in newUpdatedTime) {
    if (newUpdatedTime[key]['timestamp'] !== undefined) {
      const startTime = moment(
        newUpdatedTime[key]['timestamp'][0],
        'Do MMM YY, h:mm a'
      );
      const end = moment();
      const duration = moment.duration(end.diff(startTime));
      const secondDuration = duration.asSeconds();
      if (secondDuration / 3600 >= 1) {
        const hourDuration = Math.floor(secondDuration / 3600);
        newUpdatedTime[key]['timestamp'][1] =
          hourDuration > 1
            ? `${hourDuration} hours ago`
            : `${hourDuration} hour ago`;
      } else if (secondDuration / 60 >= 1) {
        const minDuration = Math.floor(secondDuration / 60);
        newUpdatedTime[key]['timestamp'][1] =
          minDuration > 1
            ? `${minDuration} minutes ago`
            : `${minDuration} minute ago`;
      }
    }
  }
  Storage.set(StorageKey.LAST_UPDATED_TIME, newUpdatedTime);
};

const useStorageScheduler = () => {
  useTimer(async () => await lastUpdateScheduler(), 1000 * 30);
};

export default useStorageScheduler;
