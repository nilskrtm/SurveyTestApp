package com.surveytestapp;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.UserManager;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

public class DeviceController {

    public static void startLockTask(Activity activity) {
        int viewFlags = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LOW_PROFILE);
        int windowFlags = (WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (activity != null) {
            runOnUiThread(() -> {
                Window window = activity.getWindow();

                if (window != null) {
                    View view = window.getDecorView();

                    if (view != null) {
                        view.setSystemUiVisibility(viewFlags);
                    }

                    window.addFlags(windowFlags);
                }
            });

            try {
                DevicePolicyManager devicePolicyManager = getDevicePolicyManager(activity);
                ComponentName adminComponent = CustomDeviceAdmin.getComponentName(activity);

                if (devicePolicyManager != null) {
                    if (devicePolicyManager.isDeviceOwnerApp(activity.getPackageName())) {
                        String[] packages = {activity.getPackageName()};

                        devicePolicyManager.setLockTaskPackages(adminComponent, packages);

                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            devicePolicyManager.setKeyguardDisabled(adminComponent, true);
                        }

                        IntentFilter intentFilter = new IntentFilter(Intent.ACTION_MAIN);

                        intentFilter.addCategory(Intent.CATEGORY_HOME);
                        intentFilter.addCategory(Intent.CATEGORY_DEFAULT);

                        devicePolicyManager.addPersistentPreferredActivity(adminComponent, intentFilter, new ComponentName(activity.getPackageName(), MainActivity.class.getName()));

                        devicePolicyManager.addUserRestriction(adminComponent, UserManager.DISALLOW_ADJUST_VOLUME);
                    }

                    activity.startLockTask();
                }
            } catch (Exception e) {
                Log.d("DeviceController", "Error in startLockTask()");
                e.printStackTrace();
            }
        }
    }

    public static void stopLockTask(Activity activity) {
        int viewFlags = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        int windowFlags = (WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        if (activity != null) {
            runOnUiThread(() -> {
                Window window = activity.getWindow();

                if (window != null) {
                    View view = window.getDecorView();

                    if (view != null) {
                        view.setSystemUiVisibility(viewFlags);
                    }

                    window.clearFlags(windowFlags);
                }
            });

            try {
                DevicePolicyManager devicePolicyManager = getDevicePolicyManager(activity);
                ComponentName adminComponent = CustomDeviceAdmin.getComponentName(activity);

                if (devicePolicyManager != null) {
                    if (devicePolicyManager.isDeviceOwnerApp(activity.getPackageName())) {

                        devicePolicyManager.clearUserRestriction(adminComponent, UserManager.DISALLOW_ADJUST_VOLUME);
                    }

                    activity.stopLockTask();
                }
            } catch (Exception e) {
                Log.d("DeviceController", "Error in stopLockTask()");
                e.printStackTrace();
            }
        }
    }

    public static boolean clearDeviceOwner(Activity activity) {
        try {
            if (activity != null) {
                DevicePolicyManager devicePolicyManager = getDevicePolicyManager(activity);

                if (devicePolicyManager != null) {
                    devicePolicyManager.clearDeviceOwnerApp(activity.getPackageName());
                }
            }

            return true;
        } catch (Exception e) {
            Log.d("DeviceController", "Error in clearDeviceOwner()");
            e.printStackTrace();
        }

        return false;
    }

    public static boolean isDeviceOwner(Activity activity) {
        try {
            if (activity != null) {
                DevicePolicyManager devicePolicyManager = getDevicePolicyManager(activity);

                if (devicePolicyManager != null) {
                    return devicePolicyManager.isDeviceOwnerApp(activity.getPackageName());
                }
            }
        } catch (Exception e) {
            Log.d("DeviceController", "Error in isDeviceOwner()");
            e.printStackTrace();
        }

        return false;
    }

    @SuppressLint("ObsoleteSdkInt")
    public static boolean isLockTaskActive(Activity activity) {
        if (activity != null) {
            ActivityManager activityManager = (ActivityManager) activity.getSystemService(Context.ACTIVITY_SERVICE);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                return activityManager.getLockTaskModeState() != ActivityManager.LOCK_TASK_MODE_NONE;
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                return activityManager.isInLockTaskMode();
            }
        }

        return false;
    }

    private static DevicePolicyManager getDevicePolicyManager(Activity activity) {
        try {
            if (activity != null) {
                return (DevicePolicyManager) activity.getSystemService(Context.DEVICE_POLICY_SERVICE);
            }
        } catch (Exception e) {
            Log.d("DeviceController", "Error in getDevicePolicyManager()");
            e.printStackTrace();
        }

        return null;
    }

}