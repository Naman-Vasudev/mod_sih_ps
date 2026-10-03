import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple' | 'zinc';
  size?: 'xs' | 'sm';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'xs',
  className = '',
  icon,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60',
    cyan: 'bg-cyan-950/70 text-cyan-300 border-cyan-700/60',
    amber: 'bg-amber-950/70 text-amber-300 border-amber-700/60',
    red: 'bg-red-950/70 text-red-300 border-red-700/60',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-700/60',
    zinc: 'bg-zinc-900/80 text-zinc-400 border-zinc-700/50',
  }[variant];

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[9px]',
    sm: 'px-2 py-0.5 text-[11px]',
  }[size];

  return (
    <span
      className={`inline-flex items-center space-x-1 rounded font-mono font-bold uppercase tracking-widest border select-none ${variantStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
