import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';

/**
 * Tuning knobs. Expo reports acceleration in g (1g = 9.81 m/s²) and uses the
 * iOS axis convention: phone upright in portrait → y ≈ -1, lying flat face-up → z ≈ -1.
 */
export const SHAKE_CONFIG = {
  intervalMs: 20, // 50 Hz sensor rate
  threshold: 0.7, // g — force above this counts as one shake
  debounceMs: 150, // ignore further peaks for 150 ms (avoid double counting)
  gainBase: 3, // % power per shake…
  gainPerG: 4, // …plus this much per g of force
  maxGain: 12, // cap per single shake
  decayDelayMs: 350, // power starts draining this long after the last shake
  decayPerSec: 18, // % per second drained when idle
  readyHoldMs: 2500, // once full, hold power this long so the user has time to tilt
  dropMin: 55, // random drop threshold per round, in %
  dropMax: 95,
  gravityAlpha: 0.08, // low-pass factor for the gravity estimate
  tiltDownDeg: -10, // top edge must point at least 10° below horizontal
  historySize: 120, // samples kept for the debug graph (~2.4 s)
  uiIntervalMs: 80, // React re-render rate for text/graph
};
const cfg = SHAKE_CONFIG;

export type Sample = { x: number; y: number; z: number; force: number; gyro: number };

export type EngineSnapshot = {
  power: number;
  count: number;
  force: number;
  elevation: number; // degrees the top edge points above (+) / below (−) horizontal
  tilted: boolean;
  ready: boolean;
  dropAt: number;
  gyro: number; // rad/s magnitude
  samples: Sample[];
};

