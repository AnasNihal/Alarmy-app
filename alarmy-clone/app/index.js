import { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AlarmRow from '../components/AlarmRow';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { getAlarms, saveAlarm, setCachedPuzzle } from '../services/storage';
import { cancelNativeAlarm, ensureNativeAlarmPermissions, scheduleNativeAlarm, stopNativeRinging } from '../services/nativeAlarm';

export default function HomeScreen() {
  const router = useRouter();
  const [alarms, setAlarms] = useState([]);

  useFocusEffect(useCallback(() => { getAlarms().then(setAlarms); }, []));

  async function toggleAlarm(alarm) {
    const updated = { ...alarm, enabled: !alarm.enabled };
    await saveAlarm(updated);
    if (updated.enabled) {
      try { await ensureNativeAlarmPermissions(); await scheduleNativeAlarm(updated); }
      catch (error) { return; }
      await setCachedPuzzle(await generatePuzzle(updated.difficulty));
    } else await cancelNativeAlarm(updated.id);
    setAlarms((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.title}>Good morning,</Text><Text style={styles.subtitle}>Ready to wake up?</Text></View>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your alarms</Text>
        {alarms.length === 0 ? <Text style={styles.empty}>No alarms yet. Add one to get started.</Text> : alarms.map((alarm) => <AlarmRow key={alarm.id} alarm={alarm} onToggle={() => toggleAlarm(alarm)} onPress={() => router.push({ pathname: '/set-alarm', params: alarm })} />)}
      </View>
      <Pressable style={styles.addButton} onPress={() => router.push('/set-alarm')}><Text style={styles.plus}>+</Text></Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 26, paddingBottom: 18 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700' }, subtitle: { color: colors.muted, fontSize: 16, marginTop: 4 },
  content: { padding: 24 }, sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 19, marginBottom: 16 }, empty: { color: colors.muted, lineHeight: 24 },
  addButton: { position: 'absolute', right: 24, bottom: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 5 }, plus: { color: '#FFF', fontSize: 34, fontWeight: '300', marginTop: -3 },
});
