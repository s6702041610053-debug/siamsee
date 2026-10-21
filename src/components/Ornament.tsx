import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

/** Gold line with a diamond in the middle. */
export function Divider({ color = colors.gold }: { color?: string }) {
  return (
    <View style={styles.divider}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <Text style={[styles.diamond, { color }]}>◆ ❖ ◆</Text>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
}

/** Cream paper card with a double gold/red frame. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.outer, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, ghost && styles.btnGhost, pressed && { opacity: 0.75 }]}
    >
      <Text style={[styles.btnText, ghost && { color: colors.red }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 },
  line: { flex: 1, height: 1.5 },
  diamond: { fontSize: 12, letterSpacing: 2 },
  outer: {
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 3,
    backgroundColor: colors.cream,
    shadowColor: colors.redDark,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  inner: {
    borderRadius: radius.md - 3,
    borderWidth: 1,
    borderColor: colors.red,
    padding: 16,
    backgroundColor: colors.white,
  },
  btn: {
    backgroundColor: colors.red,
    borderColor: colors.gold,
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderColor: colors.red },
  btnText: { color: colors.goldLight, fontSize: 17, fontWeight: '700' },
});
