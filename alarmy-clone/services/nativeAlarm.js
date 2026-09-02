import { Linking, NativeModules, PermissionsAndroid, Platform } from 'react-native';

const native = Platform.OS === 'android' ? NativeModules.AlarmModule : null;

export async function requestNotificationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (await PermissionsAndroid.check(permission)) return true;
  const result = await PermissionsAndroid.request(permission, {
    title: 'Allow alarm notifications',
    message: 'Alarmy needs notifications to show the full-screen alarm and keep it active until you solve the puzzle.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

export function openAppSettings() {
  return Linking.openSettings();
}

export async function canUseFullScreenIntent() {
  if (!native) return true;
  return native.canUseFullScreenIntent();
}

export function openFullScreenIntentSettings() {
  if (!native) return Promise.resolve();
  return native.openFullScreenIntentSettings();
}

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

export async function scheduleTestNativeAlarm() {
  if (!native) return;
  return native.scheduleTestAlarm();
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
