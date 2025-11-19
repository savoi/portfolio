import React from 'react';
import { NeuroNoise } from '@paper-design/shaders-react';

type Props = {
  className?: string;
  speed?: number;
  contrast?: number;
  brightness?: number;
  maxPixelCap?: number;     // absolute upper bound
  lerpDuration?: number;    // dark and light transition duration (ms)
};

const LIGHT = { front: '#d9ab9b', mid: '#f3bb77', back: '#898ba4' };
const DARK  = { front: '#d9ab9b', mid: '#f3bb77', back: '#10091c' };

function isDarkTheme() {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  if (el.classList.contains('dark')) return true;
  if (el.dataset.theme) return el.dataset.theme === 'dark';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

// Color helpers (hex <-> linear sRGB) for smoother interpolation
type RGB = { r: number; g: number; b: number };
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linearToSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

function hexToRgb(hex: string): RGB {
  const m = hex.replace('#', '');
  const n = m.length === 3
    ? m.split('').map(x => x + x).join('')
    : m;
  const int = parseInt(n, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex({ r, g, b }: RGB) {
  const to = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mixHexLinear(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  // normalize to 0..1 and convert to linear space
  const Al = { r: srgbToLinear(A.r / 255), g: srgbToLinear(A.g / 255), b: srgbToLinear(A.b / 255) };
  const Bl = { r: srgbToLinear(B.r / 255), g: srgbToLinear(B.g / 255), b: srgbToLinear(B.b / 255) };
  // lerp in linear space
  const Rl = {
    r: Al.r + (Bl.r - Al.r) * t,
    g: Al.g + (Bl.g - Al.g) * t,
    b: Al.b + (Bl.b - Al.b) * t,
  };
  // back to sRGB 0..255
  const Rs = {
    r: Math.round(clamp(linearToSrgb(Rl.r)) * 255),
    g: Math.round(clamp(linearToSrgb(Rl.g)) * 255),
    b: Math.round(clamp(linearToSrgb(Rl.b)) * 255),
  };
  return rgbToHex(Rs);
}

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function NeuroNoiseHero({
  className = 'w-full h-full',
  speed = 0.5,
  contrast = 0.12,
  brightness = 0,
  maxPixelCap = 2_000_000,
  lerpDuration = 2000,
}: Props) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [maxPixels, setMaxPixels] = React.useState(2_000_000);
  const [palette, setPalette] = React.useState(isDarkTheme() ? DARK : LIGHT);

  const paletteRef = React.useRef(palette);
  React.useEffect(() => { paletteRef.current = palette; }, [palette]);
  const prefersReducedMotionRef = React.useRef(prefersReducedMotion);
  React.useEffect(() => { prefersReducedMotionRef.current = prefersReducedMotion; }, [prefersReducedMotion]);
  const animationRef = React.useRef<number | null>(null);

  const animateTo = React.useCallback((target: typeof LIGHT | typeof DARK, duration = lerpDuration) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    // If reduced motion, snap
    if (prefersReducedMotionRef.current || duration <= 0) {
      setPalette(target);
      return;
    }

    const start = performance.now();
    const from = paletteRef.current;

    const step = (now: number) => {
      const raw = (now - start) / duration;
      const t = clamp(easeInOutCubic(raw));
      setPalette({
        front: mixHexLinear(from.front, target.front, t),
        mid:   mixHexLinear(from.mid,   target.mid,   t),
        back:  mixHexLinear(from.back,  target.back,  t),
      });
      if (raw < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        animationRef.current = null;
        setPalette(target);
      }
    };
    animationRef.current = requestAnimationFrame(step);
  }, [lerpDuration]);

  // Watch for changes to the prefers-reduced-motion setting
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handle = (e: MediaQueryListEvent | MediaQueryList) =>
      setPrefersReducedMotion((e as MediaQueryListEvent).matches ?? mq.matches);

    handle(mq);
    if (mq.addEventListener) {
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle);
    } else {
      mq.addListener(handle);
      return () => mq.removeListener(handle);
    }
  }, []);

  // Watch for changes to the color scheme
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => animateTo(isDarkTheme() ? DARK : LIGHT, lerpDuration);

    // Initial sync (no animation on first paint)
    setPalette(isDarkTheme() ? DARK : LIGHT);

    // Observe changes to the documentElement's data-theme or class attributes
    const el = document.documentElement;
    const mo = new MutationObserver(() => update());
    mo.observe(el, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    // Listen for changes to the prefers-color-scheme media query
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMQ = () => update();
    mq.addEventListener?.('change', onMQ);

    // Listen for theme changes in Local Storage
    const onStorage = (e: StorageEvent) => { if (e.key === 'theme') update(); };
    window.addEventListener('storage', onStorage);

    return () => {
      mo.disconnect();
      mq.removeEventListener?.('change', onMQ);
      window.removeEventListener('storage', onStorage);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animateTo, lerpDuration]);

  React.useEffect(() => {
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR to 2
    const physicalArea = w * h * dpr * dpr;

    const divisor = 10; // higher => fewer samples (try 20–28)
    const raw = Math.floor(physicalArea / divisor);

    const mem = (navigator as any).deviceMemory || 4;
    const memScale = mem <= 4 ? 0.6 : mem >= 8 ? 1.0 : 0.8;

    const next = Math.max(80_000, Math.min(Math.floor(raw * memScale), maxPixelCap));

    setMaxPixels(next);
    console.log(
      `NeuroNoiseHero: maxPixels=${next} (viewport ${w}x${h}@${dpr} → area ${physicalArea.toLocaleString()}, mem=${mem}GB)`
    );
  }, [maxPixelCap]);

  return (
    <NeuroNoise
      className={`absolute inset-0 ${className}`}
      colorFront={palette.front}
      colorMid={palette.mid}
      colorBack={palette.back}
      brightness={brightness}
      contrast={contrast}
      speed={prefersReducedMotion ? 0 : speed}
      maxPixelCount={maxPixels}
    />
  );
}