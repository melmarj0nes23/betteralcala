import { useMemo } from 'react';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { BARANGAYS_DATA, MUNICIPAL_PROFILE } from '../data/municipalInfo';

export default function StatisticsPage() {
  const rankedBarangays = useMemo(() => {
    return [...BARANGAYS_DATA].sort((a, b) => b.population2020 - a.population2020);
  }, []);

  const maxBarangayPop = rankedBarangays[0]?.population2020 || 1;
  const growthPct = (
    ((MUNICIPAL_PROFILE.population2024 - MUNICIPAL_PROFILE.historicalCensus[0].population) /
      MUNICIPAL_PROFILE.historicalCensus[0].population) *
    100
  ).toFixed(1);

  return (
    <Layout breadcrumbs={[{ label: 'Statistics' }]}>
      <section className="stats-hero">
        <div className="container">
          <div className="stats-hero-content">
            <span className="stats-hero-badge">
              <i className="bi bi-bar-chart-fill" aria-hidden="true" />{' '}
              <span>PSA &amp; PSGC Verified Data</span>
            </span>
            <h1>Alcala Municipal Statistics</h1>
            <p>
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
                <span className="metric-value tabular-nums">{MUNICIPAL_PROFILE.barangayCount}</span>
                <span className="metric-label">Official Barangays</span>
                <span className="metric-source">PSGC Verified Units</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">
                <i className="bi bi-rulers" aria-hidden="true" />
              </div>
              <div className="metric-info">
                <span className="metric-value tabular-nums">{MUNICIPAL_PROFILE.landAreaKm2} km²</span>
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

          {/* Executive Time-Series Bar Chart */}
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
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#0032a0]" />
                  1990–2020 Census
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f77f00]" />
                  2024 POPCEN
                </span>
              </div>
            </div>

            <div className="relative pl-0 sm:pl-12">
              {/* Y-Axis reference lines */}
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

              {/* 6 Census Columns on Single Baseline */}
              <div className="relative z-10 grid grid-cols-6 gap-1 sm:gap-5 h-[210px]">
                {MUNICIPAL_PROFILE.historicalCensus.map((point, idx) => {
                  const prev = idx > 0 ? MUNICIPAL_PROFILE.historicalCensus[idx - 1].population : null;
                  const deltaPct = prev ? (((point.population - prev) / prev) * 100).toFixed(1) : null;
                  const barHeightPct = Math.round((point.population / 60000) * 100);
                  const isCurrent = point.year === 2024;
                  return (
                    <div
                      key={point.year}
                      className="h-full min-w-0 flex flex-col justify-end items-center"
                      title={`${point.year}: ${point.population.toLocaleString()}${
                        deltaPct ? ` (+${deltaPct}%)` : ''
                      }`}
                    >
                      <span
                        className={`text-[9px] sm:text-xs font-bold mb-1 tabular-nums whitespace-nowrap ${
                          isCurrent ? 'text-[#c25900]' : 'text-[#0032a0]'
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
                          isCurrent ? 'bg-[#f77f00]' : 'bg-[#0032a0]'
                        }`}
                        style={{ height: `${barHeightPct}%` }}
                        aria-label={`${point.year}: ${point.population.toLocaleString()}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Year Labels & Inter-censal Growth */}
              <div className="grid grid-cols-6 gap-1 sm:gap-5 pt-2.5">
                {MUNICIPAL_PROFILE.historicalCensus.map((point, idx) => {
                  const prev = idx > 0 ? MUNICIPAL_PROFILE.historicalCensus[idx - 1].population : null;
                  const deltaPct = prev ? (((point.population - prev) / prev) * 100).toFixed(1) : null;
                  const isCurrent = point.year === 2024;
                  return (
                    <div key={point.year} className="text-center min-w-0">
                      <div
                        className={`text-[11px] sm:text-sm font-bold tabular-nums ${
                          isCurrent ? 'text-[#c25900]' : 'text-slate-800'
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

            {/* Inter-censal Change Breakdown Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-6 pt-5 border-t border-slate-100">
              {MUNICIPAL_PROFILE.historicalCensus.map((point, idx) => {
                const prev = idx > 0 ? MUNICIPAL_PROFILE.historicalCensus[idx - 1].population : null;
                const diff = prev ? point.population - prev : null;
                const deltaPct = prev ? (((point.population - prev) / prev) * 100).toFixed(1) : null;
                return (
                  <div
                    key={point.year}
                    className="rounded-lg bg-slate-50 border border-slate-200/70 px-3 py-2 text-center"
                  >
                    <div className="text-[11px] font-semibold text-slate-500 tabular-nums">
                      {point.year} Census
                    </div>
                    <div className="text-sm font-bold text-slate-900 tabular-nums">
                      {point.population.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-medium text-emerald-700 tabular-nums">
                      {diff !== null ? `+${diff.toLocaleString()} (+${deltaPct}%)` : 'Baseline'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Population by Barangay (All 21) */}
      <section className="stats-section stats-distribution bg-alt">
        <div className="container">
          <div className="section-header-minimal">
            <span className="section-tag">
              <i className="bi bi-pie-chart-fill" aria-hidden="true" />{' '}
              <span>All 21 PSGC Barangays</span>
            </span>
            <h2>Population by Barangay</h2>
            <p>
              2020 PSA Census baseline totaling 48,908 residents across 21 barangays (Vacante also
              reflects 2024 POPCEN 1,318; full 2024 barangay release marked Needs Review)
            </p>
          </div>

          <div className="bg-white border border-black/10 rounded-xl p-6">
            <div className="space-y-3">
              {rankedBarangays.map((b, idx) => {
                const widthPct = Math.round((b.population2020 / maxBarangayPop) * 100);
                return (
                  <div
                    key={b.psgcCode}
                    className="grid grid-cols-12 items-center gap-3 text-sm py-1 border-b border-black/5 last:border-0"
                  >
                    <span className="col-span-2 sm:col-span-1 font-bold text-[#0032a0] tabular-nums">
                      #{idx + 1}
                    </span>
                    <div className="col-span-10 sm:col-span-4">
                      <span className="font-semibold text-slate-900">{b.name}</span>
                      <span className="ml-2 text-xs text-slate-500 tabular-nums">{b.psgcCode}</span>
                    </div>
                    <div className="col-span-8 sm:col-span-5">
                      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0032a0]"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                    <span className="col-span-4 sm:col-span-2 text-right font-semibold text-slate-900 tabular-nums">
                      {b.population2020.toLocaleString()}
                    </span>
                  </div>
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
            <p>Verified economic profile from Provincial Government of Pangasinan &amp; DA Region I</p>
          </div>

          <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
            <div className="bg-white border border-black/10 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#0032a0] mb-2">
                Primary Agricultural Economy
              </h3>
              <p className="text-sm text-slate-700 mb-0">
                Alcala’s economy is anchored in rice and corn production, supplemented by tobacco,
                lowland vegetables, poultry, and livestock farming.
              </p>
            </div>

            <div className="bg-white border border-black/10 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#0032a0] mb-2">
                Agro-Industrial &amp; Cooperatives
              </h3>
              <p className="text-sm text-slate-700 mb-0">
                Facilities such as the Alcala Agro-Industrial Complex in Barangay Bersamin and active
                farmers’ cooperatives support grain trading, post-harvest processing, and KADIWA
                initiatives.
              </p>
            </div>

            <div className="bg-white border border-black/10 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#0032a0] mb-2">
                CMCI Competitiveness &amp; Poverty Stats
              </h3>
              <p className="text-sm text-slate-700 mb-2">
                Detailed DTI Cities and Municipalities Competitiveness Index (CMCI) pillar scores
                and PSA Small Area Poverty Estimates are pending direct extraction.
              </p>
              <VerificationBadge status="Needs Review" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
