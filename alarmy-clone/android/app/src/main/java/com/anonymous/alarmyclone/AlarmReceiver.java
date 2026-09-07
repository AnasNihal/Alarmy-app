package com.anonymous.alarmyclone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import androidx.core.content.ContextCompat;

/** Receives the exact alarm and immediately hands work to a foreground service. */
public class AlarmReceiver extends BroadcastReceiver {
  private static final String TAG = "AlarmyAlarm";
  public static final String EXTRA_ID = "alarmId";
  public static final String EXTRA_LABEL = "alarmLabel";
  public static final String EXTRA_TEST = "alarmTest";

  @Override public void onReceive(Context context, Intent intent) {
    Log.i(TAG, "native alarm fired id=" + intent.getStringExtra(EXTRA_ID));
    // Schedule tomorrow before starting the long-running ringing service.
    String id = intent.getStringExtra(EXTRA_ID);
    if (id != null && !intent.getBooleanExtra(EXTRA_TEST, false)) AlarmScheduler.scheduleNextDay(context, id, intent.getStringExtra(EXTRA_LABEL));
    Intent serviceIntent = new Intent(context, AlarmRingingService.class)
        .putExtra(EXTRA_ID, id)
        .putExtra(EXTRA_LABEL, intent.getStringExtra(EXTRA_LABEL));
    ContextCompat.startForegroundService(context, serviceIntent);
    Log.i(TAG, "requested ringing service id=" + id);
  }
}
