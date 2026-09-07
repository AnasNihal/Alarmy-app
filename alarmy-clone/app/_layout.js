import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import * as Linking from 'expo-linking';

export default function Layout() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [navigatorReady, setNavigatorReady] = useState(false);
  // Expo's linking lifecycle listener receives Android onNewIntent events,
  // including the warm/backgrounded native alarm launch.
  const linkingUrl = Linking.useLinkingURL();

  useEffect(() => {
    if (!rootNavigationState?.key) return undefined;
    const task = InteractionManager.runAfterInteractions(() => setNavigatorReady(true));
    return () => task.cancel();
  }, [rootNavigationState?.key]);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      console.log(`[AlarmyTrace] initial deep link=${url || '<none>'}`);
      if (!url) return;
      if (!navigatorReady) {
        console.log('[AlarmyTrace] initial deep link deferred until root navigator is ready');
        return;
      }
      openAlarmRoute(url, router);
    }).catch((error) => console.warn('[AlarmyTrace] initial deep link lookup failed', error?.message || error));
  }, [router, rootNavigationState?.key, navigatorReady]);

  useEffect(() => {
    if (!linkingUrl) return;
    console.log(`[AlarmyTrace] Expo linking URL changed=${linkingUrl}`);
    if (!navigatorReady) {
      console.log('[AlarmyTrace] runtime deep link deferred until root navigator is ready');
      return;
    }
    openAlarmRoute(linkingUrl, router);
  }, [linkingUrl, router, navigatorReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

function openAlarmRoute(url, router) {
  console.log(`[AlarmyTrace] deep link received url=${url}`);
  if (!url.includes('://puzzle')) return;

  let alarmId;
  try {
    alarmId = new URL(url).searchParams.get('alarmId');
  } catch (error) {
    console.warn('[AlarmyTrace] deep link URL parse failed', error?.message || error);
    return;
  }

  console.log(`[AlarmyTrace] deep link parsed alarmId=${alarmId || '<missing>'}`);
  try {
    router.replace(alarmId ? { pathname: '/puzzle', params: { alarmId } } : '/puzzle');
  } catch (error) {
    console.warn('[AlarmyTrace] deep link navigation failed', error?.message || error);
  }
}
