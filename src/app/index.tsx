import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Cylinder from '../components/Cylinder';
import { Button, Card, Divider } from '../components/Ornament';
import { CATEGORIES } from '../lib/fortunes';
import { colors, radius } from '../theme';

const STEPS = [
  'Make a wish and choose what you want to ask about',
  'Shake your phone until the power bar is full',
  'Tilt the phone forward (top pointing down) to drop a stick',
  'Read the fortune for your stick number',
];

export default function CategoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Cylinder scale={0.42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Siamsee</Text>
          <Text style={styles.subtitle}>28 Thai fortune sticks{'\n'}Draw one by really shaking your phone</Text>
        </View>
      </View>

      <Divider />
      <Text style={styles.section}>What do you want to ask about?</Text>

      <View style={styles.grid}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/shake', params: { category: c.id } })}
            style={({ pressed }) => [styles.cat, pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 }]}
          >
            <Text style={styles.catEmoji}>{c.emoji}</Text>
            <Text style={styles.catLabel}>{c.label}</Text>
            <Text style={styles.catHint}>{c.hint}</Text>
          </Pressable>
        ))}
      </View>

      <Divider />
      <Card>
        <Text style={styles.howTitle}>How to Play</Text>
        {STEPS.map((s, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s}</Text>
          </View>
        ))}
      </Card>

      <View style={{ height: 16 }} />
      <Button label="📜 History" variant="ghost" onPress={() => router.push('/history')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 40 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 44, fontWeight: '800', color: colors.red, letterSpacing: 1 },
  subtitle: { fontSize: 15, color: colors.inkSoft, lineHeight: 22 },
  section: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 10, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  cat: {
    width: '48.5%',
    backgroundColor: colors.red,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.gold,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: colors.redDark,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  catEmoji: { fontSize: 38 },
  catLabel: { fontSize: 20, fontWeight: '800', color: colors.goldLight, marginTop: 6 },
  catHint: { fontSize: 12, color: colors.creamDark, marginTop: 4, textAlign: 'center' },
  howTitle: { fontSize: 17, fontWeight: '800', color: colors.red, marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { color: colors.redDark, fontWeight: '800' },
  stepText: { flex: 1, color: colors.ink, fontSize: 15 },
});
