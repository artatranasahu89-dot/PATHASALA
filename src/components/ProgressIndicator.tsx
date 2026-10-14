/**
 * Reusable Progress Indicators (Linear & Circular)
 */

interface LinearProgressProps {
  percentage: number;
  label?: string;
  sublabel?: string;
  color?: 'teal' | 'emerald' | 'amber' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export function LinearProgress({
  percentage,
  label,
  sublabel,
  color = 'teal',
  size = 'md',
}: LinearProgressProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);

  const colorStyles = {
    teal: 'bg-teal-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-500',
    blue: 'bg-blue-600',
  }[color];

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size];

  return (
    <div className="w-full space-y-1.5">
      {(label || sublabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-zinc-800 dark:text-zinc-200">{label}</span>}
          <div className="flex items-center gap-1.5">
            {sublabel && <span className="text-zinc-500 dark:text-zinc-400">{sublabel}</span>}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              {clamped}%
            </span>
          </div>
        </div>
      )}
      <div
        className={`w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden ${heightStyles}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${colorStyles} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressBadgeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgressBadge({
  percentage,
  size = 44,
  strokeWidth = 4,
}: CircularProgressBadgeProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-200 dark:text-zinc-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-teal-600 transition-all duration-700 ease-out"
          fill="transparent"
        />
      </svg>
      <span className="absolute text-[11px] font-bold font-mono tabular-nums text-zinc-800 dark:text-zinc-200">
        {clamped}%
      </span>
    </div>
  );
}
