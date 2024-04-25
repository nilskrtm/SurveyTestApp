import React, { useEffect } from 'react';
import { setIsDeviceOwner } from '../redux/generalSlice';
import DeviceControllerUtil from '../util/DeviceControllerUtil';
import { useAppDispatch } from '../redux/hooks';

function DeviceControllerProvider(): React.JSX.Element {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('[Lifecycle] Mount - DeviceControllerProvider');

    const initializeDeviceOwner = async () => {
      dispatch(setIsDeviceOwner(await DeviceControllerUtil.isDeviceOwner()));
    };

    initializeDeviceOwner().then();

    const deviceAdminEventEmitter = DeviceControllerUtil.getEventEmitter();
    const deviceAdminEnabledEventListener = deviceAdminEventEmitter.addListener(
      'DeviceAdminEnabledEvent',
      () => {
        dispatch(setIsDeviceOwner(true));
      }
    );
    const deviceAdminDisabledEventListener = deviceAdminEventEmitter.addListener(
      'DeviceAdminDisabledEvent',
      () => {
        dispatch(setIsDeviceOwner(false));
      }
    );

    return () => {
      console.log('[Lifecycle] Unmount - DeviceControllerProvider');

      deviceAdminEnabledEventListener.remove();
      deviceAdminDisabledEventListener.remove();
    };
  }, [dispatch]);

  return <></>;
}

export default DeviceControllerProvider;
