import React from 'react';
import { soundFx } from '../../utils/audio';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'cyan' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  withAudio?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'sm',
  withAudio = true,
  onClick,
  className = '',
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withAudio && !disabled) {
      soundFx.playClick();
    }
    if (onClick) onClick(e);
  };

  const variantStyles = {
    primary:
      'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600/70 shadow-sm shadow-emerald-950',
    secondary:
      'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-700/60',
    danger:
      'bg-red-950/80 hover:bg-red-900 text-red-300 border-red-700/70 shadow-sm shadow-red-950',
    warning:
      'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-700/70 shadow-sm shadow-amber-950',
    cyan:
      'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-600/70 shadow-sm shadow-cyan-950',
    ghost:
      'bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 border-transparent',
  }[variant];

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs font-bold',
    lg: 'px-5 py-2.5 text-sm font-extrabold',
  }[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`btn-tactical inline-flex items-center justify-center space-x-1.5 rounded-lg border font-mono font-bold tracking-wider transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
