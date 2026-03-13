// src/components/Card/ComplimentCard.tsx
// Core visual artifact — styled greeting card using only DLS tokens
// Receives name and compliment props; no hardcoded color values

import { Icon } from '../Icon/Icon';

interface ComplimentCardProps {
  name: string;
  compliment: string;
}

export function ComplimentCard({ name, compliment }: ComplimentCardProps) {
  return (
    <div
      className="bg-cream-50 rounded-card w-full max-w-[380px] mx-auto flex flex-col items-center text-center shadow-[0_8px_30px_rgba(90,74,111,0.12)]"
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
  );
}
