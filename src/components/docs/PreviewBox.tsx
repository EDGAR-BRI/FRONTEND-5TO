import React from 'react';

interface PreviewBoxProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export default function PreviewBox({ children, label, className = '' }: PreviewBoxProps) {
  return (
    <div className="not-content my-6">
      {label && (
        <p className="text-xs font-mono text-(--sl-color-gray-3) mb-2 pl-1">{label}</p>
      )}
      <div
        className={`rounded-xl border border-(--sl-color-gray-5) bg-(--sl-color-bg-nav) p-6 flex flex-wrap items-center gap-4 ${className}`}
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--sl-color-gray-6) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {children}
      </div>
    </div>
  );
}
