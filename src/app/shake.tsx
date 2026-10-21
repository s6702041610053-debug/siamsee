import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Cylinder, { CYL_H } from '../components/Cylinder';
import SensorGraph from '../components/SensorGraph';
import Stick, { STICK_H, STICK_W } from '../components/Stick';
import { dropFeedback, initFeedback, landFeedback, shakeFeedback } from '../lib/feedback';
import { getCategory, randomStickNumber } from '../lib/fortunes';
import { addHistory } from '../lib/history';
import { SHAKE_CONFIG, useShakeEngine } from '../lib/useShakeEngine';
import { colors, radius } from '../theme';

const timing = (v: Animated.Value, toValue: number, duration: number, easing = Easing.linear) =>
  Animated.timing(v, { toValue, duration, easing, useNativeDriver: true });

export default function ShakeScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const category = getCategory(params.category);
  const { height: winH } = useWindowDimensions();

  const [debug, setDebug] = useState(false);
  const [stick, setStick] = useState<number | null>(null);

  const stageH = debug ? 290 : Math.max(320, Math.min(450, winH * 0.5));
  const cylScale = debug ? 0.68 : Math.min(1, (stageH - 60) / CYL_H);
  // Falling stick starts at the cylinder's mouth and ends lying on the "floor"
  const stickTop = stageH / 2 - (CYL_H * cylScale) / 2 - 10;
  const floorY = stageH - 24 - (stickTop + STICK_H / 2);

  const [fall] = useState(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    rot: new Animated.Value(0),
    opacity: new Animated.Value(0),
    badge: new Animated.Value(0),
  }));
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initFeedback();
    return () => {
      if (navTimer.current) clearTimeout(navTimer.current);
    };
  }, []);

  const onDrop = useCallback(() => {
    const n = randomStickNumber();
    setStick(n);
    dropFeedback();
    addHistory(n, category.id).catch(() => {});

    fall.opacity.setValue(1);
    Animated.sequence([
      // slides out of the mouth…
      Animated.parallel([
        timing(fall.y, -70, 240, Easing.out(Easing.quad)),
        timing(fall.x, 30, 240),
        timing(fall.rot, 0.15, 240),
      ]),
      // …tumbles down…
      Animated.parallel([
        timing(fall.y, floorY, 620, Easing.in(Easing.quad)),
        timing(fall.x, 95, 620),
        timing(fall.rot, 1.25, 620),
      ]),
    ]).start(() => {
      // …and clacks on the floor
      landFeedback();
      Animated.sequence([
        timing(fall.y, floorY - 22, 120, Easing.out(Easing.quad)),
        timing(fall.y, floorY, 220, Easing.bounce),
      ]).start();
      Animated.spring(fall.badge, { toValue: 1, friction: 5, useNativeDriver: true }).start();
      navTimer.current = setTimeout(() => {
        router.replace({ pathname: '/result', params: { number: String(n), category: category.id } });
      }, 1800);
    });
  }, [category.id, floorY, fall]);

  const engine = useShakeEngine({
    active: stick === null,
    withGyro: debug,
    onShake: shakeFeedback,
    onDrop,
  });
  const { snap, anim, available } = engine;

  let status = 'ตั้งจิตอธิษฐาน แล้วเขย่ามือถือ';
  if (available === false) status = 'ไม่พบเซนเซอร์ — แตะกระบอกเพื่อจำลองการเขย่า';
  else if (stick !== null) status = `ได้ไม้เบอร์ ${stick}`;
  else if (snap.ready) status = 'พลังเต็มแล้ว! เอียงมือถือลงให้ไม้หล่น ⤵';
  else if (snap.power > 1) status = 'เขย่าต่อไป…';

  const barWidth = anim.power.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const rot = fall.rot.interpolate({ inputRange: [0, 1.25], outputRange: ['0deg', '450deg'] });

  return (
    <ScrollView contentContainerStyle={styles.container} scrollEnabled={debug}>
      <View style={styles.topRow}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {category.emoji} {category.label}
          </Text>
        </View>
        <Pressable onPress={() => setDebug((d) => !d)} style={[styles.debugBtn, debug && styles.debugBtnOn]}>
          <Text style={[styles.debugText, debug && { color: colors.redDark }]}>DEBUG {debug ? 'ON' : 'OFF'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.status, snap.ready && stick === null && { color: colors.red }]}>{status}</Text>

      <Pressable
        style={[styles.stage, { height: stageH }]}
        onPress={available === false ? engine.simulateShake : undefined}
      >
        <Cylinder dx={anim.dx} dy={anim.dy} elevation={anim.elevation} scale={cylScale} />

        {stick !== null && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.fallingStick,
              {
                top: stickTop,
                opacity: fall.opacity,
                transform: [{ translateX: fall.x }, { translateY: fall.y }, { rotate: rot }],
              },
            ]}
          >
            <Stick number={stick} />
          </Animated.View>
        )}

        {stick !== null && (
          <Animated.View
            pointerEvents="none"
            style={[styles.badge, { opacity: fall.badge, transform: [{ scale: fall.badge }] }]}
          >
            <Text style={styles.badgeSmall}>ไม้เบอร์</Text>
            <Text style={styles.badgeNum}>{stick}</Text>
          </Animated.View>
        )}
      </Pressable>

      <View style={styles.meterBox}>
        <View style={styles.meterLabels}>
          <Text style={styles.meterLabel}>พลังเขย่า</Text>
          <Text style={styles.meterLabel}>
            {Math.round(snap.power)}% · เขย่าแล้ว {snap.count} ครั้ง
          </Text>
        </View>
        <View style={styles.bar}>
          <Animated.View
            style={[styles.barFill, { width: barWidth, backgroundColor: snap.ready ? colors.redLight : colors.gold }]}
          />
          {debug && <View style={[styles.dropMark, { left: `${snap.dropAt}%` }]} />}
        </View>
        <View style={styles.tiltRow}>
          <Text style={styles.tiltText}>
            มุมเอียง {Math.round(snap.elevation)}° {snap.tilted ? '✅ เอียงลงแล้ว' : '— ต้องเอียงหัวเครื่องลง'}
          </Text>
        </View>
      </View>

      {debug && (
        <View style={styles.debugPanel}>
          <SensorGraph
            title="แรงเขย่า |√(x²+y²+z²) − 1|"
            samples={snap.samples}
            capacity={SHAKE_CONFIG.historySize}
            min={0}
            max={3}
            height={70}
            series={[{ key: 'force', color: colors.goldLight, label: 'force (g)', width: 2 }]}
            marks={[{ value: SHAKE_CONFIG.threshold, color: '#FF6B6B', label: `เกณฑ์ ${SHAKE_CONFIG.threshold}g` }]}
          />
          <SensorGraph
            title="Accelerometer"
            samples={snap.samples}
            capacity={SHAKE_CONFIG.historySize}
            min={-2.5}
            max={2.5}
            height={70}
            series={[
              { key: 'x', color: '#FF7A7A', label: 'x' },
              { key: 'y', color: '#7CFC9A', label: 'y' },
              { key: 'z', color: '#7AB8FF', label: 'z' },
            ]}
          />
          <SensorGraph
            title="Gyroscope"
            samples={snap.samples}
            capacity={SHAKE_CONFIG.historySize}
            min={0}
            max={12}
            height={50}
            series={[{ key: 'gyro', color: '#E59BFF', label: '|ω| rad/s' }]}
          />
          <View style={styles.statsGrid}>
            <Stat label="force" value={`${snap.force.toFixed(2)} g`} />
            <Stat label="power" value={`${snap.power.toFixed(0)}%`} />
            <Stat label="เกณฑ์ไม้หล่น" value={`${snap.dropAt}%`} />
            <Stat label="shakes" value={String(snap.count)} />
            <Stat label="elevation" value={`${snap.elevation.toFixed(0)}°`} />
            <Stat label="ต้องเอียงถึง" value={`≤ ${SHAKE_CONFIG.tiltDownDeg}°`} />
            <Stat label="gyro" value={`${snap.gyro.toFixed(2)}`} />
            <Stat label="ready" value={snap.ready ? 'YES' : 'no'} />
          </View>
          <View style={styles.debugActions}>
            <Pressable style={styles.smallBtn} onPress={engine.simulateShake}>
              <Text style={styles.smallBtnText}>จำลองเขย่า</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={engine.reset}>
              <Text style={styles.smallBtnText}>รีเซ็ตรอบ</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    backgroundColor: colors.red,
    borderColor: colors.gold,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipText: { color: colors.goldLight, fontWeight: '700', fontSize: 15 },
  debugBtn: {
    borderWidth: 1.5,
    borderColor: colors.inkSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  debugBtnOn: { backgroundColor: colors.goldLight, borderColor: colors.goldDark },
  debugText: { fontSize: 11, fontWeight: '800', color: colors.inkSoft, letterSpacing: 1 },
  status: { textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 12, minHeight: 26 },
  stage: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallingStick: { position: 'absolute', left: '50%', marginLeft: -STICK_W / 2 },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    top: 20,
    backgroundColor: colors.red,
    borderColor: colors.gold,
    borderWidth: 4,
    borderRadius: 999,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSmall: { color: colors.goldLight, fontSize: 14, fontWeight: '700' },
  badgeNum: { color: colors.goldLight, fontSize: 50, fontWeight: '900', lineHeight: 56 },
  meterBox: { marginTop: 4 },
  meterLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  meterLabel: { color: colors.inkSoft, fontWeight: '600' },
  bar: {
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.creamDark,
    borderWidth: 2,
    borderColor: colors.goldDark,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 9 },
  dropMark: { position: 'absolute', top: 0, bottom: 0, width: 3, backgroundColor: colors.redDark },
  tiltRow: { marginTop: 8, alignItems: 'center' },
  tiltText: { color: colors.inkSoft, fontSize: 14 },
  debugPanel: {
    marginTop: 14,
    backgroundColor: '#2A120A',
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.goldDark,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  stat: { width: '25%', paddingVertical: 4 },
  statLabel: { color: '#B89A7A', fontSize: 10 },
  statValue: { color: colors.goldLight, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  debugActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  smallBtn: { flex: 1, backgroundColor: colors.red, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  smallBtnText: { color: colors.goldLight, fontWeight: '700' },
});
