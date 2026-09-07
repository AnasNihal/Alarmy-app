import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { saveAlarm, setCachedPuzzle } from '../services/storage';
import { cancelNativeAlarm, canUseFullScreenIntent, ensureNativeAlarmPermissions, openAppSettings, openFullScreenIntentSettings, requestNotificationPermission, scheduleNativeAlarm } from '../services/nativeAlarm';

function getParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

function dateFromAlarmTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ''));
  const date = new Date();
  if (match) {
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  }
  return date;
}

function formatAlarmTime(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function SetAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [time, setTime] = useState(() => dateFromAlarmTime(getParam(params.time)));
  const [label, setLabel] = useState(getParam(params.label) || 'Morning alarm');
  const [difficulty, setDifficulty] = useState(getParam(params.difficulty) || 'easy');

  async function handleSave() {
    const formattedTime = formatAlarmTime(time);
    try {
      const enabled = getParam(params.enabled) !== 'false';
      const draft = { id: getParam(params.id), time: formattedTime, label, difficulty, enabled };
      // Validate native permissions before saving so a permission failure does not
      // leave a saved but inactive alarm.
      if (enabled) {
        if (!(await requestNotificationPermission())) {
          Alert.alert('Notifications are required', 'Alarmy cannot show the full-screen alarm without notification permission. Enable notifications in Settings, then try again.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ]);
          return;
        }
        await ensureNativeAlarmPermissions();
        if (!(await canUseFullScreenIntent())) {
          Alert.alert('Full-screen alarm is disabled', 'Enable full-screen notifications for Alarmy in Android settings so the alarm can appear over the lock screen.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openFullScreenIntentSettings },
          ]);
          return;
        }
      } else if (getParam(params.id)) await cancelNativeAlarm(getParam(params.id));
      const alarm = await saveAlarm(draft);
      if (enabled) {
        const puzzle = await generatePuzzle(difficulty);
        await setCachedPuzzle(puzzle, alarm.id);
        await scheduleNativeAlarm(alarm);
      }
    } catch (error) {
      return Alert.alert('Alarm permission required', error.message);
    }
    router.replace('/');
  }

  return (
    <LinearGradient colors={['#F4F3FF', '#FFFFFF']} style={styles.safe}><SafeAreaView style={styles.safe}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable><Text style={styles.title}>Set alarm</Text></View>
      <View style={styles.content}>
        <Text style={styles.fieldLabel}>Time</Text>
        <View style={styles.timePicker}><DateTimePicker value={time} mode="time" display="spinner" onChange={(_, selectedTime) => { if (selectedTime) setTime(selectedTime); }} /></View>
        <Text style={styles.fieldLabel}>Label</Text>
        <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Morning alarm" placeholderTextColor={colors.muted} />
        <Text style={styles.fieldLabel}>Puzzle difficulty</Text>
        <View style={styles.choices}>{['easy', 'medium', 'hard'].map((item) => <Pressable key={item} onPress={() => setDifficulty(item)} style={[styles.choice, difficulty === item && styles.choiceSelected]}><Text style={[styles.choiceText, difficulty === item && styles.choiceTextSelected]}>{item}</Text></Pressable>)}</View>
        <Pressable style={styles.save} onPress={handleSave}><Text style={styles.saveText}>Save alarm</Text></Pressable>
      </View>
    </SafeAreaView></LinearGradient>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 22 }, back: { color: colors.primary, fontSize: 17 }, title: { color: colors.text, fontSize: 24, fontWeight: '700' }, content: { padding: 24 }, fieldLabel: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 9 }, timePicker: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', overflow: 'hidden' }, input: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.border }, choices: { flexDirection: 'row', gap: 10 }, choice: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, choiceText: { color: colors.muted, textTransform: 'capitalize', fontWeight: '600' }, choiceTextSelected: { color: '#FFF' }, save: { marginTop: 34, borderRadius: 14, backgroundColor: colors.primary, padding: 17, alignItems: 'center' }, saveText: { color: '#FFF', fontSize: 17, fontWeight: '700' } });
