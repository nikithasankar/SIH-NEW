
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
}

export function EmptyState({ icon = '🏃', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-semibold mb-2 text-[var(--color-text-main)]">{title}</h3>
      <p className="text-muted text-sm max-w-xs">{description}</p>
    </div>
  );
}
