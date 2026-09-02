package com.anonymous.alarmyclone;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

/** Small native helper that owns the exact AlarmManager PendingIntents. */
public final class AlarmScheduler {
  private static final String PREFS = "alarmy_native_alarms";
  private static final String PREFIX = "alarm_";

  private AlarmScheduler() {}

  public static void schedule(Context context, String id, long timestamp, String label) {
    schedule(context, id, timestamp, label, true);
  }

  public static void scheduleOnce(Context context, String id, long timestamp, String label) {
    schedule(context, id, timestamp, label, false);
  }

  private static void schedule(Context context, String id, long timestamp, String label, boolean recurring) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    if (alarmManager == null) throw new IllegalStateException("AlarmManager unavailable");

    Intent intent = new Intent(context, AlarmReceiver.class)
        .putExtra(AlarmReceiver.EXTRA_ID, id)
        .putExtra(AlarmReceiver.EXTRA_LABEL, label == null ? "Alarm" : label)
        .putExtra(AlarmReceiver.EXTRA_TEST, !recurring);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
        context, requestCode(id), intent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
      throw new SecurityException("Alarms & reminders permission is not granted");
    }
    // RTC_WAKEUP uses wall-clock time and wakes the CPU. AllowWhileIdle lets it fire in Doze.
    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timestamp, pendingIntent);
    if (recurring) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
          .putString(PREFIX + id, timestamp + "|" + (label == null ? "Alarm" : label))
          .apply();
    }
  }

  public static void cancel(Context context, String id) {
    AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
    Intent intent = new Intent(context, AlarmReceiver.class);
    PendingIntent pendingIntent = PendingIntent.getBroadcast(
        context, requestCode(id), intent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    if (alarmManager != null) alarmManager.cancel(pendingIntent);
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(PREFIX + id).apply();
  }

  public static void rescheduleAll(Context context) {
    android.content.SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    long now = System.currentTimeMillis();
    for (String key : prefs.getAll().keySet()) {
      if (!key.startsWith(PREFIX)) continue;
      String id = key.substring(PREFIX.length());
      String value = prefs.getString(key, null);
      if (value == null) continue;
      String[] parts = value.split("\\|", 2);
      try {
        long timestamp = Long.parseLong(parts[0]);
        if (timestamp > now) schedule(context, id, timestamp, parts.length > 1 ? parts[1] : "Alarm");
      } catch (Exception ignored) {
        // A malformed entry should not prevent other alarms from being restored after boot.
      }
    }
  }

  public static void scheduleNextDay(Context context, String id, String label) {
    String value = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .getString(PREFIX + id, null);
    long timestamp = System.currentTimeMillis() + 24L * 60L * 60L * 1000L;
    if (value != null) {
      try { timestamp = Long.parseLong(value.split("\\|", 2)[0]) + 24L * 60L * 60L * 1000L; }
      catch (Exception ignored) { }
    }
    schedule(context, id, timestamp, label);
  }

  private static int requestCode(String id) {
    return id.hashCode() & 0x7fffffff;
  }
}
