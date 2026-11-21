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
    id: 'barangays',
    label: '21 Barangays & Municipal Statistics',
    shortLabel: 'Barangays',
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
        <path d="M32 54s16-14.5 16-28a16 16 0 1 0-32 0c0 13.5 16 28 16 28z" />
        <circle cx="32" cy="26" r="6" />
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

const WOVEN_MOTIFS = [
  {
    id: 'heritage',
    bg: '#26489A',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M32 8v48M8 32h48M15 15l34 34M49 15L15 49" />
        <rect x="24" y="24" width="16" height="16" transform="rotate(45 32 32)" fill="none" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'agriculture',
    bg: '#2E8B57',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M8 46L24 22l12 16 8-10 12 18H8z" />
        <path d="M18 46c4-6 10-10 14-10s10 4 14 10" />
      </svg>
    ),
  },
  {
    id: 'church',
    bg: '#D1432A',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M32 10v14M26 16h12" />
        <path d="M16 52V32l16-10 16 10v20H16z" />
        <path d="M26 52V40a6 6 0 0 1 12 0v12" />
      </svg>
    ),
  },
  {
    id: 'river',
    bg: '#1976A8',
    svg: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M10 24c6-5 12-5 18 0s12 5 18 0 8-3 8-3" />
        <path d="M10 34c6-5 12-5 18 0s12 5 18 0 8-3 8-3" />
        <path d="M10 44c6-5 12-5 18 0s12 5 18 0 8-3 8-3" />
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
  // Repeat the 4 cultural motifs 12 times (48 tiles = 2688px) so it spans ultrawide desktop viewports
  const tiles = Array.from({ length: 48 }, (_, idx) => WOVEN_MOTIFS[idx % WOVEN_MOTIFS.length]);

  return (
    <div className="alcala-woven-strip" aria-hidden="true">
      <div className="alcala-woven-track">
        {tiles.map((motif, idx) => (
          <div
            key={`${motif.id}-${idx}`}
            className="alcala-woven-tile"
            style={{ backgroundColor: motif.bg }}
          >
            <div className="alcala-woven-icon">{motif.svg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
