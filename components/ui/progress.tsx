// Progress Bar Component

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  color = 'blue',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    blue: 'bg-primary-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-500',
    red: 'bg-red-600',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-slate-200 dark:bg-slate-700', heights[size])}>
        <div
          className={cn('rounded-full transition-all duration-300', heights[size], colors[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          {value} / {max} ({Math.round(percentage)}%)
        </p>
      )}
    </div>
  );
}
