package com.surveytestapp

import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DeviceControllerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private lateinit var staticReactContext: ReactApplicationContext

        fun getStaticReactContext(): ReactContext {
            return staticReactContext
        }
    }

    init {
        staticReactContext = reactContext
        reactContext.addLifecycleEventListener(object : LifecycleEventListener {
            override fun onHostResume() {
            }

            override fun onHostPause() {
            }

            override fun onHostDestroy() {
            }
        })
    }

    @ReactMethod
    fun startLockTask() {
        DeviceController.startLockTask(currentActivity)
    }

    @ReactMethod
    fun stopLockTask() {
        DeviceController.stopLockTask(currentActivity)
    }

    @ReactMethod
    fun clearDeviceOwner() {
        DeviceController.clearDeviceOwner(currentActivity)
    }

    @ReactMethod
    fun isDeviceOwner(promise: Promise) {
        promise.resolve(DeviceController.isDeviceOwner(currentActivity))
    }

    @ReactMethod
    fun isLockTaskActive(promise: Promise) {
        promise.resolve(DeviceController.isLockTaskActive(currentActivity))
    }

    @ReactMethod
    fun openDeviceSettings() {
        currentActivity?.startActivityForResult(Intent(Settings.ACTION_SETTINGS), 0);
    }

    @ReactMethod
    fun addListener(eventName: String) {
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
    }

    override fun getName(): String {
        return "DeviceControllerModule"
    }
}
