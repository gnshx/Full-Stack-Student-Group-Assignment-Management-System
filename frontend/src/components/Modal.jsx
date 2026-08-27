import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, children, onClose, size = 'md', icon: Icon }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const sizes = { 
    sm: 'max-w-md', 
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className={`relative w-full ${sizes[size]} bg-slate-900 border border-slate-800 rounded-2xl shadow-modal-glow animate-slide-up overflow-hidden z-10 my-auto`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h2 className="text-base font-bold text-white tracking-tight font-display">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center border border-slate-700/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
