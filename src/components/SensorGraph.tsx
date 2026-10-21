import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline, Rect } from 'react-native-svg';
import type { Sample } from '../lib/useShakeEngine';
import { colors } from '../theme';

type Series = { key: keyof Sample; color: string; label: string; width?: number };

type Props = {
  samples: Sample[];
  capacity: number;
  min: number;
  max: number;
  series: Series[];
  /** Horizontal reference lines, e.g. the shake threshold. */
  marks?: { value: number; color: string; label: string }[];
  height?: number;
  title: string;
};

/** Lightweight real-time line chart (SVG polylines, newest sample at the right). */
export default function SensorGraph({ samples, capacity, min, max, series, marks = [], height = 96, title }: Props) {
  const [w, setW] = useState(0);
  const yOf = (v: number) => height - ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * height;
  const step = w / Math.max(1, capacity - 1);
  const offset = capacity - samples.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.legendRow}>
        <Text style={styles.title}>{title}</Text>
        {series.map((s) => (
          <Text key={String(s.key)} style={[styles.legend, { color: s.color }]}>
            ● {s.label}
          </Text>
        ))}
      </View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
        {w > 0 && (
          <Svg width={w} height={height}>
            <Rect x={0} y={0} width={w} height={height} fill="#1E0B05" rx={6} />
            {min < 0 && max > 0 && <Line x1={0} x2={w} y1={yOf(0)} y2={yOf(0)} stroke="#5A3A2A" strokeWidth={1} />}
            {marks.map((m) => (
              <Line
                key={m.label}
                x1={0}
                x2={w}
                y1={yOf(m.value)}
                y2={yOf(m.value)}
                stroke={m.color}
                strokeWidth={1}
                strokeDasharray="5 4"
              />
            ))}
            {series.map((s) => (
              <Polyline
                key={String(s.key)}
                points={samples.map((p, i) => `${(offset + i) * step},${yOf(p[s.key])}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={s.width ?? 1.5}
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        )}
        {marks.map((m) => (
          <Text key={m.label} style={[styles.mark, { top: yOf(m.value) - 14, color: m.color }]}>
            {m.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  title: { color: colors.goldLight, fontWeight: '700', fontSize: 12 },
  legend: { fontSize: 11, fontWeight: '600' },
  mark: { position: 'absolute', right: 6, fontSize: 10, fontWeight: '700' },
});
