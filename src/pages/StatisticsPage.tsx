import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PhoneIcon, SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Card from '../components/v2/ui/Card';
import Eyebrow from '../components/v2/ui/Eyebrow';
import Flag from '../components/v2/ui/Flag';
import Button from '../components/v2/ui/Button';
import ArrowLink from '../components/v2/ui/ArrowLink';
import { slugifyBarangay } from '../components/BarangayEmblem';
import { VerificationBadge } from '../components/VerificationBadge';
import { BARANGAYS_DATA, MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { INFRASTRUCTURE_PROJECTS } from '../data/transparencyData';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

type BarangayTab = 'overview' | 'projects' | 'all';

export default function StatisticsPage() {
  const { t } = useLanguage();
  const { barangay: barangaySlug } = useParams<{ barangay?: string }>();
  const [searchParams] = useSearchParams();
  const showOverview = searchParams.get('view') === 'overview';
  const [activeTab, setActiveTab] = useState<BarangayTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedBarangays = useMemo(
    () => [...BARANGAYS_DATA].sort((a, b) => b.population2020 - a.population2020),
    []
  );

  const alphabeticalBarangays = useMemo(
    () => [...BARANGAYS_DATA].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const total2020Pop = useMemo(
    () => BARANGAYS_DATA.reduce((sum, b) => sum + b.population2020, 0) || 48908,
    []
  );

  const avgBarangayPop = Math.round(total2020Pop / BARANGAYS_DATA.length);
  const maxBarangayPop = rankedBarangays[0]?.population2020 || 1;
  const growthPct = (
    ((MUNICIPAL_PROFILE.population2024 - MUNICIPAL_PROFILE.historicalCensus[0].population) /
      MUNICIPAL_PROFILE.historicalCensus[0].population) *
    100
  ).toFixed(1);

  const selectedBarangay = useMemo(() => {
    if (!barangaySlug) return null;
    return BARANGAYS_DATA.find((b) => slugifyBarangay(b.name) === barangaySlug) || null;
  }, [barangaySlug]);

  const selectedBarangayRank = useMemo(() => {
    if (!selectedBarangay) return 1;
    return rankedBarangays.findIndex((b) => b.psgcCode === selectedBarangay.psgcCode) + 1;
  }, [selectedBarangay, rankedBarangays]);

  const matchingProjects = useMemo(() => {
    if (!selectedBarangay) return [];
    const needle = selectedBarangay.name.toLowerCase();
    return INFRASTRUCTURE_PROJECTS.filter(
      (p) =>
        p.barangay.toLowerCase().includes(needle) ||
        p.name.toLowerCase().includes(needle) ||
        p.location.toLowerCase().includes(needle)
    );
  }, [selectedBarangay]);

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return alphabeticalBarangays;
    return alphabeticalBarangays.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.psgcCode.toLowerCase().includes(q) ||
        (b.classification || '').toLowerCase().includes(q)
    );
  }, [alphabeticalBarangays, searchQuery]);

  // ---------------------------------------------------------------------------
  // 1. BARANGAY DETAIL PROFILE VIEW (/statistics/:barangay)
  // ---------------------------------------------------------------------------
  if (selectedBarangay) {
    const sharePct = ((selectedBarangay.population2020 / total2020Pop) * 100).toFixed(1);
    const vsMaxPct = Math.round((selectedBarangay.population2020 / maxBarangayPop) * 100);
    const comparisonList = [
      { label: `Brgy. ${selectedBarangay.name}`, value: selectedBarangay.population2020, highlight: true },
      { label: 'Alcala Barangay Average', value: avgBarangayPop, highlight: false },
      { label: `Largest (${rankedBarangays[0]?.name})`, value: maxBarangayPop, highlight: false },
    ];

    return (
      <Layout
        breadcrumbs={[
          { label: 'Statistics', to: '/statistics' },
          { label: `Brgy. ${selectedBarangay.name}` },
        ]}
      >
        <PageMasthead
          title={selectedBarangay.name}
          lede={`PSGC ${selectedBarangay.psgcCode} · ${selectedBarangay.classification || 'Rural'} Barangay · Alcala, Pangasinan${
            selectedBarangay.phones && selectedBarangay.phones.length > 0
              ? ` · Hotline: ${selectedBarangay.phones[0]}`
              : ''
          }`}
        >
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/statistics" variant="ghost" size="sm">
              ← All 21 Barangays
            </Button>
            <Button as={Link} to="/statistics?view=overview" size="sm">
              Municipal Overview
            </Button>
          </div>
        </PageMasthead>

        <section className="py-12 max-md:py-8">
          <Container>
            {/* 4 Ruled KPI Cells */}
            <div className="mb-10 grid grid-cols-4 border border-ed-rule bg-white max-lg:grid-cols-2 max-sm:grid-cols-1">
              <div className="border-r border-ed-rule p-6 max-lg:border-b max-sm:border-r-0">
                <Eyebrow>2020 PSA Census</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-ink tabular-nums">
                  {selectedBarangay.population2020.toLocaleString()}
                </div>
                <div className="mt-3 h-1.5 w-full bg-ed-paper-3">
                  <div className="h-full bg-ed-navy" style={{ width: `${vsMaxPct}%` }} />
                </div>
                <p className="mt-2 font-mono-ed text-[10px] uppercase tracking-[0.1em] text-ed-ink-3">
                  Population
                </p>
              </div>

              <div className="border-r border-ed-rule p-6 max-lg:border-b max-lg:border-r-0">
                <Eyebrow>Municipal Share</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-navy tabular-nums">
                  {sharePct}%
                </div>
                <p className="mt-4 font-mono-ed text-[10px] uppercase tracking-[0.1em] text-ed-ink-3">
                  Of {total2020Pop.toLocaleString()} residents
                </p>
              </div>

              <div className="border-r border-ed-rule p-6 max-sm:border-b max-sm:border-r-0">
                <Eyebrow>Population Rank</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-ink tabular-nums">
                  #{selectedBarangayRank}
                </div>
                <p className="mt-4 font-mono-ed text-[10px] uppercase tracking-[0.1em] text-ed-ink-3">
                  Out of {BARANGAYS_DATA.length} barangays
                </p>
              </div>

              <div className="p-6">
                <Eyebrow>Classification</Eyebrow>
                <div className="mt-2 font-serif-ed text-2xl font-bold leading-tight text-ed-ink">
                  {selectedBarangay.classification || 'Rural'}
                </div>
                <p className="mt-4 font-mono-ed text-[10px] uppercase tracking-[0.1em] text-ed-ink-3">
                  PSGC {selectedBarangay.psgcCode}
                </p>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="mb-8 flex flex-wrap gap-2 border-b border-ed-rule pb-4">
              {(
                [
                  { id: 'overview', label: 'Overview & Comparison' },
                  { id: 'projects', label: `Public Projects (${matchingProjects.length})` },
                  { id: 'all', label: 'Switch Barangay (21)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'cursor-pointer border px-4 py-2 font-mono-ed text-[11px] uppercase tracking-[0.12em] transition-colors',
                    activeTab === tab.id
                      ? 'border-ed-navy bg-ed-navy text-white'
                      : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-[1.3fr_1fr] gap-10 max-lg:grid-cols-1">
                <div>
                  <SectionHeader label="Population Comparison" meta="2020 PSA Census" />
                  <div className="border-y border-ed-navy bg-white">
                    {comparisonList.map((row) => {
                      const pct = Math.round((row.value / maxBarangayPop) * 100);
                      return (
                        <div
                          key={row.label}
                          className="grid grid-cols-[180px_1fr_90px] items-center gap-4 border-b border-ed-rule py-4 last:border-b-0 max-sm:grid-cols-[120px_1fr_70px]"
                        >
                          <div className={cn('font-serif-ed text-base', row.highlight ? 'font-bold text-ed-navy' : 'text-ed-ink')}>
                            {row.label}
                          </div>
                          <div className="relative h-2 bg-ed-paper-3">
                            <div
                              className={cn('absolute inset-y-0 left-0', row.highlight ? 'bg-ed-navy' : 'bg-ed-ink-3')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="text-right font-mono-ed text-sm font-medium text-ed-ink tabular-nums">
                            {row.value.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-ed-rule bg-ed-paper-2 p-6">
                  <Eyebrow tone="navy">Barangay Contact</Eyebrow>
                  <h3 className="mt-2 font-serif-ed text-xl font-semibold text-ed-ink">
                    Barangay Hall · {selectedBarangay.name}
                  </h3>
                  <div className="mt-4 space-y-2 border-t border-ed-rule pt-4 text-sm text-ed-ink-2">
                    <div>
                      <span className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">PSGC Code: </span>
                      <span className="font-mono-ed">{selectedBarangay.psgcCode}</span>
                    </div>
                    {selectedBarangay.phones && selectedBarangay.phones.length > 0 ? (
                      selectedBarangay.phones.map((ph) => (
                        <div key={ph}>
                          <a
                            href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                            className="inline-flex items-center gap-1.5 font-mono-ed text-ed-navy no-underline hover:text-ed-red"
                          >
                            <PhoneIcon size={13} aria-hidden /> {ph}
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-ed-ink-3">No direct barangay hotline listed.</p>
                    )}
                  </div>
                  <div className="mt-6">
                    <ArrowLink to="/officials">View barangay officials</ArrowLink>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div>
                <SectionHeader
                  label={`Infrastructure Projects in ${selectedBarangay.name}`}
                  meta={
                    <a
                      href="https://budget.betteralcala.org/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-ed-navy no-underline hover:text-ed-red"
                    >
                      Open Budget Portal ↗
                    </a>
                  }
                />
                {matchingProjects.length === 0 ? (
                  <div className="border border-dashed border-ed-rule py-12 text-center text-sm text-ed-ink-3">
                    No barangay-specific infrastructure records matched in the local dataset. Visit{' '}
                    <a href="https://budget.betteralcala.org/" target="_blank" rel="noreferrer" className="text-ed-navy underline">
                      budget.betteralcala.org
                    </a>{' '}
                    for full national/municipal records.
                  </div>
                ) : (
                  <div className="divide-y divide-ed-rule border-y border-ed-rule bg-white">
                    {matchingProjects.map((p) => (
                      <div key={p.id} className="py-5">
                        <div className="mb-2 flex flex-wrap items-center gap-3">
                          <Flag variant="navy">{p.category}</Flag>
                          <span className="font-mono-ed text-xs text-ed-ink-3">{p.id}</span>
                          <VerificationBadge status={p.citation.verificationStatus} />
                        </div>
                        <h3 className="font-serif-ed text-lg font-semibold text-ed-ink">{p.name}</h3>
                        <p className="mt-1 text-sm text-ed-ink-2">
                          {p.location} · {p.statusLabel}
                          {(p.contractCost ?? p.abcAmount) != null
                            ? ` · ₱${(p.contractCost ?? p.abcAmount)!.toLocaleString()}`
                            : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                {alphabeticalBarangays.map((b) => (
                  <Link
                    key={b.psgcCode}
                    to={`/statistics/${slugifyBarangay(b.name)}`}
                    onClick={() => setActiveTab('overview')}
                    className={cn(
                      'block border p-4 no-underline transition-colors',
                      b.psgcCode === selectedBarangay.psgcCode
                        ? 'border-ed-navy bg-ed-navy-tint'
                        : 'border-ed-rule bg-white hover:border-ed-ink'
                    )}
                  >
                    <div className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">
                      PSGC {b.psgcCode}
                    </div>
                    <div className="mt-1 font-serif-ed text-lg font-semibold text-ed-ink">
                      {b.name}
                    </div>
                    <div className="mt-1 font-mono-ed text-xs text-ed-ink-2 tabular-nums">
                      {b.population2020.toLocaleString()} · {b.classification}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Container>
        </section>
      </Layout>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ENTIRE MUNICIPALITY OVERVIEW (/statistics?view=overview)
  // ---------------------------------------------------------------------------
  if (showOverview) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Statistics', to: '/statistics' },
          { label: 'Municipal Overview' },
        ]}
      >
        <PageMasthead
          title="Alcala Municipal Statistics"
          lede={`Official demographic, geographic, and economic indicators for the Municipality of Alcala, Pangasinan (PSGC ${MUNICIPAL_PROFILE.psgcCode}).`}
        >
          <Button as={Link} to="/statistics" variant="ghost" size="sm">
            ← All 21 Barangays
          </Button>
        </PageMasthead>

        <section className="py-12 max-md:py-8">
          <Container>
            {/* 4 Key Metrics */}
            <div className="mb-14 grid grid-cols-4 border border-ed-rule bg-white max-lg:grid-cols-2 max-sm:grid-cols-1">
              <div className="border-r border-ed-rule p-6 max-lg:border-b max-sm:border-r-0">
                <Eyebrow>2024 POPCEN</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-ink tabular-nums">
                  {MUNICIPAL_PROFILE.population2024.toLocaleString()}
                </div>
                <p className="mt-3 font-mono-ed text-[11px] text-ed-ink-3">
                  Up from 48,908 in 2020
                </p>
              </div>
              <div className="border-r border-ed-rule p-6 max-lg:border-b max-lg:border-r-0">
                <Eyebrow>Official Units</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-ink tabular-nums">
                  {MUNICIPAL_PROFILE.barangayCount}
                </div>
                <p className="mt-3 font-mono-ed text-[11px] text-ed-ink-3">
                  PSGC Verified Barangays
                </p>
              </div>
              <div className="border-r border-ed-rule p-6 max-sm:border-b max-sm:border-r-0">
                <Eyebrow>Total Land Area</Eyebrow>
                <div className="mt-2 font-serif-ed text-4xl font-bold leading-none text-ed-ink tabular-nums">
                  {MUNICIPAL_PROFILE.landAreaKm2} km²
                </div>
                <p className="mt-3 font-mono-ed text-[11px] text-ed-ink-3">
                  ~1,082 residents / km²
                </p>
              </div>
              <div className="p-6">
                <Eyebrow>Classification</Eyebrow>
                <div className="mt-2 font-serif-ed text-3xl font-bold leading-none text-ed-ink">
                  3rd Class
                </div>
                <p className="mt-3 font-mono-ed text-[11px] text-ed-ink-3">
                  Pangasinan 5th District
                </p>
              </div>
            </div>

            {/* Population Trends (1990–2024) */}
            <div className="mb-14">
              <SectionHeader
                label="Population Trends (1990–2024)"
                meta="Source: Philippine Statistics Authority (PSA)"
              />

              <dl className="mb-8 grid grid-cols-3 divide-x divide-ed-rule border-y border-ed-ink bg-ed-paper-2 max-sm:grid-cols-1 max-sm:divide-x-0 max-sm:divide-y">
                <div className="p-6">
                  <dt className="font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3">
                    1990 Census Baseline
                  </dt>
                  <dd className="mt-2 font-serif-ed text-3xl font-bold text-ed-ink tabular-nums">
                    30,684
                  </dd>
                </div>
                <div className="p-6">
                  <dt className="font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3">
                    2024 POPCEN Count
                  </dt>
                  <dd className="mt-2 font-serif-ed text-3xl font-bold text-ed-navy tabular-nums">
                    49,479
                  </dd>
                </div>
                <div className="p-6">
                  <dt className="font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3">
                    34-Year Growth
                  </dt>
                  <dd className="mt-2 font-serif-ed text-3xl font-bold text-ed-red tabular-nums">
                    +{growthPct}%
                  </dd>
                </div>
              </dl>

              <div className="border border-ed-rule bg-white p-6">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ed-rule pb-4">
                  <div>
                    <h3 className="font-serif-ed text-lg font-semibold text-ed-ink">
                      PSA Census Population Trajectory
                    </h3>
                    <p className="text-xs text-ed-ink-3">
                      Total residents recorded per census year (scale 0 – 60,000)
                    </p>
                  </div>
                  <div className="flex items-center gap-5 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-ed-ink-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 bg-ed-navy" />
                      1990–2020 Census
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 bg-ed-red" />
                      2024 POPCEN
                    </span>
                  </div>
                </div>

                <div className="relative pl-0 sm:pl-12">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 flex h-[210px] flex-col justify-between sm:pl-12"
                    aria-hidden="true"
                  >
                    {[60000, 45000, 30000, 15000, 0].map((tick) => (
                      <div key={tick} className="relative flex w-full items-center">
                        <span className="hidden w-10 text-right font-mono-ed text-[11px] text-ed-ink-3 tabular-nums sm:absolute sm:-left-12 sm:inline-block">
                          {tick === 0 ? '0' : `${tick / 1000}k`}
                        </span>
                        <div
                          className={cn(
                            'w-full',
                            tick === 0
                              ? 'border-b border-ed-ink'
                              : 'border-b border-dashed border-ed-rule'
                          )}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 grid h-[210px] grid-cols-6 gap-2 sm:gap-6">
                    {MUNICIPAL_PROFILE.historicalCensus.map((point) => {
                      const barHeightPct = Math.round((point.population / 60000) * 100);
                      const isCurrent = point.year === 2024;
                      return (
                        <div key={point.year} className="flex h-full min-w-0 flex-col items-center justify-end">
                          <span
                            className={cn(
                              'mb-1.5 font-mono-ed text-[10px] font-medium tabular-nums sm:text-xs',
                              isCurrent ? 'text-ed-red' : 'text-ed-navy'
                            )}
                          >
                            <span className="hidden sm:inline">{point.population.toLocaleString()}</span>
                            <span className="sm:hidden">{(point.population / 1000).toFixed(1)}k</span>
                          </span>
                          <div
                            className={cn('w-full max-w-[52px]', isCurrent ? 'bg-ed-red' : 'bg-ed-navy')}
                            style={{ height: `${barHeightPct}%` }}
                            aria-label={`${point.year}: ${point.population.toLocaleString()}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-6 gap-2 pt-3 sm:gap-6">
                    {MUNICIPAL_PROFILE.historicalCensus.map((point, idx) => {
                      const prev = idx > 0 ? MUNICIPAL_PROFILE.historicalCensus[idx - 1].population : null;
                      const deltaPct = prev ? (((point.population - prev) / prev) * 100).toFixed(1) : null;
                      const isCurrent = point.year === 2024;
                      return (
                        <div key={point.year} className="min-w-0 text-center">
                          <div
                            className={cn(
                              'font-serif-ed text-xs font-bold tabular-nums sm:text-sm',
                              isCurrent ? 'text-ed-red' : 'text-ed-ink'
                            )}
                          >
                            {point.year}
                          </div>
                          <div className="mt-0.5 font-mono-ed text-[10px] text-ed-ink-3 tabular-nums">
                            {deltaPct ? `+${deltaPct}%` : 'Base'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Population by Barangay (Ruled Bar List matching TransparencyStrip) */}
            <div className="mb-14">
              <SectionHeader
                label="Population by Barangay"
                meta="All 21 PSGC Barangays · Click any row for details"
              />
              <div className="border-y border-ed-navy bg-white">
                {rankedBarangays.map((b, idx) => {
                  const widthPct = Math.round((b.population2020 / maxBarangayPop) * 100);
                  return (
                    <Link
                      key={b.psgcCode}
                      to={`/statistics/${slugifyBarangay(b.name)}`}
                      className="grid grid-cols-[48px_minmax(140px,240px)_1fr_90px] items-center gap-4 border-b border-ed-rule px-4 py-3 text-ed-ink no-underline transition-colors last:border-b-0 hover:bg-ed-paper-2 max-sm:grid-cols-[36px_1fr_70px]"
                    >
                      <span className="font-mono-ed text-xs font-medium text-ed-navy tabular-nums">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <span className="font-serif-ed text-base font-semibold text-ed-ink">{b.name}</span>
                        <span className="ml-2 font-mono-ed text-[10px] text-ed-ink-3 max-md:hidden">
                          {b.psgcCode}
                        </span>
                      </div>
                      <div className="relative h-2 bg-ed-paper-3 max-sm:hidden">
                        <div className="absolute inset-y-0 left-0 bg-ed-navy" style={{ width: `${widthPct}%` }} />
                      </div>
                      <span className="text-right font-mono-ed text-sm font-medium text-ed-ink tabular-nums">
                        {b.population2020.toLocaleString()}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Economy, Agriculture & Geography */}
            <div>
              <SectionHeader label="Economy, Agriculture &amp; Geography" />
              <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
                <div className="border border-ed-rule bg-white p-6">
                  <Eyebrow>Agriculture</Eyebrow>
                  <h3 className="mt-2 font-serif-ed text-lg font-semibold text-ed-ink">
                    Primary Agricultural Economy
                  </h3>
                  <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                    Alcala’s economy is anchored in rice and corn production, supplemented by tobacco, lowland vegetables, poultry, and livestock farming.
                  </p>
                </div>
                <div className="border border-ed-rule bg-white p-6">
                  <Eyebrow>Industry</Eyebrow>
                  <h3 className="mt-2 font-serif-ed text-lg font-semibold text-ed-ink">
                    Agro-Industrial &amp; Cooperatives
                  </h3>
                  <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                    Facilities such as the Alcala Agro-Industrial Complex in Barangay Bersamin and active farmers’ cooperatives support grain trading and post-harvest processing.
                  </p>
                </div>
                <div className="border border-ed-rule bg-white p-6">
                  <div className="flex items-center justify-between gap-2">
                    <Eyebrow>Competitiveness</Eyebrow>
                    <VerificationBadge status="Needs Review" />
                  </div>
                  <h3 className="mt-2 font-serif-ed text-lg font-semibold text-ed-ink">
                    CMCI &amp; Poverty Stats
                  </h3>
                  <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                    Detailed DTI Cities and Municipalities Competitiveness Index (CMCI) pillar scores and PSA Small Area Poverty Estimates are awaiting official release.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </Layout>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. DEFAULT BARANGAY SELECTOR HUB (/statistics)
  // ---------------------------------------------------------------------------
  return (
    <Layout breadcrumbs={[{ label: t('nav-statistics') }]}>
      <PageMasthead title={t('stats-title')} lede={t('stats-desc')}>
        <Button as={Link} to="/statistics?view=overview" size="sm">
          View Entire Municipality Overview →
        </Button>
      </PageMasthead>

      <section className="py-12 max-md:py-8">
        <Container>
          <div className="mb-8 grid grid-cols-[1fr_auto] items-center gap-4 border-b border-ed-rule pb-6 max-md:grid-cols-1">
            <div className="relative">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ed-ink-3"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter barangay name or PSGC code..."
                aria-label="Filter barangays"
                className="h-11 w-full border border-ed-ink bg-white pl-10 pr-4 font-sans-ed text-[15px] text-ed-ink outline-none placeholder:text-ed-ink-4 focus:border-ed-navy"
              />
            </div>
            <div className="font-mono-ed text-xs uppercase tracking-[0.1em] text-ed-ink-2 tabular-nums">
              Showing <strong className="text-sm text-ed-ink">{filteredDirectory.length}</strong> of {BARANGAYS_DATA.length} barangays
            </div>
          </div>

          <div className="mb-12 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {filteredDirectory.map((b) => (
              <Card key={b.psgcCode} to={`/statistics/${slugifyBarangay(b.name)}`}>
                <div className="flex items-center justify-between gap-2">
                  <Eyebrow tone="navy">PSGC {b.psgcCode}</Eyebrow>
                  <Flag>{b.classification}</Flag>
                </div>
                <h3 className="mt-3 font-serif-ed text-xl font-bold text-ed-ink">
                  {b.name}
                </h3>
                <div className="mt-3 flex items-center justify-between border-t border-ed-rule pt-3 font-mono-ed text-xs text-ed-ink-2 tabular-nums">
                  <span>{b.population2020.toLocaleString()} residents</span>
                  <span className="text-ed-navy">Profile →</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <Card to="/statistics?view=overview" className="bg-ed-paper-2">
              <Eyebrow tone="navy">Municipal Summary</Eyebrow>
              <h3 className="mt-2 font-serif-ed text-xl font-bold text-ed-ink">
                Entire Municipality of Alcala
              </h3>
              <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                Population trends (1990–2024), 49,479 residents, 45.71 km² area, and all 21 barangay rankings.
              </p>
            </Card>

            <Card to="/contact#barangay-hotlines" className="bg-ed-paper-2">
              <Eyebrow tone="red">Directory &amp; Hotlines</Eyebrow>
              <h3 className="mt-2 font-serif-ed text-xl font-bold text-ed-ink">
                Barangay Hotlines &amp; Directory
              </h3>
              <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                All 21 barangay contact numbers, PSGC codes, and municipal department offices.
              </p>
            </Card>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
