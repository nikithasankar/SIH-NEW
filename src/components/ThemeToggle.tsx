
interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-14 h-7 rounded-full transition-colors duration-300"
      style={{
        backgroundColor: theme === 'dark' ? 'var(--color-surface)' : '#e2e8f0',
        border: '1px solid var(--glass-border)',
      }}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm transition-transform duration-300"
        style={{
          transform: theme === 'dark' ? 'translateX(1px)' : 'translateX(29px)',
          backgroundColor: 'var(--color-primary)',
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
