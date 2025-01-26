// Used to validate users dont vote twice
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';

export const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};
