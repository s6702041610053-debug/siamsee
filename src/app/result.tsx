import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider } from '../components/Ornament';
import { formatThaiDate } from '../lib/date';
import { getCategory, getFortune, LEVEL_STYLE } from '../lib/fortunes';
import { colors, radius } from '../theme';

export default function ResultScreen() {
  const params = useLocalSearchParams<{ number?: string; category?: string; at?: string }>();
  const fortune = getFortune(Number(params.number));
  const category = getCategory(params.category);

  if (!fortune) {
    return (
      <View style={styles.center}>
        <Text style={styles.meaning}>ไม่พบใบทำนาย</Text>
      </View>
    );
  }

  const level = LEVEL_STYLE[fortune.level];
  const stars = '★'.repeat(level.stars) + '☆'.repeat(5 - level.stars);

  const goHome = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <View style={styles.head}>
          <View style={styles.numCircle}>
            <Text style={styles.numSmall}>ใบที่</Text>
            <Text style={styles.num}>{fortune.number}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelText}>{fortune.level}</Text>
            </View>
            <Text style={[styles.stars, { color: level.color }]}>{stars}</Text>
            <Text style={styles.title}>{fortune.title}</Text>
          </View>
        </View>

        <Divider />
        {fortune.poem.map((line, i) => (
          <Text key={i} style={styles.poem}>
            {line}
          </Text>
        ))}
        <Divider />

        <Text style={styles.meaning}>{fortune.meaning}</Text>
        {params.at ? <Text style={styles.date}>เสี่ยงเมื่อ {formatThaiDate(Number(params.at))}</Text> : null}
      </Card>

      <View style={styles.focus}>
        <Text style={styles.focusTitle}>
          {category.emoji} คำทำนายด้าน{category.label}
        </Text>
        <Text style={styles.focusText}>{fortune.advice[category.id]}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="🎋 เขย่าอีกครั้ง"
          onPress={() => router.replace({ pathname: '/shake', params: { category: category.id } })}
        />
        <Button label="เลือกหมวดใหม่" variant="ghost" onPress={goHome} />
        <Button label="📜 ดูประวัติ" variant="ghost" onPress={() => router.push('/history')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  numCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.red,
    borderWidth: 4,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numSmall: { color: colors.goldLight, fontSize: 13, fontWeight: '700' },
  num: { color: colors.goldLight, fontSize: 40, fontWeight: '900', lineHeight: 46 },
  levelBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  levelText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  stars: { fontSize: 18, marginTop: 4, letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink, marginTop: 2 },
  poem: { textAlign: 'center', fontSize: 17, color: colors.redDark, lineHeight: 30, fontStyle: 'italic' },
  meaning: { fontSize: 16, color: colors.ink, lineHeight: 26 },
  date: { marginTop: 8, color: colors.inkSoft, fontSize: 13 },
  focus: {
    marginTop: 16,
    backgroundColor: colors.red,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 16,
  },
  focusTitle: { color: colors.goldLight, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  focusText: { color: colors.cream, fontSize: 16, lineHeight: 26 },
  actions: { marginTop: 18, gap: 10 },
});
