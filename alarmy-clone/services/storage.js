import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage is React Native's persistent key/value store; it replaces localStorage on mobile.
const ALARMS_KEY = '@alarmy/alarms';
const PUZZLES_KEY = '@alarmy/puzzles';
const LEGACY_PUZZLE_KEY = '@alarmy/todays-puzzle';

const readJson = async (key, fallback) => {
  try {
    const value = await AsyncStorage.getItem(key);
    console.log(`[AlarmyTrace] storage read key=${key} found=${Boolean(value)}`);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`[AlarmyTrace] storage read failed key=${key}`, error?.message || error);
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

function isValidPuzzle(puzzle) {
  return Boolean(puzzle?.question && puzzle?.answer !== undefined);
}

export async function getCachedPuzzle(alarmId) {
  console.log(`[AlarmyTrace] puzzle lookup alarmId=${String(alarmId)}`);
  const today = new Date().toISOString().slice(0, 10);
  const puzzles = await readJson(PUZZLES_KEY, {});
  const stored = alarmId == null ? null : puzzles?.[String(alarmId)];
  if (stored?.cachedDate === today && isValidPuzzle(stored)) {
    console.log(`[AlarmyTrace] puzzle cache hit alarmId=${String(alarmId)}`);
    return stored;
  }
  console.warn(`[AlarmyTrace] puzzle cache miss/invalid alarmId=${String(alarmId)}`);
  if (alarmId == null || alarmId === '') {
    const legacy = await readJson(LEGACY_PUZZLE_KEY, null);
    return legacy?.cachedDate === today && isValidPuzzle(legacy) ? legacy : null;
  }
  return null;
}

export async function setCachedPuzzle(puzzle, alarmId) {
  console.log(`[AlarmyTrace] puzzle cache write alarmId=${String(alarmId)}`);
  const value = { ...puzzle, cachedDate: new Date().toISOString().slice(0, 10) };
  if (alarmId == null || alarmId === '') {
    await AsyncStorage.setItem(LEGACY_PUZZLE_KEY, JSON.stringify(value));
    return value;
  }
  const puzzles = await readJson(PUZZLES_KEY, {});
  await AsyncStorage.setItem(PUZZLES_KEY, JSON.stringify({ ...puzzles, [String(alarmId)]: value }));
  return value;
}
