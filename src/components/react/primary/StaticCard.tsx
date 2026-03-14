import React from 'react';

interface StaticCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function StaticCard({ children, className = '' }: StaticCardProps) {
  return (
    <div className={`p-4 bg-primary-100 rounded-xl border border-primary-200 transition-all duration-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-300/30 hover:bg-primary-50/30 ${className}`}>
      {children}
    </div>
  );
}
