import { NativeModules, Platform } from 'react-native';

const native = Platform.OS === 'android' ? NativeModules.AlarmModule : null;

function nextOccurrence(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  return date.getTime();
}

export async function scheduleNativeAlarm(alarm) {
  if (!native) return;
  return native.schedule(String(alarm.id), nextOccurrence(alarm.time), alarm.label || 'Alarm');
}

export async function cancelNativeAlarm(id) {
  if (!native) return;
  return native.cancel(String(id));
}

export async function stopNativeRinging() {
  if (!native) return;
  return native.stopRinging();
}

export async function ensureNativeAlarmPermissions() {
  if (!native) return;
  const exactAllowed = await native.canScheduleExactAlarms();
  if (!exactAllowed) {
    await native.openExactAlarmSettings();
    throw new Error('Grant Alarms & reminders permission, then save the alarm again.');
  }
  const batteryAllowed = await native.isIgnoringBatteryOptimizations();
  if (!batteryAllowed) await native.openBatterySettings();
}
