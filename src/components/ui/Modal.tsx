import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidthClass} rounded-xl border border-[var(--border-accent)] bg-[var(--surface-1)] text-zinc-100 shadow-2xl corner-brackets overflow-hidden font-mono`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 bg-[var(--surface-2)]/90 border-b border-[var(--line-muted)]">
          <div className="flex items-center space-x-2.5">
            {icon && <span className="text-[var(--color-primary)]">{icon}</span>}
            <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-100">{title}</h3>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
