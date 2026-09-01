const { withAndroidManifest } = require('@expo/config-plugins');

// Keeps alarm permissions/components in the generated manifest on future prebuilds.
module.exports = function withAlarmNative(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const permissions = [
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.USE_FULL_SCREEN_INTENT',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.WAKE_LOCK',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    ];
    manifest.manifest['uses-permission'] = manifest.manifest['uses-permission'] || [];
    for (const name of permissions) {
      if (!manifest.manifest['uses-permission'].some((item) => item.$?.['android:name'] === name)) {
        manifest.manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    }
    const application = manifest.manifest.application[0];
    application.receiver = application.receiver || [];
    application.service = application.service || [];
    const addComponent = (list, name, extra = {}) => {
      if (!list.some((item) => item.$?.['android:name'] === name)) {
        list.push({ $: { 'android:name': name, ...extra } });
      }
    };
    addComponent(application.receiver, '.AlarmReceiver', { 'android:exported': 'false' });
    addComponent(application.receiver, '.BootReceiver', {
      'android:enabled': 'true', 'android:exported': 'true', 'android:directBootAware': 'true',
    });
    addComponent(application.service, '.AlarmRingingService', {
      'android:exported': 'false', 'android:foregroundServiceType': 'mediaPlayback',
    });
    return config;
  });
};
