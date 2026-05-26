import { useLocation } from 'react-router-dom';
import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  const { pathname } = useLocation();

  return (
    <div key={pathname} className={`page-enter ${className}`}>
      {children}
    </div>
  );
}
