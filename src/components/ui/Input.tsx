import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  helperText?: string;
}

export default function Input({ label, error, icon, iconPosition = 'left', helperText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        )}
        <input
          className={`w-full rounded-xl border transition-all duration-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 hover:border-slate-300'} ${icon && iconPosition === 'left' ? 'pl-10' : 'pl-4'} ${icon && iconPosition === 'right' ? 'pr-10' : 'pr-4'} py-2.5 text-sm ${className}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-slate-400 text-xs mt-1">{helperText}</p>}
    </div>
  );
}
