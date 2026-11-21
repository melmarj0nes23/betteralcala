import React from 'react';

interface Pillar {
  id: string;
  label: string;
  bg: string;
  svg: React.ReactNode;
}

const PILLARS: Pillar[] = [
  {
    id: 'heritage',
    label: 'Civic Heritage & Governance',
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
    label: 'Agri-Industrial Center',
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
    label: '1881 Holy Cross Parish & Brick Heritage',
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
    label: 'Agno River & 21 Barangays',
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
    <div className="alcala-pennants" aria-hidden="true">
      <div className="alcala-pennants-rod" />
      <div className="alcala-pennants-grid">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.id}
            className="alcala-pennant"
            style={{ backgroundColor: pillar.bg }}
            title={pillar.label}
          >
            <div className="alcala-pennant-icon">{pillar.svg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlcalaWovenStrip() {
  // Repeat the 4 pillars 12 times (48 tiles = 2688px) so it spans even ultrawide desktop viewports
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
