import React from 'react';

function getInitialTheme(): boolean | null {
  if (typeof window === 'undefined') return null;
  return document.documentElement.dataset.theme === 'dark';
}

export default function DarkThemeToggle() {
  const [lit, setLit] = React.useState<boolean | null>(null);
  const [animating, setAnimating] = React.useState<'to-dark' | 'to-light' | null>(null);

  // Initialize on mount (client only)
  React.useEffect(() => {
    setLit(getInitialTheme());
  }, []);

  // Sync theme to document
  React.useEffect(() => {
    if (lit === null) return;
    const next = lit ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', lit);
    localStorage.setItem('theme', next);
  }, [lit]);

  const toggle = () => {
    if (animating || lit === null) return;
    
    const direction = lit ? 'to-light' : 'to-dark';
    setAnimating(direction);
    setLit((v) => !v);
    
    setTimeout(() => {
      setAnimating(null);
    }, 3000);
  };

  // Don't render interactive button until we know the actual theme
  if (lit === null) {
    return (
      <div 
        className="theme-toggle" 
        style={{ visibility: 'hidden' }} 
        aria-hidden="true"
      >
        <div className="toggle-track">
          <div className="toggle-thumb">
            <div className="toggle-orb toggle-orb--sun" />
            <div className="toggle-orb toggle-orb--moon" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={lit}
      aria-label={lit ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-toggle group"
      data-lit={lit ? 'true' : 'false'}
      data-animating={animating}
      disabled={!!animating}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <div className="toggle-orb toggle-orb--sun" />
          <div className="toggle-orb toggle-orb--moon" />
        </div>
      </div>
      <span className="sr-only">{lit ? 'Dark mode enabled' : 'Light mode enabled'}</span>
    </button>
  );
}