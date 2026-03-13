// src/screens/KitchenSinkScreen.tsx
// Dev-only validation screen — not imported in production
// Shows every DLS token, type scale step, button variant, and icon together

import { Icon } from '../components/Icon/Icon';
import { ComplimentCard } from '../components/Card/ComplimentCard';

interface SwatchProps {
  bgClass: string;
  label: string;
  hex: string;
  border?: boolean;
}

function Swatch({ bgClass, label, hex, border = false }: SwatchProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-16 h-16 rounded-swatch ${bgClass} ${border ? 'border border-blue-200' : ''}`}
      />
      <span className="text-label text-text-secondary text-center leading-tight">{label}</span>
      <span className="text-label text-text-muted text-center leading-tight">{hex}</span>
    </div>
  );
}

export default function KitchenSinkScreen() {
  return (
    <div className="min-h-screen bg-cream-300 p-10">
      <h1 className="text-display text-text-primary mb-2">EgoBoost 3000 — Kitchen Sink</h1>
      <p className="text-body text-text-muted mb-12">
        Design Language System — visual validation screen (dev only)
      </p>

      {/* ── COLOR SWATCHES ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Color Swatches</h2>

        <div className="mb-6">
          <h3 className="text-body-sm text-text-muted mb-3">Blue (periwinkle)</h3>
          <div className="flex gap-4 flex-wrap">
            <Swatch bgClass="bg-blue-50"  label="blue-50"  hex="#F3F6FB" />
            <Swatch bgClass="bg-blue-100" label="blue-100" hex="#E6EDF6" />
            <Swatch bgClass="bg-blue-200" label="blue-200" hex="#CCDAED" />
            <Swatch bgClass="bg-blue-300" label="blue-300" hex="#B3C8E4" />
            <Swatch bgClass="bg-blue-400" label="blue-400" hex="#9EB1CF" />
            <Swatch bgClass="bg-blue-500" label="blue-500" hex="#7A97BE" />
            <Swatch bgClass="bg-blue-600" label="blue-600" hex="#5B7CAC" />
            <Swatch bgClass="bg-blue-700" label="blue-700" hex="#3D5A8A" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-body-sm text-text-muted mb-3">Cream (blush)</h3>
          <div className="flex gap-4 flex-wrap">
            <Swatch bgClass="bg-cream-50"  label="cream-50"  hex="#FFFCFA" border />
            <Swatch bgClass="bg-cream-100" label="cream-100" hex="#FFF8F5" border />
            <Swatch bgClass="bg-cream-200" label="cream-200" hex="#FFF4EF" border />
            <Swatch bgClass="bg-cream-300" label="cream-300" hex="#FFF0EC" border />
            <Swatch bgClass="bg-cream-400" label="cream-400" hex="#F8E8E2" />
            <Swatch bgClass="bg-cream-500" label="cream-500" hex="#F0DDD6" />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-body-sm text-text-muted mb-3">Coral (accent / CTA)</h3>
          <div className="flex gap-4 flex-wrap">
            <Swatch bgClass="bg-coral-300" label="coral-300" hex="#F5C4BA" />
            <Swatch bgClass="bg-coral-400" label="coral-400" hex="#EEB4A8" />
            <Swatch bgClass="bg-coral-500" label="coral-500" hex="#E8A598" />
            <Swatch bgClass="bg-coral-600" label="coral-600" hex="#D98A7A" />
            <Swatch bgClass="bg-coral-700" label="coral-700" hex="#C06E5E" />
          </div>
        </div>

        <div>
          <h3 className="text-body-sm text-text-muted mb-3">Text colors</h3>
          <div className="flex gap-4 flex-wrap">
            <Swatch bgClass="bg-text-primary"   label="text-primary"   hex="#5A4A6F" />
            <Swatch bgClass="bg-text-secondary" label="text-secondary" hex="#8B7BA3" />
            <Swatch bgClass="bg-text-muted"     label="text-muted"     hex="#A99BBF" />
            <Swatch bgClass="bg-text-light"     label="text-light"     hex="#C4A8B0" />
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHY ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Typography (Caveat)</h2>
        <div className="space-y-3">
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-display</span>
            <p className="text-display text-text-primary">Display — 48px / 700</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-heading-xl</span>
            <p className="text-heading-xl text-text-primary">Heading XL — 36px / 700</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-heading-lg</span>
            <p className="text-heading-lg text-text-primary">Heading LG — 30px / 600</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-heading-md</span>
            <p className="text-heading-md text-text-primary">Heading MD — 24px / 600</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-body-lg</span>
            <p className="text-body-lg text-text-primary">Body LG — 20px / 400</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-body</span>
            <p className="text-body text-text-primary">Body — 18px / 400 — main compliment text size</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-body-sm</span>
            <p className="text-body-sm text-text-primary">Body SM — 16px / 400</p>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-label text-text-muted w-32 shrink-0">.text-label</span>
            <p className="text-label text-text-muted">Label — 14px / 400 — minimum legible size</p>
          </div>
        </div>
      </section>

      {/* ── BUTTONS ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Buttons</h2>
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex flex-col items-center gap-2">
            <button
              className="bg-coral-500 text-white font-caveat text-body-sm
                         px-7 py-3 rounded-button hover:bg-coral-600 transition-colors"
            >
              Primary — Generate
            </button>
            <span className="text-label text-text-muted">Primary (coral)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              className="bg-blue-400 text-white font-caveat text-body-sm
                         px-7 py-3 rounded-button hover:bg-blue-500 transition-colors"
            >
              Secondary — Download
            </button>
            <span className="text-label text-text-muted">Secondary (periwinkle)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              className="bg-cream-500 text-text-muted font-caveat text-body-sm
                         px-7 py-3 rounded-button cursor-not-allowed"
              disabled
            >
              Disabled
            </button>
            <span className="text-label text-text-muted">Disabled</span>
          </div>
        </div>
      </section>

      {/* ── TEXT INPUT ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Text Input</h2>
        <input
          type="text"
          placeholder="Your name..."
          className="bg-white border border-blue-200 text-text-primary
                     font-caveat text-body rounded-input px-4 py-3 w-64
                     focus:outline-none focus:border-blue-400 transition-colors"
        />
      </section>

      {/* ── ICONS ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Icons (pixelarticons / pixel-art)</h2>

        <div className="mb-6">
          <h3 className="text-body-sm text-text-muted mb-3">24px</h3>
          <div className="flex gap-6 items-center flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Icon name="generate"   size={24} className="text-blue-400" />
              <span className="text-label text-text-muted">generate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="download"   size={24} className="text-coral-500" />
              <span className="text-label text-text-muted">download</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="regenerate" size={24} className="text-text-secondary" />
              <span className="text-label text-text-muted">regenerate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="brand"      size={24} className="text-coral-600" />
              <span className="text-label text-text-muted">brand</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="decorative" size={24} className="text-text-muted" />
              <span className="text-label text-text-muted">decorative</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-body-sm text-text-muted mb-3">48px</h3>
          <div className="flex gap-8 items-center flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <Icon name="generate"   size={48} className="text-blue-400" />
              <span className="text-label text-text-muted">generate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="download"   size={48} className="text-coral-500" />
              <span className="text-label text-text-muted">download</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="regenerate" size={48} className="text-text-secondary" />
              <span className="text-label text-text-muted">regenerate</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="brand"      size={48} className="text-coral-600" />
              <span className="text-label text-text-muted">brand</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Icon name="decorative" size={48} className="text-text-muted" />
              <span className="text-label text-text-muted">decorative</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIMENT CARD ── */}
      <section className="mb-12">
        <h2 className="text-heading-md text-text-secondary mb-6">Compliment Card</h2>
        <div className="bg-blue-200 rounded-card p-10 flex justify-center">
          <ComplimentCard
            name="Mx. Spectacular"
            compliment="You are a mass of radiant sunshine wrapped in human form. Scientists are baffled. Poets weep. Even your houseplants are thriving."
          />
        </div>
      </section>
    </div>
  );
}
