package com.anonymous.alarmyclone;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.os.PowerManager;
import android.app.NotificationManager;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/** JavaScript bridge used by the Expo Router screens to control native alarms. */
public class AlarmModule extends ReactContextBaseJavaModule {
  public AlarmModule(ReactApplicationContext context) { super(context); }
  @NonNull @Override public String getName() { return "AlarmModule"; }

  @ReactMethod public void schedule(String id, double timestamp, String label, Promise promise) {
    try { AlarmScheduler.schedule(getReactApplicationContext(), id, (long) timestamp, label); promise.resolve(true); }
    catch (Exception e) { promise.reject("ALARM_SCHEDULE_FAILED", e); }
  }

  @ReactMethod public void cancel(String id, Promise promise) {
    try { AlarmScheduler.cancel(getReactApplicationContext(), id); promise.resolve(true); }
    catch (Exception e) { promise.reject("ALARM_CANCEL_FAILED", e); }
  }

  @ReactMethod public void stopRinging(Promise promise) {
    AlarmRingingService.stop(getReactApplicationContext()); promise.resolve(true);
  }

  @ReactMethod public void scheduleTestAlarm(Promise promise) {
    try {
      AlarmScheduler.scheduleOnce(getReactApplicationContext(), "__alarmy_test__", System.currentTimeMillis() + 10000L, "Alarmy test");
      promise.resolve(true);
    } catch (Exception e) { promise.reject("ALARM_TEST_FAILED", e); }
  }

  @ReactMethod public void canUseFullScreenIntent(Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { promise.resolve(true); return; }
    NotificationManager manager = getReactApplicationContext().getSystemService(NotificationManager.class);
    promise.resolve(manager != null && manager.canUseFullScreenIntent());
  }

  @ReactMethod public void openFullScreenIntentSettings(Promise promise) {
    try {
      Intent intent = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT,
          Uri.parse("package:" + getReactApplicationContext().getPackageName()));
      getReactApplicationContext().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); promise.resolve(true);
    } catch (Exception e) { promise.reject("SETTINGS_FAILED", e); }
  }

  @ReactMethod public void canScheduleExactAlarms(Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) { promise.resolve(true); return; }
    android.app.AlarmManager manager = (android.app.AlarmManager) getReactApplicationContext().getSystemService(android.content.Context.ALARM_SERVICE);
    promise.resolve(manager != null && manager.canScheduleExactAlarms());
  }

  @ReactMethod public void isIgnoringBatteryOptimizations(Promise promise) {
    PowerManager manager = (PowerManager) getReactApplicationContext().getSystemService(android.content.Context.POWER_SERVICE);
    promise.resolve(manager != null && manager.isIgnoringBatteryOptimizations(getReactApplicationContext().getPackageName()));
  }

  @ReactMethod public void openExactAlarmSettings(Promise promise) {
    try {
      Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
          Uri.parse("package:" + getReactApplicationContext().getPackageName()));
      getReactApplicationContext().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); promise.resolve(true);
    } catch (Exception e) { promise.reject("SETTINGS_FAILED", e); }
  }

  @ReactMethod public void openBatterySettings(Promise promise) {
    try {
      Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
          Uri.parse("package:" + getReactApplicationContext().getPackageName()));
      getReactApplicationContext().startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); promise.resolve(true);
    } catch (Exception e) { promise.reject("SETTINGS_FAILED", e); }
  }
}
