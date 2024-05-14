import { NativeModules, NativeEventEmitter } from 'react-native';

const { DeviceControllerModule } = NativeModules;

export default {
  startLockTask(): void {
    return DeviceControllerModule.startLockTask();
  },
  stopLockTask(): void {
    return DeviceControllerModule.stopLockTask();
  },
  async isLockTaskActive(): Promise<boolean> {
    return await DeviceControllerModule.isLockTaskActive();
  },
  async isDeviceOwner(): Promise<boolean> {
    return await DeviceControllerModule.isDeviceOwner();
  },
  async clearDeviceOwner(): Promise<boolean> {
    return await DeviceControllerModule.clearDeviceOwner();
  },
  getEventEmitter(): NativeEventEmitter {
    return new NativeEventEmitter(DeviceControllerModule);
  }
};
