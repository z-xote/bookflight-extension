'use client';

import { useState } from 'react';
import { copyToClipboard } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    setCopied(success);
    setTimeout(() => setCopied(false), 900);
  };

  return (
    <pre>
      <code>{code}</code>
      <button
        type="button"
        className="amadeus-chip"
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Amadeus'}
      </button>
    </pre>
  );
}
