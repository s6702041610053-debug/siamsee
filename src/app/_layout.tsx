import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.red },
          headerTintColor: colors.goldLight,
          headerTitleStyle: { fontWeight: '700' },
          headerTransparent: false,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.cream },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'เขย่าเสี่ยงเซียมซี' }} />
        <Stack.Screen name="shake" options={{ title: 'เขย่าเซียมซี' }} />
        <Stack.Screen name="result" options={{ title: 'ใบทำนาย' }} />
        <Stack.Screen name="history" options={{ title: 'ประวัติการเสี่ยง' }} />
      </Stack>
    </>
  );
}
