import React from 'react';

interface ActionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function ActionCard({ children, className = '', onClick }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-4 bg-primary-100 rounded-xl border border-primary-200 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md hover:shadow-primary-500/30 hover:bg-primary-50/30 ${className}`}
    >
      {children}
    </div>
  );
}
