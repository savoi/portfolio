import React from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = stored || (prefers ? 'dark' : 'light');
    setIsDark(next === 'dark');
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, []);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm
                 bg-[var(--color-mh-surface)] dark:bg-[var(--color-mh-surface-dark)]
                 text-[var(--color-mh-text)] dark:text-[var(--color-mh-text-dark)]
                 transition-colors hover:opacity-90"
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  );
}