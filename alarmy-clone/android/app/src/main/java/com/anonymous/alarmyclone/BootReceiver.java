package com.anonymous.alarmyclone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Android removes AlarmManager entries at reboot, so restore our native mirror here. */
public class BootReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context context, Intent intent) {
    String action = intent.getAction();
    if (Intent.ACTION_BOOT_COMPLETED.equals(action)
        || Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
        || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
      AlarmScheduler.rescheduleAll(context);
    }
  }
}
