import React from 'react';

export interface PanelProps {
  title: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Panel: React.FC<PanelProps> = ({
  title,
  icon,
  rightAction,
  children,
  className = '',
  bodyClassName = 'p-4',
}) => {
  return (
    <div
      className={`rounded-xl border border-[var(--border-accent)] bg-[var(--surface-1)] shadow-xl overflow-hidden font-mono ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)]/80 border-b border-[var(--line-muted)]">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-[var(--color-primary)]">{icon}</span>}
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-200">{title}</span>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </div>
  );
};
