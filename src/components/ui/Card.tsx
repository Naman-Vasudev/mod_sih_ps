import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withBrackets?: boolean;
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  withBrackets = false,
  glow = false,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-[var(--line-muted)] bg-[var(--surface-card)] transition-all duration-200 ${
        withBrackets ? 'corner-brackets' : ''
      } ${
        glow ? 'shadow-lg shadow-black/60 hover:border-emerald-600/50' : 'shadow-md shadow-black/40'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
