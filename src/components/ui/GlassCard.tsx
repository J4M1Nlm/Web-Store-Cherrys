import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', glow = false, hover = true, ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${glow ? 'shadow-[0_0_30px_rgba(232,41,76,0.15)]' : ''} ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
