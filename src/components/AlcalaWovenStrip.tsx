import React from 'react';
import { Link } from 'react-router-dom';

interface Pillar {
  id: string;
  label: string;
  shortLabel: string;
  to: string;
  bg: string;
  svg: React.ReactNode;
}

const PILLARS: Pillar[] = [
  {
    id: 'governance',
    label: 'Civic Heritage & Governance',
    shortLabel: 'Governance',
    to: '/government',
    bg: '#26489A',
    svg: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <path d="M10 24L32 10l22 14H10z" />
        <path d="M16 24v22M26 24v22M38 24v22M48 24v22" />
        <path d="M8 50h48M12 46h40" />
      </svg>
    ),
  },
  {
    id: 'unity',
    label: 'Community Unity & 21 Barangays',
    shortLabel: 'Unity',
    to: '/statistics',
    bg: '#2E8B57',
    svg: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <circle cx="32" cy="18" r="5" />
        <circle cx="17" cy="24" r="4.5" />
        <circle cx="47" cy="24" r="4.5" />
        <path d="M22 48v-8a10 10 0 0 1 20 0v8" />
        <path d="M9 48v-5a8 8 0 0 1 11-7.4" />
        <path d="M55 48v-5a8 8 0 0 0-11-7.4" />
      </svg>
    ),
  },
  {
    id: 'transparency',
    label: 'Budgets, Projects & Transparency',
    shortLabel: 'Transparency',
    to: '/budget',
    bg: '#D1432A',
    svg: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <path d="M32 10l18 7v14c0 12-7.5 21-18 25-10.5-4-18-13-18-25V17l18-7z" />
        <path d="M23 32l6 6 12-12" />
      </svg>
    ),
  },
  {
    id: 'services',
    label: 'Public Services & Hotlines',
    shortLabel: 'Services',
    to: '/services',
    bg: '#1976A8',
    svg: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full"
      >
        <rect x="14" y="10" width="36" height="44" rx="5" />
        <path d="M22 24h20M22 34h20M22 44h12" />
      </svg>
    ),
  },
];

export function AlcalaPennants() {
  return (
    <nav className="alcala-pennants" aria-label="Four Pillars of BetterAlcala">
      <div className="alcala-pennants-rod" />
      <div className="alcala-pennants-grid">
        {PILLARS.map((pillar) => (
          <Link
            key={pillar.id}
            to={pillar.to}
            className="alcala-pennant no-underline"
            style={{ backgroundColor: pillar.bg }}
            title={pillar.label}
            aria-label={pillar.label}
          >
            <div className="alcala-pennant-icon">{pillar.svg}</div>
            <span className="alcala-pennant-label">{pillar.shortLabel}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function AlcalaWovenStrip() {
  // Repeat the 4 pillar motifs 12 times (48 tiles = 2688px) so it spans ultrawide desktop viewports
  const tiles = Array.from({ length: 48 }, (_, idx) => PILLARS[idx % PILLARS.length]);

  return (
    <div className="alcala-woven-strip" aria-hidden="true">
      <div className="alcala-woven-track">
        {tiles.map((pillar, idx) => (
          <div
            key={`${pillar.id}-${idx}`}
            className="alcala-woven-tile"
            style={{ backgroundColor: pillar.bg }}
          >
            <div className="alcala-woven-icon">{pillar.svg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
