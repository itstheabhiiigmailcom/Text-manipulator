import React, { useId } from 'react';

// Textsmith mark: a smith's hammer shaped like a "T", striking sparks off the text.
export default function Logo({ size = 32, title = 'Textsmith' }) {
  const gradientId = `ts-logo-${useId().replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="tu-logo"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
      {/* hammer head = the bar of the T */}
      <rect x="11" y="15" width="31" height="11" rx="3" fill="#fff" />
      {/* striking face */}
      <rect x="40" y="12" width="9" height="17" rx="2.5" fill="#fff" />
      {/* handle = the stem of the T */}
      <rect x="21" y="26" width="9" height="27" rx="3.5" fill="#fff" />
      {/* sparks */}
      <g stroke="#fcd34d" strokeWidth="3" strokeLinecap="round">
        <line x1="53.5" y1="15" x2="57.5" y2="10.5" />
        <line x1="54.5" y1="20.5" x2="60" y2="20.5" />
        <line x1="53.5" y1="26" x2="57.5" y2="30.5" />
      </g>
      {/* text cursor beside the stem */}
      <rect x="37" y="38" width="3.5" height="15" rx="1.75" fill="#fff" opacity="0.6" />
    </svg>
  );
}
