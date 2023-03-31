package com.surveytestapp;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class DeviceControllerModule extends ReactContextBaseJavaModule {

    private static ReactApplicationContext staticReactContext;

    public DeviceControllerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        staticReactContext = reactContext;

        reactContext.addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {

            }

            @Override
            public void onHostPause() {

            }

            @Override
            public void onHostDestroy() {

            }
        });
    }

    @ReactMethod
    public void startLockTask() {
        DeviceController.startLockTask(getCurrentActivity());
    }

    @ReactMethod
    public void stopLockTask() {
        DeviceController.stopLockTask(getCurrentActivity());
    }

    @ReactMethod
    public void clearDeviceOwner() {
        DeviceController.clearDeviceOwner(getCurrentActivity());
    }

    @ReactMethod
    public void isDeviceOwner(Promise promise) {
        promise.resolve(DeviceController.isDeviceOwner(getCurrentActivity()));
    }

    @ReactMethod
    public void isLockTaskActive(Promise promise) {
        promise.resolve(DeviceController.isLockTaskActive(getCurrentActivity()));
    }

    @ReactMethod
    public void addListener(String eventName) {}

    @ReactMethod
    public void removeListeners(Integer count) {}

    @NonNull
    @Override
    public String getName() {
        return "DeviceControllerModule";
    }

    public static ReactContext getStaticReactContext() {
        return staticReactContext;
    }

}
