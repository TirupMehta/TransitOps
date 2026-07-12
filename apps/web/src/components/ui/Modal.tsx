import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 glass-backdrop flex items-center justify-center p-4">
      <div className="rounded-3xl w-full max-w-md p-6 relative neumorph-outset border border-theme">
        <div className="flex justify-between items-center mb-4 border-b border-theme pb-3">
          <h3 className="text-base font-extrabold text-primary">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-orange rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
