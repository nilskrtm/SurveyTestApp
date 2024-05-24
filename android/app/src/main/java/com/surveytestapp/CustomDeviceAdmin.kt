package com.surveytestapp

import android.app.Activity
import android.app.admin.DeviceAdminReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.annotation.NonNull
import com.facebook.react.bridge.Arguments

class CustomDeviceAdmin : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)

        Toast.makeText(context, "Die App wurde zum Geräte-Admin gemacht.", Toast.LENGTH_LONG).show()
        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "DeviceAdminEnabledEvent", Arguments.createMap())
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)

        Toast.makeText(context, "Die App wurde als Geräte-Admin entfernt.", Toast.LENGTH_LONG).show()
        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "DeviceAdminDisabledEvent", Arguments.createMap())
    }

    override fun onLockTaskModeEntering(context: Context, intent: Intent, pkg: String) {
        super.onLockTaskModeEntering(context, intent, pkg)

        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "LockTaskModeEnteringEvent", Arguments.createMap())
    }

    override fun onLockTaskModeExiting(context: Context, intent: Intent) {
        super.onLockTaskModeExiting(context, intent)

        NativeModuleHelper.dispatchEvent(DeviceControllerModule.getStaticReactContext(), "LockTaskModeExitingEvent", Arguments.createMap())
    }

    companion object {
        fun getComponentName(activity: Activity): ComponentName {
            return ComponentName(activity, CustomDeviceAdmin::class.java)
        }
    }
}
