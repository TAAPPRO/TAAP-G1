
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyToClipboardProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  copiedLabel?: string;
}

export const CopyToClipboard: React.FC<CopyToClipboardProps> = ({ 
  text, 
  className = "", 
  children,
  label = "COPY",
  copiedLabel = "COPIED!" 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  if (children) {
      return (
          <div onClick={handleCopy} className="cursor-pointer">
              {children}
          </div>
      )
  }

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
        ${copied 
          ? 'bg-green-600 text-white' 
          : 'bg-gray-900 hover:bg-black text-white shadow-sm hover:shadow-md'
        }
        ${className}
      `}
      title="Copy Text"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {label}
        </>
      )}
    </button>
  );
};
