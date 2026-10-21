import { useId, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

export const CYL_W = 180;
export const CYL_H = 320;

type Props = {
  /** Linear acceleration in g; drives the shake jitter. Omit for a still cylinder. */
  dx?: Animated.Value;
  dy?: Animated.Value;
  /** Tilt angle of the phone's top edge in degrees; cylinder leans as the phone tips down. */
  elevation?: Animated.Value;
  scale?: number;
};

// Sticks poking out of the top: [x, height]
const STICKS_A: [number, number][] = [[52, 96], [74, 116], [98, 104], [120, 90]];
const STICKS_B: [number, number][] = [[63, 108], [86, 124], [109, 112], [131, 98]];

function Sticks({ list }: { list: [number, number][] }) {
  return (
    <Svg width={CYL_W} height={140} style={StyleSheet.absoluteFill}>
      {list.map(([x, h], i) => (
        <G key={i}>
          <Rect x={x} y={140 - h} width={9} height={h} rx={3} fill="#E9C893" stroke="#B08850" strokeWidth={1} />
          <Rect x={x} y={140 - h} width={9} height={14} rx={3} fill={colors.redLight} />
        </G>
      ))}
    </Svg>
  );
}

export default function Cylinder({ dx, dy, elevation, scale = 1 }: Props) {
  // unique gradient ids per instance (ids are document-global on web)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bodyId = `body${uid}`;
  const goldId = `gold${uid}`;
  const [still] = useState(() => ({ zero: new Animated.Value(0), upright: new Animated.Value(90) }));
  const ax = dx ?? still.zero;
  const ay = dy ?? still.zero;

  // Real shake → body moves and rocks proportionally to measured acceleration
  const translateX = ax.interpolate({ inputRange: [-2.5, 2.5], outputRange: [-26, 26] });
  const translateY = ay.interpolate({ inputRange: [-2.5, 2.5], outputRange: [-14, 14] });
  const rock = ax.interpolate({ inputRange: [-2.5, 2.5], outputRange: ['-9deg', '9deg'] });
  // Sticks rattle in opposite phases
  const stickA = ay.interpolate({ inputRange: [-2.5, 2.5], outputRange: [16, -16] });
  const stickB = ay.interpolate({ inputRange: [-2.5, 2.5], outputRange: [-10, 10] });
  // Phone upright (≈70°) → cylinder upright; phone tipped down (≈−30°) → cylinder leans 55°
  const lean = (elevation ?? still.upright).interpolate({
    inputRange: [-30, 70],
    outputRange: ['55deg', '0deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width: CYL_W * scale, height: CYL_H * scale, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          width: CYL_W,
          height: CYL_H,
          transform: [{ scale }, { rotate: lean }, { translateX }, { translateY }, { rotate: rock }],
        }}
      >
        <Animated.View style={[styles.sticks, { transform: [{ translateY: stickA }] }]}>
          <Sticks list={STICKS_A} />
        </Animated.View>
        <Animated.View style={[styles.sticks, { transform: [{ translateY: stickB }] }]}>
          <Sticks list={STICKS_B} />
        </Animated.View>
        <Svg width={CYL_W} height={CYL_H} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={bodyId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.redDark} />
              <Stop offset="0.35" stopColor={colors.redLight} />
              <Stop offset="0.6" stopColor={colors.red} />
              <Stop offset="1" stopColor={colors.redDark} />
            </LinearGradient>
            <LinearGradient id={goldId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={colors.goldDark} />
              <Stop offset="0.4" stopColor={colors.goldLight} />
              <Stop offset="1" stopColor={colors.goldDark} />
            </LinearGradient>
          </Defs>
          {/* body */}
          <Rect x={30} y={120} width={120} height={190} rx={14} fill={`url(#${bodyId})`} />
          {/* rim */}
          <Rect x={24} y={112} width={132} height={22} rx={8} fill={`url(#${goldId})`} />
          <Rect x={26} y={290} width={128} height={22} rx={8} fill={`url(#${goldId})`} />
          {/* gold bands */}
          <Rect x={30} y={150} width={120} height={4} fill={colors.gold} />
          <Rect x={30} y={272} width={120} height={4} fill={colors.gold} />
          {/* medallion */}
          <Circle cx={90} cy={212} r={40} fill={colors.redDark} stroke={colors.gold} strokeWidth={4} />
          <Circle cx={90} cy={212} r={32} fill="none" stroke={colors.goldLight} strokeWidth={1.5} strokeDasharray="4 3" />
          <SvgText x={90} y={207} fontSize={17} fontWeight="bold" fill={colors.goldLight} textAnchor="middle">
            เซียม
          </SvgText>
          <SvgText x={90} y={228} fontSize={17} fontWeight="bold" fill={colors.goldLight} textAnchor="middle">
            ซี
          </SvgText>
          {/* kanok-style flourishes */}
          <Path d="M40 168 q10 -10 20 0 q10 10 20 0" stroke={colors.goldLight} strokeWidth={2} fill="none" />
          <Path d="M100 168 q10 -10 20 0 q10 10 20 0" stroke={colors.goldLight} strokeWidth={2} fill="none" />
          <Path d="M40 260 q10 10 20 0 q10 -10 20 0" stroke={colors.goldLight} strokeWidth={2} fill="none" />
          <Path d="M100 260 q10 10 20 0 q10 -10 20 0" stroke={colors.goldLight} strokeWidth={2} fill="none" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sticks: { position: 'absolute', left: 0, top: 0, width: CYL_W, height: 140 },
});
