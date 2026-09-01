import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Linking } from 'react-native';

export default function Layout() {
  const router = useRouter();
  useEffect(() => {
    const openAlarmRoute = (url) => {
      if (url?.includes('://puzzle')) router.replace('/puzzle');
    };
    Linking.getInitialURL().then(openAlarmRoute);
    const subscription = Linking.addEventListener('url', ({ url }) => openAlarmRoute(url));
    return () => subscription.remove();
  }, [router]);
  return <Stack screenOptions={{ headerShown: false }} />;
}
