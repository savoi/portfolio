import React from 'react';
import { 
  ColorPanels,
  GrainGradient,
  Heatmap,
  Warp,
  Water
} from '@paper-design/shaders-react';

type AnyShader = React.ComponentType<any>;

type ShaderWrapperProps = {
  shader: string;
  className?: string;
  height?: number | string;
  width?: number | string;
  speed?: number;
  maxPixelCap?: number;          // rename from maxPixelCount for clarity
  divisor?: number;
  minPixels?: number;
  dprCap?: number;
  props?: Record<string, any>;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  fidelityBoost?: number;        // fine‑grained multiplier (e.g. 1.3)
};

const ShaderMap: Record<string, AnyShader> = {
  colorPanels: ColorPanels,
  grainGradient: GrainGradient,
  heatmap: Heatmap,
  warp: Warp,
  water: Water,
  // add other shaders here as needed
};

export default function ShaderWrapper({
  shader = 'warp',
  className = 'w-full h-full',
  speed = 0.5,
  maxPixelCap = 1_500_000,
  divisor = 16,
  minPixels = 80_000,
  dprCap = 2,
  props = {},
  quality = 'medium',
  fidelityBoost = 1,
}: ShaderWrapperProps) {
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [maxPixels, setMaxPixels] = React.useState(minPixels);

  // Watch for changes in user motion settings if requested
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setReducedMotion('matches' in e ? e.matches : mq.matches);

    onChange(mq);
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
  }, []);

  // Compute pixel budget (viewport, DPR, device memory)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 720;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const area = w * h * dpr * dpr;

    // Quality tiers tweak divisor (lower = higher fidelity)
    const qualityDivisorMap = {
      low: divisor * 1.5,
      medium: divisor,
      high: divisor * 0.4,
      ultra: divisor * 0.2,
    } as const;
    const qDivisor = qualityDivisorMap[quality];

    const raw = Math.floor(area / qDivisor);

    const mem = (navigator as any).deviceMemory || 4;
    const memScale = mem <= 4 ? 0.6 : mem >= 8 ? 1.05 : 0.85;

    // Apply fidelityBoost and clamp
    const boosted = Math.floor(raw * memScale * fidelityBoost);
    const next = Math.max(minPixels, Math.min(boosted, maxPixelCap));

    setMaxPixels(next);
    console.log(
      `ShaderWrapper: quality=${quality} divisor=${qDivisor.toFixed(2)} maxPixels=${next} (area ${area.toLocaleString()}, mem=${mem}GB, boost=${fidelityBoost})`
    );
  }, [divisor, minPixels, maxPixelCap, dprCap, quality, fidelityBoost]);

  // Merge user props with computed controls
  const shaderProps: Record<string, any> = {
    ...props,
    maxPixelCount: maxPixels,
    speed: reducedMotion ? 0 : (props.speed ?? speed),
    className: [props.className, className].filter(Boolean).join(' '),
  };

  const ShaderType = ShaderMap[shader];

  console.log(`ShaderWrapper: rendering shader="${shader}" with maxPixels=${maxPixels}, reducedMotion=${reducedMotion}`);
  console.log('Shader props:', shaderProps);

  return <ShaderType {...shaderProps} />;
}