import React from 'react';

const PALETTES = [
  ['#26489A', '#2E8B57', '#F59E0B', '#1976A8'],
  ['#D1432A', '#0F2342', '#1976A8', '#FBBF24'],
  ['#2E8B57', '#1976A8', '#D1432A', '#0F2342'],
  ['#1976A8', '#D1432A', '#26489A', '#6EE7B7'],
  ['#0F2342', '#2E8B57', '#F59E0B', '#D1432A'],
];

export function slugifyBarangay(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function BarangayEmblem({
  index,
  size = 44,
}: {
  index: number;
  size?: number;
}) {
  const [c1, c2, c3, c4] = PALETTES[index % PALETTES.length];
  const variant = index % 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="rounded-xl shrink-0 shadow-xs"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="10" fill={c1} />
      {variant === 0 && (
        <>
          <rect x="24" y="0" width="24" height="24" fill={c2} />
          <circle cx="14" cy="34" r="10" fill={c3} />
          <path d="M24 24 L48 48 H24 Z" fill={c4} />
        </>
      )}
      {variant === 1 && (
        <>
          <circle cx="24" cy="24" r="18" fill={c2} />
          <rect x="15" y="15" width="18" height="18" transform="rotate(45 24 24)" fill={c3} />
          <circle cx="24" cy="24" r="5" fill="#FAF7F2" />
        </>
      )}
      {variant === 2 && (
        <>
          <path d="M0 30 Q12 18 24 30 T48 30 V48 H0 Z" fill={c4} />
          <circle cx="34" cy="14" r="7" fill={c3} />
          <path d="M0 38 Q12 28 24 38 T48 38 V48 H0 Z" fill={c2} />
        </>
      )}
      {variant === 3 && (
        <>
          <polygon points="0,48 20,16 38,48" fill={c2} />
          <polygon points="18,48 34,22 48,48" fill={c4} />
          <circle cx="14" cy="14" r="6" fill={c3} />
        </>
      )}
    </svg>
  );
}
