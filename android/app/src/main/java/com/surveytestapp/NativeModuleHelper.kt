package com.surveytestapp

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

object NativeModuleHelper {

    fun dispatchEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
    }
}
