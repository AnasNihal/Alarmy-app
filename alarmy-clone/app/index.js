import { useCallback, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import AlarmRow from '../components/AlarmRow';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { deleteAlarm, getAlarms, saveAlarm, setCachedPuzzle } from '../services/storage';
import { cancelNativeAlarm, canUseFullScreenIntent, ensureNativeAlarmPermissions, openAppSettings, openFullScreenIntentSettings, requestNotificationPermission, scheduleNativeAlarm, scheduleTestNativeAlarm } from '../services/nativeAlarm';

export default function HomeScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState([]);

  useFocusEffect(useCallback(() => { getAlarms().then(setAlarms); }, []));

  async function toggleAlarm(alarm) {
    const updated = { ...alarm, enabled: !alarm.enabled };
    try {
      if (updated.enabled) {
        if (!(await requestNotificationPermission())) return showNotificationDenied();
        await ensureNativeAlarmPermissions();
        if (!(await canUseFullScreenIntent())) return showFullScreenIntentUnavailable();
        await scheduleNativeAlarm(updated);
      }
      else await cancelNativeAlarm(updated.id);
      await saveAlarm(updated);
      if (updated.enabled) await setCachedPuzzle(await generatePuzzle(updated.difficulty));
      setAlarms((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) { Alert.alert('Could not update alarm', error.message || 'Please try again.'); }
  }

  function showNotificationDenied() {
    Alert.alert('Notifications are required', 'Alarmy cannot show the full-screen alarm without notification permission. Enable notifications in Settings, then try again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openAppSettings },
    ]);
  }

  function showFullScreenIntentUnavailable() {
    Alert.alert('Full-screen alarm is disabled', 'Enable full-screen notifications for Alarmy in Android settings so the alarm can appear over the lock screen.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: openFullScreenIntentSettings },
    ]);
  }

  async function testAlarm() {
    try {
      if (!(await requestNotificationPermission())) return showNotificationDenied();
      if (!(await canUseFullScreenIntent())) return showFullScreenIntentUnavailable();
      await scheduleTestNativeAlarm();
      Alert.alert('Test alarm scheduled', 'Your alarm should ring and open the puzzle in about 10 seconds. Keep the app in the background to test the full-screen behavior.');
    } catch (error) {
      Alert.alert('Could not schedule test alarm', error.message || 'Please try again.');
    }
  }

  function confirmDelete(alarm) {
    Alert.alert('Delete alarm?', `Remove ${alarm.time} from your alarms?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await cancelNativeAlarm(alarm.id); await deleteAlarm(alarm.id); setAlarms((current) => current.filter((item) => item.id !== alarm.id)); } },
    ]);
  }

  return (
    <LinearGradient colors={['#F4F3FF', '#FFFFFF']} style={styles.safe}>
      <SafeAreaView style={styles.safe}>
      <View style={styles.header}><View><Text style={styles.kicker}>ALARMy</Text><Text style={styles.title}>Good morning</Text><Text style={styles.subtitle}>Ready to wake up?</Text></View><View style={styles.sun}><Text style={styles.sunText}>☀</Text></View></View>
      <View style={styles.content}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Your alarms</Text><Text style={styles.count}>{alarms.length} {alarms.length === 1 ? 'alarm' : 'alarms'}</Text></View>
        {alarms.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyIcon}>◷</Text><Text style={styles.emptyTitle}>No alarms yet</Text><Text style={styles.empty}>Tap + to create your first wake-up challenge.</Text></View> : alarms.map((alarm) => <AlarmRow key={alarm.id} alarm={alarm} onToggle={() => toggleAlarm(alarm)} onLongPress={() => confirmDelete(alarm)} onPress={() => router.push({ pathname: '/set-alarm', params: alarm })} />)}
      </View>
      <Pressable style={styles.testButton} onPress={testAlarm}><Text style={styles.testLabel}>Test alarm (10s)</Text></Pressable>
      <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]} onPress={() => router.push('/set-alarm')}><Text style={styles.plus}>+</Text><Text style={styles.addLabel}>New alarm</Text></Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, kicker: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 8 }, title: { color: colors.text, fontSize: 31, letterSpacing: -0.8, fontWeight: '800' }, subtitle: { color: colors.muted, fontSize: 16, marginTop: 5 }, sun: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFF1C9', alignItems: 'center', justifyContent: 'center' }, sunText: { fontSize: 26 }, content: { paddingHorizontal: 24, flex: 1 }, sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, sectionTitle: { color: colors.text, fontWeight: '800', fontSize: 19 }, count: { color: colors.muted, fontSize: 13 }, emptyCard: { backgroundColor: colors.surface, borderRadius: 22, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: colors.border }, emptyIcon: { color: colors.primary, fontSize: 40, marginBottom: 10 }, emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 7 }, empty: { color: colors.muted, lineHeight: 22, textAlign: 'center' }, testButton: { position: 'absolute', left: 24, bottom: 37, padding: 12 }, testLabel: { color: colors.primary, fontSize: 12, fontWeight: '700' }, addButton: { position: 'absolute', right: 24, bottom: 28, height: 58, paddingHorizontal: 21, borderRadius: 29, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: colors.primaryDark, shadowOpacity: 0.28, shadowRadius: 12, shadowOffset: { width: 0, height: 7 }, elevation: 6 }, addPressed: { transform: [{ scale: 0.96 }] }, plus: { color: '#FFF', fontSize: 28, fontWeight: '300', marginTop: -2 }, addLabel: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});
