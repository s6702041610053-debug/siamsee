// Sound + haptics for shaking and the stick drop.
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

let rattle: AudioPlayer | null = null;
let drop: AudioPlayer | null = null;

export function initFeedback() {
  if (rattle) return;
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  rattle = createAudioPlayer(require('../../assets/sounds/rattle.wav'));
  drop = createAudioPlayer(require('../../assets/sounds/drop.wav'));
}

function replay(player: AudioPlayer | null, volume: number) {
  if (!player) return;
  try {
    player.volume = volume;
    player.seekTo(0).then(() => player.play()).catch(() => {});
  } catch {
    // audio is optional; never break the shake loop
  }
}

/** Light tap + soft rattle for every counted shake. `force` is in g. */
export function shakeFeedback(force: number) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  replay(rattle, Math.min(1, 0.3 + force * 0.25));
}

/** Strong hit + wood clack when the stick falls out. */
export function dropFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, 120);
  replay(drop, 1);
}

/** Second clack when the stick lands on the floor. */
export function landFeedback() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
  replay(drop, 0.7);
}
