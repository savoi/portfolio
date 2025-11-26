import React from 'react';
//import unlit1x from '../assets/candle-unlit.png';
//import unlit2x from '../assets/candle-unlit@2x.png';
import unlit1x from '../assets/candlev2.png';
import unlit2x from '../assets/candlev2@2x.png';

function isDark() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function CandleThemeToggle() {
  const [lit, setLit] = React.useState(false);

  React.useEffect(() => { setLit(isDark()); }, []);
  React.useEffect(() => {
    const next = lit ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', lit);
    localStorage.setItem('theme', next);
  }, [lit]);

  const toggle = () => setLit(v => !v);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={lit}
      aria-label={lit ? 'Switch to light mode' : 'Switch to dark mode'}
      className="candle-toggle relative inline-flex items-center justify-center mt-1"
      data-lit={lit ? 'true' : 'false'}
    >
      <img
        src={unlit1x.src}
        srcSet={`${unlit1x.src} 1x, ${unlit2x.src} 2x`}
        width={unlit1x.width ?? 36}
        height={unlit1x.height ?? 60}
        alt=""
        className="candle-img select-none pointer-events-none grayscale-40 hover:grayscale-0 drop-shadow-lg/90 dark:grayscale-0 opacity-55"
        draggable="false"
      />
      <svg className="candle-flame-svg" viewBox="0 0 24 28" aria-hidden="true" focusable="false">
        <g className="flame">
          <ellipse cx="12" cy="10" rx="8" ry="10" className="flame-outer" />
          <ellipse cx="12" cy="12" rx="4.2" ry="5.6" className="flame-inner" />
        </g>
      </svg>
      <span className="sr-only">{lit ? 'Dark mode enabled' : 'Light mode enabled'}</span>
    </button>
  );
}