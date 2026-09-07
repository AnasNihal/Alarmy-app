package com.anonymous.alarmyclone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/** Independent notification action that silences a broken or unreachable puzzle screen. */
public class AlarmStopReceiver extends BroadcastReceiver {
  private static final String TAG = "AlarmyAlarm";
  public static final String ACTION_EMERGENCY_STOP = "com.anonymous.alarmyclone.EMERGENCY_STOP";

  @Override public void onReceive(Context context, Intent intent) {
    Log.i(TAG, "emergency stop receiver action=" + intent.getAction()
        + " component=" + intent.getComponent() + " extras=" + intent.getExtras());
    if (ACTION_EMERGENCY_STOP.equals(intent.getAction())) {
      AlarmRingingService.stop(context);
    }
  }
}
