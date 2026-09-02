import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';

export default function AlarmRow({ alarm, onToggle, onPress, onLongPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress} onLongPress={onLongPress}>
      <LinearGradient colors={alarm.enabled ? colors.gradient : ['#D9D5E7', '#C8C3D8']} style={styles.accent} />
      <View style={styles.details}>
        <Text style={styles.time}>{alarm.time}</Text>
        <Text style={styles.label}>{alarm.label || 'Alarm'}</Text>
        <Text style={styles.meta}>{alarm.enabled ? `${alarm.difficulty} puzzle · Every day` : 'Paused'}</Text>
      </View>
      <Switch value={alarm.enabled} onValueChange={onToggle} trackColor={{ false: '#D7D3E5', true: '#B9A7FF' }} thumbColor={alarm.enabled ? colors.primary : '#F4F4F5'} accessibilityLabel={`Toggle ${alarm.label || 'alarm'}`} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.surface, borderRadius: 22, padding: 16, marginBottom: 13, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, overflow: 'hidden', shadowColor: '#332080', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] }, accent: { width: 5, alignSelf: 'stretch', borderRadius: 5, marginRight: 15 }, details: { flex: 1 }, time: { fontSize: 36, letterSpacing: -1, fontWeight: '800', color: colors.text },
  label: { color: colors.text, marginTop: 2, fontSize: 15, fontWeight: '600' }, meta: { color: colors.muted, marginTop: 5, fontSize: 12, textTransform: 'capitalize' },
});
