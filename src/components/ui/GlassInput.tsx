import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function GlassInput({ label, error, className = '', ...props }: GlassInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-white/70">{label}</label>
      )}
      <input
        className={`glass-input px-4 py-3 rounded-xl w-full text-sm ${error ? 'border-red-500/60' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