type Options = {
  active: boolean;
  withGyro: boolean;
  onShake?: (force: number) => void;
  onDrop?: () => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const randomDropAt = () => Math.round(cfg.dropMin + Math.random() * (cfg.dropMax - cfg.dropMin));

function roundState() {
  return {
    power: 0,
    count: 0,
    lastShake: 0,
    readySince: null as number | null,
    dropAt: randomDropAt(),
    dropped: false,
  };
}

/** Mutable engine state, updated at sensor rate outside React's render cycle. */
function createEngine() {
  return {
    ...roundState(),
    lastTs: 0,
    gx: 0,
    gy: -1,
    gz: 0,
    elevation: 90,
    force: 0,
    gyro: 0,
    samples: [] as Sample[],
    onShake: undefined as Options['onShake'],
    onDrop: undefined as Options['onDrop'],
  };
}
type Engine = ReturnType<typeof createEngine>;

function snapshotOf(e: Engine): EngineSnapshot {
  return {
    power: e.power,
    count: e.count,
    force: e.force,
    elevation: e.elevation,
    tilted: e.elevation <= cfg.tiltDownDeg,
    ready: e.power >= e.dropAt,
    dropAt: e.dropAt,
    gyro: e.gyro,
    samples: e.samples.slice(),
  };
}

/** Register one counted shake of the given force (g). */
function addShake(e: Engine, force: number, now: number) {
  e.lastShake = now;
  e.count += 1;
  e.power = Math.min(100, e.power + Math.min(cfg.maxGain, cfg.gainBase + cfg.gainPerG * force));
  e.onShake?.(force);
}

/** Drop when power reached this round's random threshold and the phone is tipped down. */
function checkDrop(e: Engine, now: number, requireTilt: boolean) {
  const ready = e.power >= e.dropAt;
  if (ready) {
    if (e.readySince === null) e.readySince = now;
  } else {
    e.readySince = null;
  }
  const tilted = e.elevation <= cfg.tiltDownDeg;
  if (ready && (tilted || !requireTilt) && !e.dropped) {
    e.dropped = true;
    e.onDrop?.();
  }
}

export function useShakeEngine({ active, withGyro, onShake, onDrop }: Options) {
  const engine = useRef(createEngine());
  const [anim] = useState(() => ({
    power: new Animated.Value(0),
    dx: new Animated.Value(0), // linear acceleration (gravity removed), g
    dy: new Animated.Value(0),
    elevation: new Animated.Value(90),
  }));
  const [available, setAvailable] = useState<boolean | null>(null);
  const [snap, setSnap] = useState<EngineSnapshot>(() => snapshotOf(createEngine()));

  useEffect(() => {
    engine.current.onShake = onShake;
    engine.current.onDrop = onDrop;
  }, [onShake, onDrop]);

  const step = useCallback(
    (x: number, y: number, z: number, now: number) => {
      const e = engine.current;
      const dt = e.lastTs ? Math.min(0.1, (now - e.lastTs) / 1000) : 0;
      e.lastTs = now;

      // Shake force: deviation of total acceleration from 1g
      const force = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
      e.force = force;

      // Gravity direction via low-pass filter → tilt angle of the phone's top edge
      const a = cfg.gravityAlpha;
      e.gx += a * (x - e.gx);
      e.gy += a * (y - e.gy);
      e.gz += a * (z - e.gz);
      const gm = Math.sqrt(e.gx * e.gx + e.gy * e.gy + e.gz * e.gz) || 1;
      e.elevation = (Math.asin(clamp(-e.gy / gm, -1, 1)) * 180) / Math.PI;

      if (!e.dropped) {
        if (force > cfg.threshold && now - e.lastShake > cfg.debounceMs) {
          addShake(e, force, now);
        } else if (now - e.lastShake > cfg.decayDelayMs) {
          const holding = e.readySince !== null && now - e.readySince < cfg.readyHoldMs;
          if (!holding) e.power = Math.max(0, e.power - cfg.decayPerSec * dt);
        }
        checkDrop(e, now, true);
      }

      // Drive visuals directly (no React re-render at 50 Hz)
      anim.dx.setValue(clamp(x - e.gx, -2.5, 2.5));
      anim.dy.setValue(clamp(y - e.gy, -2.5, 2.5));
      anim.power.setValue(e.power);
      anim.elevation.setValue(e.elevation);

      e.samples.push({ x, y, z, force, gyro: e.gyro });
      if (e.samples.length > cfg.historySize) e.samples.shift();
    },
    [anim]
  );

  useEffect(() => {
    let cancelled = false;
    let probe: { remove: () => void } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = (ok: boolean) => {
      clearTimeout(timer);
      probe?.remove();
      probe = null;
      if (!cancelled) setAvailable(ok);
    };
    Accelerometer.isAvailableAsync()
      .then((ok) => {
        if (!ok || Platform.OS !== 'web') return settle(ok);
        // Browsers on plain http (e.g. opened via LAN IP) expose the API but never
        // deliver events — only trust the sensor once a real sample arrives
        probe = Accelerometer.addListener(() => settle(true));
        timer = setTimeout(() => settle(false), 1000);
      })
      .catch(() => settle(false));
    return () => {
      cancelled = true;
      clearTimeout(timer);
      probe?.remove();
    };
  }, []);

  useEffect(() => {
    if (!active || !available) return;
    Accelerometer.setUpdateInterval(cfg.intervalMs);
    const sub = Accelerometer.addListener(({ x, y, z }) => step(x, y, z, Date.now()));
    return () => sub.remove();
  }, [active, available, step]);

  useEffect(() => {
    if (!active || !withGyro) return;
    let cancelled = false;
    let sub: { remove: () => void } | null = null;
    Gyroscope.isAvailableAsync().then((ok) => {
      if (!ok || cancelled) return;
      try {
        Gyroscope.setUpdateInterval(cfg.intervalMs);
        sub = Gyroscope.addListener(({ x, y, z }) => {
          engine.current.gyro = Math.sqrt(x * x + y * y + z * z);
        });
      } catch {
        // gyro is only informational (debug graph)
      }
    }).catch(() => {});
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [active, withGyro]);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSnap(snapshotOf(engine.current)), cfg.uiIntervalMs);
    return () => clearInterval(id);
  }, [active]);

  const reset = useCallback(() => {
    const e = engine.current;
    Object.assign(e, roundState());
    e.samples = [];
    anim.power.setValue(0);
    setSnap(snapshotOf(e));
  }, [anim]);

  /** Fallback for devices/web without an accelerometer: tap = one strong shake, no tilt needed. */
  const simulateShake = useCallback(() => {
    const e = engine.current;
    if (e.dropped) return;
    const now = Date.now();
    addShake(e, 1.5, now);
    anim.power.setValue(e.power);
    anim.dx.setValue(Math.random() > 0.5 ? 1.5 : -1.5);
    setTimeout(() => anim.dx.setValue(0), 120);
    checkDrop(e, now, false);
    setSnap(snapshotOf(e));
  }, [anim]);

  return { available, snap, anim, reset, simulateShake };
}
