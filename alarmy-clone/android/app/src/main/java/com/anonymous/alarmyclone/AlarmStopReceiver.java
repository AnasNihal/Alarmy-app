package com.anonymous.alarmyclone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Independent notification action that silences a broken or unreachable puzzle screen. */
public class AlarmStopReceiver extends BroadcastReceiver {
  public static final String ACTION_EMERGENCY_STOP = "com.anonymous.alarmyclone.EMERGENCY_STOP";

  @Override public void onReceive(Context context, Intent intent) {
    if (ACTION_EMERGENCY_STOP.equals(intent.getAction())) {
      AlarmRingingService.stop(context);
    }
  }
}
