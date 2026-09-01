import { useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { getCachedPuzzle } from '../services/storage';

export default function PuzzleScreen() {
  const router = useRouter();
  const [puzzle, setPuzzle] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    async function loadPuzzle() {
      const cached = await getCachedPuzzle();
      setPuzzle(cached || await generatePuzzle('easy'));
    }
    loadPuzzle();
    // Android's hardware back button is intercepted so the ringing alarm cannot be dismissed.
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  function checkAnswer() {
    if (answer.trim().toLowerCase() === String(puzzle.answer).trim().toLowerCase()) {
      Alert.alert('Solved!', 'Nice work. Alarm dismissed.', [{ text: 'Done', onPress: () => router.replace('/') }]);
    } else Alert.alert('Not quite', 'Try again.');
  }

  if (!puzzle) return <SafeAreaView style={styles.safe}><Text style={styles.loading}>Loading puzzle…</Text></SafeAreaView>;
  return <SafeAreaView style={styles.safe}><View style={styles.content}><Text style={styles.eyebrow}>ALARM RINGING</Text><Text style={styles.title}>Wake up and solve this</Text><View style={styles.card}><Text style={styles.question}>{puzzle.question}</Text><TextInput autoFocus style={styles.input} value={answer} onChangeText={setAnswer} keyboardType="numeric" placeholder="Your answer" placeholderTextColor={colors.muted} /><Pressable style={styles.button} onPress={checkAnswer}><Text style={styles.buttonText}>Check answer</Text></Pressable></View></View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.primary }, content: { flex: 1, padding: 24, justifyContent: 'center' }, eyebrow: { color: '#D8D9FF', letterSpacing: 2, fontSize: 13, fontWeight: '700', marginBottom: 12 }, title: { color: '#FFF', fontSize: 32, lineHeight: 38, fontWeight: '800', marginBottom: 28 }, card: { backgroundColor: colors.surface, padding: 22, borderRadius: 22 }, question: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 22 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 16, fontSize: 18, color: colors.text }, button: { marginTop: 14, backgroundColor: colors.primaryDark, borderRadius: 13, padding: 17, alignItems: 'center' }, buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 }, loading: { color: '#FFF', textAlign: 'center', marginTop: 100 } });
