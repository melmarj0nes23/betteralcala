import React from 'react';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';

const ERA_STYLES: Record<
  string,
  { badgeBg: string; badgeText: string; nodeBg: string; illustration: React.ReactNode }
> = {
  'Pre-1873': {
    badgeBg: 'bg-[#2E8B57]/12',
    badgeText: 'text-[#2E8B57]',
    nodeBg: '#2E8B57',
    illustration: (
      <svg viewBox="0 0 360 190" className="block w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="360" height="190" fill="#183A2C" />
        <circle cx="286" cy="54" r="34" fill="#F59E0B" opacity="0.9" />
        <path d="M0 140 Q95 112 190 132 T360 126 L360 190 L0 190 Z" fill="#2E8B57" />
        <path d="M0 156 Q120 138 240 154 T360 148 L360 190 L0 190 Z" fill="#226B43" />
        {/* Dangla shrub leaves */}
        <g fill="#6EE7B7" opacity="0.9">
          <ellipse cx="64" cy="128" rx="18" ry="8" transform="rotate(-28 64 128)" />
          <ellipse cx="86" cy="118" rx="18" ry="8" transform="rotate(24 86 118)" />
          <ellipse cx="74" cy="108" rx="8" ry="18" />
        </g>
        {/* Wooden kariton cart */}
        <rect x="155" y="102" width="76" height="28" rx="4" fill="#D97706" />
        <path d="M162 102 L172 80 L224 80 L230 102" fill="#FBBF24" opacity="0.85" />
        <line x1="231" y1="118" x2="270" y2="112" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
        <circle cx="193" cy="134" r="18" fill="none" stroke="#FDE68A" strokeWidth="4.5" />
        <circle cx="193" cy="134" r="4" fill="#FDE68A" />
        <path d="M179 134 H207 M193 120 V148" stroke="#FDE68A" strokeWidth="2.5" />
      </svg>
    ),
  },
  '1873': {
    badgeBg: 'bg-[#26489A]/12',
    badgeText: 'text-[#26489A]',
    nodeBg: '#26489A',
    illustration: (
      <svg viewBox="0 0 360 190" className="block w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="360" height="190" fill="#172B5E" />
        <circle cx="80" cy="40" r="70" fill="#26489A" opacity="0.45" />
        <circle cx="295" cy="155" r="55" fill="#1976A8" opacity="0.35" />
        {/* Petition Scroll */}
        <rect x="108" y="34" width="144" height="122" rx="8" fill="#FAF7F2" />
        <rect x="98" y="28" width="164" height="16" rx="8" fill="#E2D6C3" />
        <rect x="98" y="146" width="164" height="16" rx="8" fill="#E2D6C3" />
        <line x1="128" y1="62" x2="230" y2="62" stroke="#26489A" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <line x1="128" y1="78" x2="218" y2="78" stroke="#64748B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="128" y1="92" x2="226" y2="92" stroke="#64748B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="128" y1="106" x2="195" y2="106" stroke="#64748B" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        {/* Wax Seal */}
        <circle cx="216" cy="124" r="15" fill="#D1432A" />
        <circle cx="216" cy="124" r="9" fill="none" stroke="#FDE68A" strokeWidth="1.5" />
        {/* Quill */}
        <path d="M244 46 C265 34 282 42 274 64 C264 82 246 92 232 104 L224 108 L228 98 C236 82 234 58 244 46 Z" fill="#FBBF24" />
      </svg>
    ),
  },
  '1875': {
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    nodeBg: '#D97706',
    illustration: (
      <svg viewBox="0 0 360 190" className="block w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="360" height="190" fill="#0F2342" />
        {/* Sunburst rays */}
        <g stroke="#F59E0B" strokeWidth="2" opacity="0.35">
          <line x1="180" y1="95" x2="180" y2="12" />
          <line x1="180" y1="95" x2="255" y2="25" />
          <line x1="180" y1="95" x2="105" y2="25" />
          <line x1="180" y1="95" x2="280" y2="95" />
          <line x1="180" y1="95" x2="80" y2="95" />
        </g>
        {/* Ribbon & Royal Decree Medallion */}
        <path d="M156 122 L140 172 L166 158 L180 174 L180 122 Z" fill="#D1432A" />
        <path d="M204 122 L220 172 L194 158 L180 174 L180 122 Z" fill="#26489A" />
        <circle cx="180" cy="88" r="46" fill="#F59E0B" />
        <circle cx="180" cy="88" r="36" fill="#FEF3C7" />
        <text
          x="180"
          y="96"
          textAnchor="middle"
          fill="#0F2342"
          fontSize="22"
          fontWeight="800"
          fontFamily="Georgia, serif"
        >
          1875
        </text>
      </svg>
    ),
  },
  '1881': {
    badgeBg: 'bg-[#D1432A]/12',
    badgeText: 'text-[#D1432A]',
    nodeBg: '#D1432A',
    illustration: (
      <svg viewBox="0 0 360 190" className="block w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="360" height="190" fill="#4A1D16" />
        <circle cx="280" cy="48" r="28" fill="#FBBF24" opacity="0.85" />
        <path d="M0 162 H360 V190 H0 Z" fill="#7C2D12" />
        {/* Historic Brick Bell Tower & Church Facade */}
        <rect x="86" y="42" width="44" height="120" fill="#D1432A" />
        <polygon points="82,42 108,18 134,42" fill="#9A3412" />
        <rect x="100" y="56" width="16" height="24" rx="8" fill="#4A1D16" />
        {/* Main Facade */}
        <polygon points="130,86 204,50 278,86" fill="#B93822" />
        <rect x="130" y="86" width="148" height="76" fill="#E05A40" />
        {/* Brick pattern lines */}
        <g stroke="#9A3412" strokeWidth="1.5" opacity="0.45">
          <line x1="130" y1="106" x2="278" y2="106" />
          <line x1="130" y1="126" x2="278" y2="126" />
          <line x1="130" y1="146" x2="278" y2="146" />
        </g>
        {/* Cross & Arched Door */}
        <path d="M204 28 V46 M196 35 H212" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M186 162 V124 A18 18 0 0 1 222 124 V162 Z" fill="#4A1D16" />
        <circle cx="204" cy="84" r="10" fill="#FDE68A" opacity="0.9" />
      </svg>
    ),
  },
  'Modern Era': {
    badgeBg: 'bg-[#1976A8]/12',
    badgeText: 'text-[#1976A8]',
    nodeBg: '#1976A8',
    illustration: (
      <svg viewBox="0 0 360 190" className="block w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="360" height="190" fill="#0F3554" />
        <circle cx="72" cy="48" r="24" fill="#FBBF24" opacity="0.9" />
        {/* Rice hills */}
        <path d="M0 120 Q90 86 180 116 T360 108 L360 190 L0 190 Z" fill="#2E8B57" />
        {/* Agro-Industrial Silos */}
        <rect x="220" y="66" width="24" height="58" rx="4" fill="#E2E8F0" />
        <path d="M220 66 A12 10 0 0 1 244 66 Z" fill="#94A3B8" />
        <rect x="250" y="76" width="24" height="48" rx="4" fill="#CBD5E1" />
        <path d="M250 76 A12 10 0 0 1 274 76 Z" fill="#64748B" />
        <rect x="280" y="88" width="40" height="36" fill="#F59E0B" />
        {/* Flowing Agno River */}
        <path d="M0 150 C80 128 150 174 240 144 C295 126 330 138 360 146 L360 190 L0 190 Z" fill="#1976A8" />
        <path d="M24 166 Q72 156 120 166 M170 162 Q220 152 270 162" stroke="#BAE6FD" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
};

export default function AlcalaHistoryTimeline({ title }: { title: string }) {
  return (
    <section className="section history-section">
      <div className="container">
        <div className="home-stats-v2-header mb-10">
          <span className="inline-block font-mono-data text-xs font-bold uppercase tracking-widest text-[#D1432A] mb-1">
            Heritage &amp; Origins
          </span>
          <h2>
            <i className="bi bi-clock-history" aria-hidden="true" /> <span>{title}</span>
          </h2>
          <p className="text-sm text-slate-600 mt-1 mb-0">
            Key milestones from Barrio Dangla to Eastern Pangasinan&apos;s agri-industrial hub
          </p>
        </div>

        <div className="relative">
          {/* Center vertical spine on desktop, left spine on mobile */}
          <div
            className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#2E8B57] via-[#D97706] to-[#1976A8]/70"
            aria-hidden="true"
          />
          <div
            className="md:hidden absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#2E8B57] via-[#D97706] to-[#1976A8]/70"
            aria-hidden="true"
          />

          <div className="space-y-8 md:space-y-12">
            {MUNICIPAL_PROFILE.historyTimeline.map((item, idx) => {
              const style = ERA_STYLES[item.year] || ERA_STYLES['1873'];
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.year}
                  className="relative grid grid-cols-1 md:grid-cols-[1fr_76px_1fr] items-center gap-4 md:gap-0 pl-10 md:pl-0"
                >
                  {/* Illustration side (alternates left/right on desktop) */}
                  <div
                    className={`${
                      isEven ? 'md:order-1 md:pr-6' : 'md:order-3 md:pl-6'
                    }`}
                  >
                    <div className="overflow-hidden rounded-2xl border border-black/10 shadow-sm h-40 sm:h-44">
                      {style.illustration}
                    </div>
                  </div>

                  {/* Center Year Node */}
                  <div className="md:order-2 flex md:justify-center">
                    <div
                      className="absolute left-0 top-3 md:static z-10 flex items-center justify-center rounded-full text-white font-mono-data text-[11px] font-bold px-2.5 py-1.5 min-w-[68px] text-center shadow-md border-2 border-[#FAF7F2]"
                      style={{ backgroundColor: style.nodeBg }}
                    >
                      {item.year === 'Modern Era' ? 'Today' : item.year}
                    </div>
                  </div>

                  {/* Story Card side */}
                  <div
                    className={`${
                      isEven ? 'md:order-3 md:pl-6' : 'md:order-1 md:pr-6 md:text-right'
                    }`}
                  >
                    <article className="bg-white rounded-2xl p-5 border border-black/10 shadow-xs hover:shadow-md transition-shadow">
                      <span
                        className={`inline-block font-mono-data text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 ${style.badgeBg} ${style.badgeText}`}
                      >
                        {item.year}
                      </span>
                      <h3 className="m-0 text-lg font-bold text-[#0f2342] mb-1.5">{item.title}</h3>
                      <p className="m-0 text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
