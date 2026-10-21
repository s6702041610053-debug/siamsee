import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from '../components/Ornament';
import { formatThaiDate } from '../lib/date';
import { CATEGORIES, getCategory, getFortune, LEVEL_STYLE } from '../lib/fortunes';
import { clearHistory, getHistory, type HistoryEntry } from '../lib/history';
import { colors, radius } from '../theme';

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryEntry[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setItems);
    }, [])
  );

  const confirmClear = () =>
    Alert.alert('ล้างประวัติ', 'ต้องการลบประวัติการเสี่ยงทั้งหมดใช่ไหม?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ลบทั้งหมด',
        style: 'destructive',
        onPress: () => clearHistory().then(() => setItems([])),
      },
    ]);

  if (items === null) return null;

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>🎋</Text>
        <Text style={styles.emptyText}>ยังไม่มีประวัติการเสี่ยง</Text>
        <Button label="ไปเสี่ยงเซียมซี" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(e) => e.id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <View>
          <Text style={styles.total}>เสี่ยงไปแล้ว {items.length} ครั้ง</Text>
          <View style={styles.counts}>
            {CATEGORIES.map((c) => (
              <View key={c.id} style={styles.countChip}>
                <Text style={styles.countText}>
                  {c.emoji} {items.filter((e) => e.category === c.id).length}
                </Text>
              </View>
            ))}
          </View>
          <Divider />
        </View>
      }
      renderItem={({ item }) => {
        const f = getFortune(item.number);
        const c = getCategory(item.category);
        const lv = f ? LEVEL_STYLE[f.level] : undefined;
        return (
          <Pressable
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
            onPress={() =>
              router.push({
                pathname: '/result',
                params: { number: String(item.number), category: item.category, at: String(item.at) },
              })
            }
          >
            <View style={styles.num}>
              <Text style={styles.numText}>{item.number}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{f?.title ?? '-'}</Text>
              <Text style={styles.meta}>
                {c.emoji} {c.label} · {formatThaiDate(item.at)}
              </Text>
            </View>
            {f && lv && (
              <View style={[styles.level, { backgroundColor: lv.color }]}>
                <Text style={styles.levelText}>{f.level}</Text>
              </View>
            )}
          </Pressable>
        );
      }}
      ListFooterComponent={
        <View style={{ marginTop: 16 }}>
          <Button label="🗑 ล้างประวัติทั้งหมด" variant="ghost" onPress={confirmClear} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 17, color: colors.inkSoft },
  total: { fontSize: 18, fontWeight: '800', color: colors.red, textAlign: 'center' },
  counts: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  countChip: {
    backgroundColor: colors.white,
    borderColor: colors.gold,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: { color: colors.ink, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.creamDark,
    padding: 12,
    marginBottom: 10,
  },
  num: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: colors.goldLight, fontWeight: '900', fontSize: 20 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  level: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  levelText: { color: colors.white, fontSize: 12, fontWeight: '800' },
});
