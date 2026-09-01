import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export default function AlarmRow({ alarm, onToggle, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View>
        <Text style={styles.time}>{alarm.time}</Text>
        <Text style={styles.label}>{alarm.label || 'Alarm'}</Text>
      </View>
      <Switch value={alarm.enabled} onValueChange={onToggle} trackColor={{ false: '#D7D9E2', true: '#A9ABFF' }} thumbColor={alarm.enabled ? colors.primary : '#F4F4F5'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  time: { fontSize: 34, fontWeight: '700', color: colors.text },
  label: { color: colors.muted, marginTop: 3, fontSize: 15 },
});
