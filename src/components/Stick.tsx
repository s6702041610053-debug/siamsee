import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export const STICK_W = 18;
export const STICK_H = 170;

/** A single fortune stick with a red tip and its number painted near the bottom. */
export default function Stick({ number }: { number: number }) {
  return (
    <View style={styles.stick}>
      <View style={styles.tip} />
      <View style={styles.grain} />
      <Text style={styles.num}>{number}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stick: {
    width: STICK_W,
    height: STICK_H,
    borderRadius: 5,
    backgroundColor: '#E9C893',
    borderWidth: 1,
    borderColor: '#B08850',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    paddingBottom: 8,
  },
  tip: { position: 'absolute', top: 0, left: 0, right: 0, height: 22, backgroundColor: colors.redLight },
  grain: { position: 'absolute', top: 30, bottom: 30, width: 1, backgroundColor: '#C9A46C' },
  num: { fontSize: 11, fontWeight: '800', color: colors.redDark },
});
