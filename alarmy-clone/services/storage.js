import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is React Native's persistent key/value store; it replaces localStorage on mobile.
const ALARMS_KEY = '@alarmy/alarms';
const PUZZLE_KEY = '@alarmy/todays-puzzle';

const readJson = async (key, fallback) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getAlarms = () => readJson(ALARMS_KEY, []);

export async function saveAlarm(alarm) {
  const alarms = await getAlarms();
  const next = alarm.id
    ? alarms.map((item) => (item.id === alarm.id ? alarm : item))
    : [...alarms, { ...alarm, id: String(Date.now()) }];
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(next));
  return next.find((item) => item.id === (alarm.id || next[next.length - 1].id));
}

export async function deleteAlarm(id) {
  const alarms = await getAlarms();
  await AsyncStorage.setItem(ALARMS_KEY, JSON.stringify(alarms.filter((alarm) => alarm.id !== id)));
}

export async function getCachedPuzzle() {
  const puzzle = await readJson(PUZZLE_KEY, null);
  return puzzle?.cachedDate === new Date().toISOString().slice(0, 10) ? puzzle : null;
}

export async function setCachedPuzzle(puzzle) {
  const value = { ...puzzle, cachedDate: new Date().toISOString().slice(0, 10) };
  await AsyncStorage.setItem(PUZZLE_KEY, JSON.stringify(value));
  return value;
}
