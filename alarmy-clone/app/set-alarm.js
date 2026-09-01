import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { saveAlarm, setCachedPuzzle } from '../services/storage';

export default function SetAlarmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [time, setTime] = useState(params.time || '07:00');
  const [label, setLabel] = useState(params.label || 'Morning alarm');
  const [difficulty, setDifficulty] = useState(params.difficulty || 'easy');

  async function handleSave() {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return Alert.alert('Invalid time', 'Use 24-hour format, for example 07:30.');
    const alarm = await saveAlarm({ id: params.id, time, label, difficulty, enabled: params.enabled !== 'false' });
    // Generate ahead of time so the ringing screen does not depend on internet access.
    await setCachedPuzzle(await generatePuzzle(difficulty));
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹ Back</Text></Pressable><Text style={styles.title}>Set alarm</Text></View>
      <View style={styles.content}>
        <Text style={styles.fieldLabel}>Time</Text>
        <TextInput style={styles.timeInput} value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" maxLength={5} />
        <Text style={styles.fieldLabel}>Label</Text>
        <TextInput style={styles.input} value={label} onChangeText={setLabel} placeholder="Morning alarm" placeholderTextColor={colors.muted} />
        <Text style={styles.fieldLabel}>Puzzle difficulty</Text>
        <View style={styles.choices}>{['easy', 'medium', 'hard'].map((item) => <Pressable key={item} onPress={() => setDifficulty(item)} style={[styles.choice, difficulty === item && styles.choiceSelected]}><Text style={[styles.choiceText, difficulty === item && styles.choiceTextSelected]}>{item}</Text></Pressable>)}</View>
        <Pressable style={styles.save} onPress={handleSave}><Text style={styles.saveText}>Save alarm</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { padding: 24, flexDirection: 'row', alignItems: 'center', gap: 22 }, back: { color: colors.primary, fontSize: 17 }, title: { color: colors.text, fontSize: 24, fontWeight: '700' }, content: { padding: 24 }, fieldLabel: { color: colors.text, fontSize: 15, fontWeight: '600', marginTop: 16, marginBottom: 9 }, timeInput: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, fontSize: 42, fontWeight: '700', color: colors.text, borderWidth: 1, borderColor: colors.border }, input: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, color: colors.text, fontSize: 16, borderWidth: 1, borderColor: colors.border }, choices: { flexDirection: 'row', gap: 10 }, choice: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary }, choiceText: { color: colors.muted, textTransform: 'capitalize', fontWeight: '600' }, choiceTextSelected: { color: '#FFF' }, save: { marginTop: 34, borderRadius: 14, backgroundColor: colors.primary, padding: 17, alignItems: 'center' }, saveText: { color: '#FFF', fontSize: 17, fontWeight: '700' } });
