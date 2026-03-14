// src/components/Card/ComplimentCard.tsx
// Core visual artifact — styled greeting card using only DLS tokens
// Receives name and compliment props; no hardcoded color values
// React 19: ref is a plain prop — no forwardRef wrapper needed

import type { Ref } from 'react';
import { Icon } from '../Icon/Icon';

interface ComplimentCardProps {
  name: string;
  compliment: string;
  ref?: Ref<HTMLDivElement>; // React 19: ref as plain prop for DOM capture
}

export function ComplimentCard({ name, compliment, ref }: ComplimentCardProps) {
  return (
    <div ref={ref} className="w-full max-w-[400px] mx-auto p-[10px]">
    <div
      className="bg-cream-50 rounded-card w-full flex flex-col items-center text-center shadow-[0_8px_30px_rgba(90,74,111,0.12)] border border-cream-400"
      style={{ padding: 'var(--spacing-card-pad-y) var(--spacing-card-pad-x)' }}
    >
      {/* Heart icon — decorative warmth above the name */}
      <Icon name="decorative" size={24} className="text-coral-400 mb-3" />

      {/* Name */}
      <p className="text-heading-xl text-text-primary leading-tight mb-5">{name}</p>

      {/* Divider */}
      <div className="w-3/5 h-px bg-cream-400 mb-5" />

      {/* Compliment body */}
      <p className="text-body-lg text-text-secondary leading-relaxed flex-1">{compliment}</p>

      {/* Footer */}
      <p className="text-label text-text-muted mt-8 opacity-60">EgoBoost 3000</p>
    </div>
    </div>
  );
}
