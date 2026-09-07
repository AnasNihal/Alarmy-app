package com.anonymous.alarmyclone;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;

/** Keeps the alarm alive after the app process is backgrounded or killed. */
public class AlarmRingingService extends Service {
  private static final int NOTIFICATION_ID = 731;
  private static final String CHANNEL_ID = "alarm_ringing";
  private static final int EMERGENCY_STOP_REQUEST_CODE = 733;
  private static final long SAFETY_TIMEOUT_MS = 15L * 60L * 1000L;
  private MediaPlayer player;
  private PowerManager.WakeLock wakeLock;
  private final Handler safetyHandler = new Handler(Looper.getMainLooper());
  private final Runnable safetyStop = () -> stop(this);

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    String alarmId = intent == null ? "" : intent.getStringExtra(AlarmReceiver.EXTRA_ID);
    String label = intent == null ? "Alarm" : intent.getStringExtra(AlarmReceiver.EXTRA_LABEL);
    createChannel();
    startForeground(NOTIFICATION_ID, buildNotification(alarmId, label));
    acquireWakeLock();
    startAlarmAudio();
    // A killed alarm must stay stopped. Android must never recreate this service
    // after the user force-stops the app or the OS reclaims its process.
    safetyHandler.removeCallbacks(safetyStop);
    safetyHandler.postDelayed(safetyStop, SAFETY_TIMEOUT_MS);
    return START_NOT_STICKY;
  }

  private Notification buildNotification(String alarmId, String label) {
    Intent openIntent = new Intent(this, MainActivity.class)
        .setData(Uri.parse("alarmyclone://puzzle?alarmId=" + Uri.encode(alarmId)))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP)
        .putExtra("alarmId", alarmId);
    PendingIntent fullScreen = PendingIntent.getActivity(this, 732, openIntent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Intent emergencyIntent = new Intent(this, AlarmStopReceiver.class)
        .setAction(AlarmStopReceiver.ACTION_EMERGENCY_STOP);
    PendingIntent emergencyStop = PendingIntent.getBroadcast(this, EMERGENCY_STOP_REQUEST_CODE,
        emergencyIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification.Builder builder = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
        ? new Notification.Builder(this, CHANNEL_ID)
        : new Notification.Builder(this);
    return builder.setSmallIcon(com.anonymous.alarmyclone.R.mipmap.ic_launcher)
        .setContentTitle(label == null ? "Alarm ringing" : label)
        .setContentText("Solve the puzzle to stop the alarm")
        .setCategory(Notification.CATEGORY_ALARM)
        .setPriority(Notification.PRIORITY_MAX)
        .setOngoing(true)
        .setAutoCancel(false)
        .addAction(new Notification.Action.Builder(null, "Emergency Stop", emergencyStop).build())
        .setFullScreenIntent(fullScreen, true)
        .setContentIntent(fullScreen)
        .build();
  }

  private void createChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
    NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Alarm ringing", NotificationManager.IMPORTANCE_HIGH);
    channel.setDescription("Active alarm that stays visible until the puzzle is solved");
    channel.setSound(null, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
    channel.setBypassDnd(true);
    getSystemService(NotificationManager.class).createNotificationChannel(channel);
  }

  private void startAlarmAudio() {
    if (player != null && player.isPlaying()) return;
    try {
      Uri sound = Settings.System.DEFAULT_ALARM_ALERT_URI;
      player = MediaPlayer.create(this, sound);
      if (player != null) {
        player.setAudioAttributes(new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
        player.setLooping(true);
        player.start();
      }
    } catch (Exception ignored) {
      // The foreground notification still appears if a device has no alarm sound configured.
    }
  }

  private void acquireWakeLock() {
    PowerManager power = (PowerManager) getSystemService(POWER_SERVICE);
    if (power != null && (wakeLock == null || !wakeLock.isHeld())) {
      wakeLock = power.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "alarmy:alarm");
      wakeLock.acquire(10 * 60 * 1000L);
    }
  }

  public static void stop(Context context) {
    context.stopService(new Intent(context, AlarmRingingService.class));
  }

  @Override public void onDestroy() {
    safetyHandler.removeCallbacks(safetyStop);
    if (player != null) {
      try { if (player.isPlaying()) player.stop(); } catch (Exception ignored) { }
      try { player.release(); } catch (Exception ignored) { }
      player = null;
    }
    if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
    NotificationManager manager = getSystemService(NotificationManager.class);
    if (manager != null) manager.cancel(NOTIFICATION_ID);
    super.onDestroy();
  }

  @Override public IBinder onBind(Intent intent) { return null; }
}
