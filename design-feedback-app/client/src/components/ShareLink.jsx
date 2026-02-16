import { useState } from 'react';

export default function ShareLink({ shareToken }) {
  const [copied, setCopied] = useState(false);

  const url = `${window.location.origin}/review/${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        readOnly
        value={url}
        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none"
      />
      <button
        onClick={handleCopy}
        className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors whitespace-nowrap"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}
