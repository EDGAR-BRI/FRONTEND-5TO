import React, { useState } from 'react';

interface CodePreviewProps {
  code: string;
  children?: React.ReactNode;
  label?: string;
}

export function CodePreview({ code, children, label }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-content my-5 overflow-hidden rounded-xl border border-primary-300">
      {/* — CODE BLOCK — */}
      <div className="relative bg-cool-gray-90">
        <button
          onClick={handleCopy}
          title="Copiar código"
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-md border border-cool-gray-70 bg-cool-gray-80 px-2 py-1 text-[11px] font-mono text-cool-gray-30 transition-colors hover:bg-cool-gray-70 hover:text-white"
        >
          {copied ? (
            <>✓ Copiado</>
          ) : (
            <>⎘ Copiar</>
          )}
        </button>
        <pre
          className="overflow-x-auto px-5 py-5 pr-24 text-sm leading-relaxed font-mono text-cool-gray-20"
          style={{ margin: 0, background: 'transparent' }}
        >
          <code>{code.trim()}</code>
        </pre>
      </div>

      {/* — LIVE PREVIEW — */}
      {children && (
        <div className="border-t border-primary-300">
          {/* Header */}
          <div className="flex items-center gap-2 border-b border-primary-300 bg-primary-200 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-primary-400" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary-700">
              {label ?? 'Vista previa'}
            </span>
          </div>
          {/* Preview area */}
          <div
            className="flex flex-wrap items-center gap-4 p-5 bg-primary-100"
            style={{
              backgroundImage: 'radial-gradient(circle, #BAE0FD 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
