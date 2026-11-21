import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BarangayEmblem, { slugifyBarangay } from '../components/BarangayEmblem';
import { AlcalaWovenStrip } from '../components/AlcalaWovenStrip';
import { VerificationBadge } from '../components/VerificationBadge';
import { BARANGAYS_DATA, MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { INFRASTRUCTURE_PROJECTS } from '../data/transparencyData';

type BarangayTab = 'overview' | 'projects' | 'all';

export default function StatisticsPage() {
  const { barangay: barangaySlug } = useParams<{ barangay?: string }>();
  const [searchParams] = useSearchParams();
  const showOverview = searchParams.get('view') === 'overview';
  const [activeTab, setActiveTab] = useState<BarangayTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedBarangays = useMemo(() => {
    return [...BARANGAYS_DATA].sort((a, b) => b.population2020 - a.population2020);
  }, []);

  const alphabeticalBarangays = useMemo(() => {
    return [...BARANGAYS_DATA].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const total2020Pop = useMemo(() => {
    return BARANGAYS_DATA.reduce((sum, b) => sum + b.population2020, 0) || 48908;
  }, []);

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

  const selectedBarangayIndex = useMemo(() => {
    if (!selectedBarangay) return 0;
    return alphabeticalBarangays.findIndex((b) => b.psgcCode === selectedBarangay.psgcCode);
  }, [selectedBarangay, alphabeticalBarangays]);

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
        {/* Soft Tinted Barangay Header */}
        <section className="bg-[#EAF2EE] border-b border-black/10 py-7">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <BarangayEmblem index={selectedBarangayIndex} size={58} />
                <div>
                  <span className="inline-block font-mono-data text-[11px] font-bold uppercase tracking-widest text-[#2E8B57]">
                    Barangay · PSGC {selectedBarangay.psgcCode}
                  </span>
                  <h1 className="m-0 text-2xl sm:text-3xl font-extrabold text-[#0f2342]">
                    {selectedBarangay.name}
                  </h1>
                  <p className="m-0 mt-1 text-sm text-slate-600">
                    Alcala, Pangasinan · {selectedBarangay.classification || 'Rural'} Barangay
                    {selectedBarangay.phones && selectedBarangay.phones.length > 0 && (
                      <> · Hotline: {selectedBarangay.phones[0]}</>
                    )}
                  </p>
                </div>
              </div>

              <Link
                to="/statistics"
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-white border border-black/15 px-4 py-2 text-xs font-semibold text-[#0f2342] hover:border-[#26489A] no-underline shadow-xs"
              >
                <i className="bi bi-arrow-left" aria-hidden="true" />
                <span>All 21 Barangays</span>
              </Link>
            </div>
          </div>
        </section>

        <AlcalaWovenStrip />

        <section className="section">
          <div className="container">
            {/* 4 Color-Coded KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#26489A]/12 text-[#26489A]">
                    <i className="bi bi-people-fill" aria-hidden="true" />
                  </span>
                  <span>Population</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#0f2342] tabular-nums">
                  {selectedBarangay.population2020.toLocaleString()}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#26489A]"
                    style={{ width: `${vsMaxPct}%` }}
                  />
                </div>
                <p className="mt-2 mb-0 text-[11px] text-slate-500">
                  2020 PSA Census · Bar compares with largest barangay
                </p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2E8B57]/12 text-[#2E8B57]">
                    <i className="bi bi-pie-chart-fill" aria-hidden="true" />
                  </span>
                  <span>Share of Alcala</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#2E8B57] tabular-nums">
                  {sharePct}%
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2E8B57]"
                    style={{ width: `${Math.min(100, Number(sharePct) * 4)}%` }}
                  />
                </div>
                <p className="mt-2 mb-0 text-[11px] text-slate-500">
                  Of {total2020Pop.toLocaleString()} municipal residents (2020)
                </p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#D1432A]/12 text-[#D1432A]">
                    <i className="bi bi-trophy-fill" aria-hidden="true" />
                  </span>
                  <span>Population Rank</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#D1432A] tabular-nums">
                  #{selectedBarangayRank}{' '}
                  <span className="text-base font-semibold text-slate-500">of 21</span>
                </div>
                <p className="mt-3 mb-0 text-[11px] text-slate-500">
                  {selectedBarangay.classification} classification · PSGC {selectedBarangay.psgcCode}
                </p>
              </div>

              <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1976A8]/12 text-[#1976A8]">
                    <i className="bi bi-cone-striped" aria-hidden="true" />
                  </span>
                  <span>DPWH Projects</span>
                </div>
                <div className="mt-3 text-3xl font-extrabold text-[#1976A8] tabular-nums">
                  {matchingProjects.length}
                </div>
                <p className="mt-3 mb-0 text-[11px] text-slate-500">
                  Documented infrastructure records mentioning {selectedBarangay.name}
                </p>
              </div>
            </div>

            {/* Underline Sub-Tabs */}
            <div
              className="flex flex-nowrap overflow-x-auto gap-5 sm:gap-6 border-b border-black/10 mb-6"
              role="tablist"
            >
              {[
                { id: 'overview' as const, label: 'Overview' },
                {
                  id: 'projects' as const,
                  label: `Projects (${matchingProjects.length})`,
                },
                { id: 'all' as const, label: 'All Barangays (21)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap shrink-0 bg-transparent border-0 border-b-2 cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#D1432A] text-[#0f2342]'
                      : 'border-transparent text-slate-500 hover:text-[#0f2342]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-black/10 rounded-2xl p-6 shadow-xs">
                  <h2 className="text-base font-bold text-[#0f2342] mb-1">
                    Population Comparison
                  </h2>
                  <p className="text-xs text-slate-500 mb-5">
                    How Brgy. {selectedBarangay.name} compares with the municipal barangay average
                    and Alcala&apos;s largest barangay (2020 PSA Census)
                  </p>
                  <div className="space-y-4">
                    {comparisonList.map((row) => {
                      const pct = Math.round((row.value / maxBarangayPop) * 100);
                      return (
                        <div key={row.label}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span
                              className={
                                row.highlight ? 'font-bold text-[#0f2342]' : 'text-slate-600'
                              }
                            >
                              {row.label}
                            </span>
                            <span className="font-bold text-[#0f2342] tabular-nums">
                              {row.value.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.highlight ? 'bg-[#26489A]' : 'bg-slate-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0f2342] mb-3">
                      Barangay Details &amp; Contacts
                    </h2>
                    <dl className="space-y-2.5 text-sm">
                      <div>
                        <dt className="text-xs text-slate-500">PSGC Code</dt>
                        <dd className="font-mono-data font-semibold text-[#0f2342] m-0">
                          {selectedBarangay.psgcCode}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Classification</dt>
                        <dd className="font-semibold text-[#0f2342] m-0">
                          {selectedBarangay.classification}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-500">Barangay Contact Line(s)</dt>
                        <dd className="m-0">
                          {selectedBarangay.phones && selectedBarangay.phones.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedBarangay.phones.map((ph) => (
                                <a
                                  key={ph}
                                  href={`tel:${ph.replace(/[^0-9+]/g, '')}`}
                                  className="inline-flex items-center gap-1 rounded-full bg-[#2E8B57]/10 text-[#2E8B57] px-3 py-1 text-xs font-semibold no-underline"
                                >
                                  <i className="bi bi-telephone-fill" aria-hidden="true" />
                                  {ph}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">Not listed</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="mt-5 pt-4 border-t border-black/5 text-xs text-slate-500">
                    Source: {selectedBarangay.citation.sourceTitle}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-xs">
                {matchingProjects.length > 0 ? (
                  <div className="space-y-4">
                    {matchingProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="border border-black/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-mono-data text-xs font-bold text-[#1976A8]">
                            {proj.id} · {proj.category}
                          </span>
                          <h3 className="text-base font-bold text-[#0f2342] mt-1 mb-1">
                            {proj.name}
                          </h3>
                          <p className="text-xs text-slate-600 m-0">
                            {proj.contractor} · {proj.statusLabel}
                          </p>
                        </div>
                        <Link
                          to="/budget#dpwh-projects"
                          className="text-xs font-semibold text-[#26489A] whitespace-nowrap"
                        >
                          View in Budget Registry →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-600 mb-3">
                      No DPWH district contract records explicitly list Brgy.{' '}
                      {selectedBarangay.name} by name in the current registry.
                    </p>
                    <Link
                      to="/budget#dpwh-projects"
                      className="inline-flex items-center gap-2 rounded-full bg-[#0f2342] text-white text-xs font-semibold px-4 py-2 no-underline"
                    >
                      Browse All Alcala DPWH Projects →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {alphabeticalBarangays.map((b, idx) => (
                  <Link
                    key={b.psgcCode}
                    to={`/statistics/${slugifyBarangay(b.name)}`}
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2.5 sm:gap-3 rounded-xl border p-2.5 sm:p-3.5 bg-white no-underline transition-all hover:shadow-md ${
                      b.psgcCode === selectedBarangay.psgcCode
                        ? 'border-[#26489A] ring-2 ring-[#26489A]/20'
                        : 'border-black/10 hover:border-[#26489A]/40'
                    }`}
                  >
                    <BarangayEmblem index={idx} size={36} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-[#0f2342] truncate">
                        {b.name}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 tabular-nums truncate">
                        {b.population2020.toLocaleString()} · {b.classification}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ENTIRE MUNICIPALITY OVERVIEW (?view=overview)
  // ---------------------------------------------------------------------------
  if (showOverview) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Statistics', to: '/statistics' },
          { label: 'Entire Municipality' },
        ]}
      >
        <section className="stats-hero">
          <div className="container">
            <div className="stats-hero-content text-center">
              <span className="stats-hero-badge">
                <i className="bi bi-bar-chart-fill" aria-hidden="true" />{' '}
                <span>PSA &amp; PSGC Verified Data</span>
              </span>
              <h1>Alcala Municipal Statistics</h1>
              <p className="mx-auto max-w-2xl">
                Official demographic, geographic, and economic indicators for the Municipality of
                Alcala, Pangasinan (PSGC {MUNICIPAL_PROFILE.psgcCode})
              </p>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="stats-metrics">
          <div className="container">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-people-fill" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="metric-value tabular-nums">
                    {MUNICIPAL_PROFILE.population2024.toLocaleString()}
                  </span>
                  <span className="metric-label">Population (2024 POPCEN)</span>
                  <span className="metric-source">Up from 48,908 in 2020</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="metric-value tabular-nums">
                    {MUNICIPAL_PROFILE.barangayCount}
                  </span>
                  <span className="metric-label">Official Barangays</span>
                  <span className="metric-source">PSGC Verified Units</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-rulers" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="metric-value tabular-nums">
                    {MUNICIPAL_PROFILE.landAreaKm2} km²
                  </span>
                  <span className="metric-label">Total Land Area</span>
                  <span className="metric-source">~1,082 / km² density (2024)</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <i className="bi bi-award-fill" aria-hidden="true" />
                </div>
                <div className="metric-info">
                  <span className="metric-value">3rd Class</span>
                  <span className="metric-label">Income Classification</span>
                  <span className="metric-source">Pangasinan 5th District</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Historical Population Trends */}
        <section className="stats-section stats-trends">
          <div className="container">
            <div className="section-header-minimal">
              <span className="section-tag">
                <i className="bi bi-graph-up" aria-hidden="true" /> <span>PSA Census Series</span>
              </span>
              <h2>Population Trends (1990–2024)</h2>
              <p>
                Official census trajectory for the Municipality of Alcala across six Philippine
                Statistics Authority (PSA) enumeration cycles
              </p>
            </div>

            <div className="trends-summary">
              <div className="trend-stat">
                <span className="trend-stat-label">1990 Census Baseline</span>
                <span className="trend-stat-value tabular-nums">30,684</span>
                <span className="trend-stat-sub">First recorded series baseline</span>
              </div>
              <div className="trend-arrow" aria-hidden="true">
                <i className="bi bi-arrow-right" />
              </div>
              <div className="trend-stat trend-stat-current">
                <span className="trend-stat-label">2024 POPCEN Count</span>
                <span className="trend-stat-value tabular-nums">49,479</span>
                <span className="trend-stat-sub">+571 residents since 2020</span>
              </div>
              <div className="trend-stat trend-stat-growth">
                <span className="trend-stat-label">34-Year Growth</span>
                <span className="trend-stat-value tabular-nums">+{growthPct}%</span>
                <span className="trend-stat-sub">+18,795 net residents added</span>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 m-0">
                    PSA Census Population Trajectory
                  </h3>
                  <p className="text-xs text-slate-500 m-0">
                    Total residents recorded per census year (scale 0 – 60,000)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#26489A]" />
                    1990–2020 Census
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#D1432A]" />
                    2024 POPCEN
                  </span>
                </div>
              </div>

              <div className="relative pl-0 sm:pl-12">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[210px] sm:pl-12 flex flex-col justify-between"
                  aria-hidden="true"
                >
                  {[60000, 45000, 30000, 15000, 0].map((tick) => (
                    <div key={tick} className="relative flex items-center w-full">
                      <span className="hidden sm:inline-block absolute -left-12 w-10 text-right text-[11px] text-slate-400 tabular-nums">
                        {tick === 0 ? '0' : `${tick / 1000}k`}
                      </span>
                      <div
                        className={`w-full ${
                          tick === 0
                            ? 'border-b-2 border-slate-200'
                            : 'border-b border-dashed border-slate-200/80'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <div className="relative z-10 grid grid-cols-6 gap-1 sm:gap-5 h-[210px]">
                  {MUNICIPAL_PROFILE.historicalCensus.map((point) => {
                    const barHeightPct = Math.round((point.population / 60000) * 100);
                    const isCurrent = point.year === 2024;
                    return (
                      <div
                        key={point.year}
                        className="h-full min-w-0 flex flex-col justify-end items-center"
                      >
                        <span
                          className={`text-[9px] sm:text-xs font-bold mb-1 tabular-nums whitespace-nowrap ${
                            isCurrent ? 'text-[#D1432A]' : 'text-[#26489A]'
                          }`}
                        >
                          <span className="hidden sm:inline">
                            {point.population.toLocaleString()}
                          </span>
                          <span className="sm:hidden">
                            {(point.population / 1000).toFixed(1)}k
                          </span>
                        </span>
                        <div
                          className={`w-full max-w-[52px] rounded-t-md ${
                            isCurrent ? 'bg-[#D1432A]' : 'bg-[#26489A]'
                          }`}
                          style={{ height: `${barHeightPct}%` }}
                          aria-label={`${point.year}: ${point.population.toLocaleString()}`}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-6 gap-1 sm:gap-5 pt-2.5">
                  {MUNICIPAL_PROFILE.historicalCensus.map((point, idx) => {
                    const prev =
                      idx > 0 ? MUNICIPAL_PROFILE.historicalCensus[idx - 1].population : null;
                    const deltaPct = prev
                      ? (((point.population - prev) / prev) * 100).toFixed(1)
                      : null;
                    const isCurrent = point.year === 2024;
                    return (
                      <div key={point.year} className="text-center min-w-0">
                        <div
                          className={`text-[11px] sm:text-sm font-bold tabular-nums ${
                            isCurrent ? 'text-[#D1432A]' : 'text-slate-800'
                          }`}
                        >
                          {point.year}
                        </div>
                        <div className="text-[9px] sm:text-[11px] font-semibold text-emerald-700 tabular-nums mt-0.5">
                          {deltaPct ? `+${deltaPct}%` : 'Base'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Population by Barangay (All 21, clickable to drill down) */}
        <section className="stats-section stats-distribution bg-alt">
          <div className="container">
            <div className="section-header-minimal">
              <span className="section-tag">
                <i className="bi bi-pie-chart-fill" aria-hidden="true" />{' '}
                <span>All 21 PSGC Barangays</span>
              </span>
              <h2>Population by Barangay</h2>
              <p>Click any barangay below to inspect its detailed profile and metrics.</p>
            </div>

            <div className="bg-white border border-black/10 rounded-xl p-6">
              <div className="space-y-3">
                {rankedBarangays.map((b, idx) => {
                  const widthPct = Math.round((b.population2020 / maxBarangayPop) * 100);
                  return (
                    <Link
                      key={b.psgcCode}
                      to={`/statistics/${slugifyBarangay(b.name)}`}
                      className="grid grid-cols-12 items-center gap-3 text-sm py-1.5 px-2 rounded-lg border-b border-black/5 last:border-0 hover:bg-[#FAF7F2] no-underline transition-colors"
                    >
                      <span className="col-span-2 sm:col-span-1 font-bold text-[#26489A] tabular-nums">
                        #{idx + 1}
                      </span>
                      <div className="col-span-10 sm:col-span-4">
                        <span className="font-semibold text-[#0f2342]">{b.name}</span>
                        <span className="ml-2 text-xs text-slate-500 tabular-nums">
                          {b.psgcCode}
                        </span>
                      </div>
                      <div className="col-span-8 sm:col-span-5">
                        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#26489A]"
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                      <span className="col-span-4 sm:col-span-2 text-right font-semibold text-[#0f2342] tabular-nums">
                        {b.population2020.toLocaleString()}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Economic & Agricultural Profile */}
        <section className="stats-section stats-economy">
          <div className="container">
            <div className="section-header-minimal">
              <span className="section-tag">
                <i className="bi bi-briefcase-fill" aria-hidden="true" />{' '}
                <span>Economic &amp; Geographic Profile</span>
              </span>
              <h2>Economy, Agriculture &amp; Geography</h2>
            </div>

            <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
              <div className="bg-white border border-black/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-[#0f2342] mb-2">
                  Primary Agricultural Economy
                </h3>
                <p className="text-sm text-slate-700 mb-0">
                  Alcala’s economy is anchored in rice and corn production, supplemented by tobacco,
                  lowland vegetables, poultry, and livestock farming.
                </p>
              </div>

              <div className="bg-white border border-black/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-[#0f2342] mb-2">
                  Agro-Industrial &amp; Cooperatives
                </h3>
                <p className="text-sm text-slate-700 mb-0">
                  Facilities such as the Alcala Agro-Industrial Complex in Barangay Bersamin and
                  active farmers’ cooperatives support grain trading and post-harvest processing.
                </p>
              </div>

              <div className="bg-white border border-black/10 rounded-xl p-5">
                <h3 className="text-base font-bold text-[#0f2342] mb-2">
                  CMCI Competitiveness &amp; Poverty Stats
                </h3>
                <p className="text-sm text-slate-700 mb-2">
                  Detailed DTI Cities and Municipalities Competitiveness Index (CMCI) pillar scores
                  and PSA Small Area Poverty Estimates are awaiting official release.
                </p>
                <VerificationBadge status="Needs Review" />
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. DEFAULT BARANGAY SELECTOR HUB (/statistics)
  // ---------------------------------------------------------------------------
  return (
    <Layout breadcrumbs={[{ label: 'Statistics' }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-geo-alt-fill" aria-hidden="true" />{' '}
              <span>21 Barangays &amp; Municipal Data</span>
            </span>
            <h1>Explore Alcala by Barangay</h1>
            <p className="page-header-desc">
              Select any of Alcala’s 21 barangays to view its population, municipal share, PSGC
              profile, and infrastructure records—or open the entire municipal overview.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="m-0 text-xl font-bold text-[#0f2342]">Select a Barangay</h2>
              <p className="m-0 text-sm text-slate-600">
                21 official PSGC barangays in Alcala, Pangasinan
              </p>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter barangay name or PSGC..."
              aria-label="Filter barangays"
              className="w-full sm:w-72 rounded-full border border-black/15 bg-white px-4 py-2 text-sm focus:border-[#26489A] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-8">
            {filteredDirectory.map((b, idx) => (
              <Link
                key={b.psgcCode}
                to={`/statistics/${slugifyBarangay(b.name)}`}
                className="flex items-center gap-2.5 sm:gap-3.5 rounded-2xl border border-black/10 bg-white p-3 sm:p-4 shadow-xs hover:shadow-md hover:border-[#26489A]/40 transition-all no-underline"
              >
                <BarangayEmblem index={idx} size={38} />
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-base text-[#0f2342] truncate">
                    {b.name}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 tabular-nums truncate">
                    {b.classification} · {b.population2020.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Municipal Overview & Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/statistics?view=overview"
              className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-xs hover:shadow-md hover:border-[#26489A]/40 transition-all no-underline"
            >
              <BarangayEmblem index={0} size={52} />
              <div>
                <div className="font-bold text-base text-[#0f2342]">
                  Entire Municipality of Alcala
                </div>
                <p className="m-0 text-xs text-slate-600 mt-0.5">
                  Population trends (1990–2024), 49,479 residents, 45.71 km² area, and all 21
                  barangay rankings.
                </p>
              </div>
            </Link>

            <Link
              to="/government#barangays"
              className="flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-xs hover:shadow-md hover:border-[#2E8B57]/40 transition-all no-underline"
            >
              <BarangayEmblem index={2} size={52} />
              <div>
                <div className="font-bold text-base text-[#0f2342]">
                  Barangay Hotlines &amp; Directory
                </div>
                <p className="m-0 text-xs text-slate-600 mt-0.5">
                  All 21 barangay contact numbers, PSGC codes, and municipal department offices.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
