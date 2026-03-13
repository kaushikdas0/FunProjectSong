// src/components/Icon/Icon.tsx
// Thin wrapper around pixelarticons with token-controlled color via fill=currentColor
// Color is controlled entirely via CSS `color` property (Tailwind text-* classes)
// NEVER set fill color directly on the SVG
// Source: https://github.com/halfmage/pixelarticons

import { Plus, Download, Reload, Zap, Heart } from 'pixelarticons/react';

type IconName = 'generate' | 'download' | 'regenerate' | 'brand' | 'decorative';

const iconMap = {
  generate:   Plus,
  download:   Download,
  regenerate: Reload,
  brand:      Zap,
  decorative: Heart,
} as const;

interface IconProps {
  name: IconName;
  /** Render at multiples of 24 (24, 48, 72) for pixel-perfect sharpness */
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  const Component = iconMap[name];
  return <Component width={size} height={size} className={className} />;
}
