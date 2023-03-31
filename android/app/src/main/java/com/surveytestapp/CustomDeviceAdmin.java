package com.surveytestapp;

import android.app.Activity;
import android.app.admin.DeviceAdminReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;

public class CustomDeviceAdmin extends DeviceAdminReceiver {

    public CustomDeviceAdmin() {
        super();
    }

    @Override
    public void onEnabled(@NonNull Context context, @NonNull Intent intent) {
        super.onEnabled(context, intent);

        Toast.makeText(context, "Die App wurde zum Geräte Admin gemacht.", Toast.LENGTH_LONG).show();
        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "DeviceAdminEnabledEvent", Arguments.createMap());
    }

    @Override
    public void onDisabled(@NonNull Context context, @NonNull Intent intent) {
        super.onDisabled(context, intent);

        Toast.makeText(context, "Die App wurde als Geräte Admin entfernt.", Toast.LENGTH_LONG).show();
        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "DeviceAdminDisabledEvent", Arguments.createMap());
    }

    @Override
    public void onLockTaskModeEntering(@NonNull Context context, @NonNull Intent intent, @NonNull String pkg) {
        super.onLockTaskModeEntering(context, intent, pkg);

        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "LockTaskModeEnteringEvent", Arguments.createMap());
    }

    @Override
    public void onLockTaskModeExiting(@NonNull Context context, @NonNull Intent intent) {
        super.onLockTaskModeExiting(context, intent);

        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "LockTaskModeExitingEvent", Arguments.createMap());
    }

    public static ComponentName getComponentName(Activity activity) {
        return new ComponentName(activity, CustomDeviceAdmin.class);
    }

}
