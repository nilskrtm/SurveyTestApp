import {NativeModules, NativeEventEmitter} from 'react-native';

const {DeviceControllerModule} = NativeModules;

export default {
  startLockTask() {
    return DeviceControllerModule.startLockTask();
  },
  stopLockTask() {
    return DeviceControllerModule.stopLockTask();
  },
  async isLockTaskActive() {
    return await DeviceControllerModule.isLockTaskActive();
  },
  async isDeviceOwner() {
    return await DeviceControllerModule.isDeviceOwner();
  },
  clearDeviceOwner() {
    return DeviceControllerModule.clearDeviceOwner();
  },
  getEventEmitter() {
    return new NativeEventEmitter(DeviceControllerModule);
  },
};
