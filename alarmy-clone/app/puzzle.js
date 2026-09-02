import { useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';
import { generatePuzzle } from '../services/puzzleGenerator';
import { getCachedPuzzle } from '../services/storage';
import { stopNativeRinging } from '../services/nativeAlarm';

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

  async function checkAnswer() {
    if (answer.trim().toLowerCase() === String(puzzle.answer).trim().toLowerCase()) {
      await stopNativeRinging();
      Alert.alert('Solved!', 'Nice work. Alarm dismissed.', [{ text: 'Done', onPress: () => router.replace('/') }]);
    } else Alert.alert('Not quite', 'Try again.');
  }

  if (!puzzle) return <LinearGradient colors={colors.gradient} style={styles.safe}><SafeAreaView style={styles.safe}><Text style={styles.loading}>Preparing your challenge…</Text></SafeAreaView></LinearGradient>;
  return <LinearGradient colors={colors.gradient} style={styles.safe}><SafeAreaView style={styles.safe}><View style={styles.content}><View style={styles.badge}><Text style={styles.badgeText}>●  ALARM RINGING</Text></View><Text style={styles.title}>Wake up and solve this</Text><Text style={styles.helper}>Your alarm will stop once you get it right.</Text><View style={styles.card}><Text style={styles.question}>{puzzle.question}</Text><TextInput autoFocus style={styles.input} value={answer} onChangeText={setAnswer} keyboardType="numeric" placeholder="Type your answer" placeholderTextColor={colors.muted} returnKeyType="done" onSubmitEditing={checkAnswer} /><Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={checkAnswer}><Text style={styles.buttonText}>Check answer  →</Text></Pressable></View></View></SafeAreaView></LinearGradient>;
}

const styles = StyleSheet.create({ safe: { flex: 1 }, content: { flex: 1, padding: 24, justifyContent: 'center' }, badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, marginBottom: 18 }, badgeText: { color: '#E9E5FF', letterSpacing: 1.2, fontSize: 11, fontWeight: '800' }, title: { color: '#FFF', fontSize: 34, lineHeight: 39, letterSpacing: -0.8, fontWeight: '800', marginBottom: 10 }, helper: { color: '#D9D2FF', fontSize: 15, lineHeight: 22, marginBottom: 28 }, card: { backgroundColor: colors.surface, padding: 23, borderRadius: 24, shadowColor: '#1B0B72', shadowOpacity: 0.25, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 8 }, question: { color: colors.text, fontSize: 25, lineHeight: 32, fontWeight: '800', marginBottom: 22 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, fontSize: 18, color: colors.text, backgroundColor: '#FCFBFF' }, button: { marginTop: 14, backgroundColor: colors.primaryDark, borderRadius: 14, padding: 17, alignItems: 'center' }, buttonPressed: { opacity: 0.84 }, buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }, loading: { color: '#FFF', textAlign: 'center', marginTop: 100 } });
