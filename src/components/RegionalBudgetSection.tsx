import { useEffect, useMemo, useState } from 'react';
import {
  DatasetKey,
  fetchRegionalBudget,
  PSGC_MUNICIPALITIES,
  PSGC_PROVINCES,
  RegionalBudgetResult,
} from '../lib/regionalBudgetApi';

type SubView = '2027' | 'gaa';

function formatPhp(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount === 0) return '—';
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatCompactPhp(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`;
  return `₱${amount.toLocaleString('en-PH')}`;
}

const DATASET_LABELS: Record<DatasetKey, string> = {
  dpwh: 'DPWH',
  fmr: 'FMR (DA)',
  hfep: 'HFEP (DOH)',
  nia: 'NIA',
};

function formatProvinceRegion(regionCode: string): string {
  if (regionCode === 'Bangsamoro Autonomous Region in Muslim Mindanao') return 'BARMM';
  if (regionCode === 'Cordillera Administrative Region') return 'CAR';
  return regionCode;
}

function formatStatusLabel(label: string): string {
  const lower = label.trim().toLowerCase();
  if (lower === 'possible match, unconfirmed') return 'Possible Match';
  if (lower === 'same amount in both') return 'Unchanged';
  return label;
}

export default function RegionalBudgetSection() {
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('015500000');
  const [selectedMuniPsgc, setSelectedMuniPsgc] = useState<string>('0105504000');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [data, setData] = useState<RegionalBudgetResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [subView, setSubView] = useState<SubView>('2027');
  const [searchQuery, setSearchQuery] = useState('');
  const [datasetFilter, setDatasetFilter] = useState<'all' | DatasetKey>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gaaYear, setGaaYear] = useState<string>('2026');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const provinceMunicipalities = useMemo(
    () => PSGC_MUNICIPALITIES.filter((m) => m.provinceCode === selectedProvinceCode),
    [selectedProvinceCode]
  );

  const filteredProvinces = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return PSGC_PROVINCES;
    return PSGC_PROVINCES.filter(
      (p) =>
        p.code === selectedProvinceCode ||
        p.name.toLowerCase().includes(q) ||
        p.regionCode.toLowerCase().includes(q)
    );
  }, [locationQuery, selectedProvinceCode]);

  const filteredMunicipalities = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (!q) return provinceMunicipalities;
    return provinceMunicipalities.filter(
      (m) => m.psgc === selectedMuniPsgc || m.name.toLowerCase().includes(q)
    );
  }, [locationQuery, provinceMunicipalities, selectedMuniPsgc]);

  const locationQuickMatches = useMemo(() => {
    const q = locationQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const provHits = PSGC_PROVINCES.filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map((p) => ({
        key: `prov-${p.code}`,
        label: p.name === 'Metro Manila (NCR)' ? p.name : `Province of ${p.name}`,
        sub: p.regionCode,
        provinceCode: p.code,
        muniPsgc: 'all',
      }));
    const muniHits = PSGC_MUNICIPALITIES.filter(
      (m) => m.name.toLowerCase().includes(q) || `${m.name}, ${m.provinceName}`.toLowerCase().includes(q)
    )
      .slice(0, 5)
      .map((m) => ({
        key: `muni-${m.psgc}`,
        label: `${m.name}, ${m.provinceName}`,
        sub: m.isCity ? 'City' : 'Municipality',
        provinceCode: m.provinceCode,
        muniPsgc: m.psgc,
      }));
    return [...provHits, ...muniHits].slice(0, 6);
  }, [locationQuery]);

  const selectedProvince = useMemo(
    () => PSGC_PROVINCES.find((p) => p.code === selectedProvinceCode),
    [selectedProvinceCode]
  );

  const selectedKey = selectedMuniPsgc === 'all' ? `prov:${selectedProvinceCode}` : selectedMuniPsgc;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchRegionalBudget(selectedKey)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to reach BetterGov Budget API.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedKey]);

  const kpis = useMemo(() => {
    if (!data) return { nep: 0, house: 0, delta: 0, count: 0 };
    const nep = data.projects.reduce((sum, p) => sum + (p.nepPhp || 0), 0);
    const house = data.projects.reduce((sum, p) => sum + (p.housePhp || 0), 0);
    return { nep, house, delta: house - nep, count: data.projects.length };
  }, [data]);

  const statusOptions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.projects.map((p) => p.statusLabel))).sort();
  }, [data]);

  const filteredProjects = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();
    return data.projects
      .filter((p) => datasetFilter === 'all' || p.dataset === datasetFilter)
      .filter((p) => statusFilter === 'all' || p.statusLabel === statusFilter)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          (p.office && p.office.toLowerCase().includes(q)) ||
          (p.program && p.program.toLowerCase().includes(q))
      )
      .sort((a, b) => (b.housePhp || b.nepPhp || 0) - (a.housePhp || a.nepPhp || 0));
  }, [data, datasetFilter, statusFilter, searchQuery]);

  const filteredGaa = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();
    return data.gaaRecords
      .filter((g) => (g.years[gaaYear] || 0) > 0)
      .filter((g) => !q || g.name.toLowerCase().includes(q) || g.department.toLowerCase().includes(q))
      .sort((a, b) => (b.years[gaaYear] || 0) - (a.years[gaaYear] || 0));
  }, [data, gaaYear, searchQuery]);

  const gaaYearTotal = useMemo(
    () => filteredGaa.reduce((s, r) => s + (r.years[gaaYear] || 0), 0),
    [filteredGaa, gaaYear]
  );

  const exportCsv = () => {
    if (!data) return;
    const rows =
      subView === '2027'
        ? [
            ['Dataset', 'Title', 'Office', 'Status', 'FY2027 NEP (PHP)', 'FY2027 House Bill (PHP)', 'Delta (PHP)', 'Detail URL'],
            ...filteredProjects.map((p) => [
              DATASET_LABELS[p.dataset],
              p.title,
              p.office || '',
              p.statusLabel,
              String(p.nepPhp ?? ''),
              String(p.housePhp ?? ''),
              String(p.deltaPhp ?? ''),
              p.detailUrl
                ? p.detailUrl.startsWith('http')
                  ? p.detailUrl
                  : `https://budget.bettergov.ph${p.detailUrl}`
                : '',
            ]),
          ]
        : [
            ['Department', 'Program / Project', `FY ${gaaYear} Enacted (PHP)`],
            ...filteredGaa.map((g) => [g.department, g.name, String(g.years[gaaYear] || 0)]),
          ];

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `betteralcala-regional-${subView}-${selectedKey.replace(/[^a-z0-9]/gi, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="regional-budget" className="section bg-alt">
      <div className="container !px-1.5 sm:!px-4">
        <div className="rounded-xl sm:rounded-2xl overflow-clip border border-black/10 bg-white shadow-xs">
          {/* BetterAlcala Soft-Sage Editorial Header */}
          <div className="bg-[#EAF2EE] border-b border-black/10 p-4 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-5">
              <div>
                <h2 className="m-0 text-2xl sm:text-3xl font-bold text-[#0f2342] font-serif">
                  {data ? data.scopeLabel : 'Regional & LGU Budget Tracker'}
                </h2>
                <p className="m-0 mt-1.5 text-sm text-slate-600 max-w-2xl">
                  Compare FY 2027 NEP vs. House Bill allocations and enacted 2020–2026 GAA budgets
                  for Pangasinan, Region I, or any province, city, and municipality nationwide.
                </p>
              </div>

              {/* Scope Selector: Province + City/Municipality */}
              <div className="flex flex-col gap-2.5 shrink-0">
                <div className="relative">
                  <input
                    type="search"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Search province, city, or municipality..."
                    aria-label="Search province, city, or municipality"
                    className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs sm:text-sm text-[#0f2342] focus:border-[#26489A] focus:outline-none"
                  />
                  {locationQuickMatches.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {locationQuickMatches.map((hit) => (
                        <button
                          key={hit.key}
                          type="button"
                          onClick={() => {
                            setSelectedProvinceCode(hit.provinceCode);
                            setSelectedMuniPsgc(hit.muniPsgc);
                            setLocationQuery('');
                          }}
                          className="inline-flex items-center gap-1 rounded-full bg-white border border-[#26489A]/25 hover:border-[#26489A] px-2.5 py-1 text-[11px] font-semibold text-[#0f2342] cursor-pointer transition-colors"
                        >
                          <span>{hit.label}</span>
                          <span className="text-[10px] text-slate-500">· {hit.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    aria-label="Filter by Province"
                    value={selectedProvinceCode}
                    onChange={(e) => {
                      setSelectedProvinceCode(e.target.value);
                      setSelectedMuniPsgc('all');
                    }}
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#0f2342] focus:border-[#26489A] focus:outline-none min-w-[200px]"
                  >
                    {filteredProvinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name === 'Metro Manila (NCR)'
                          ? p.name
                          : `${p.name} (${formatProvinceRegion(p.regionCode)})`}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by Municipality or City"
                    value={selectedMuniPsgc}
                    onChange={(e) => setSelectedMuniPsgc(e.target.value)}
                    className="rounded-lg border border-black/15 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#0f2342] focus:border-[#26489A] focus:outline-none min-w-[210px]"
                  >
                    <option value="all">
                      All of {selectedProvince?.name || 'Province'}
                    </option>
                    {filteredMunicipalities.map((m) => (
                      <option key={m.psgc} value={m.psgc}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 sm:p-8">
            {loading && (
              <div className="py-12 text-center text-sm text-slate-600">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#26489A] border-t-transparent mb-2" />
                <p className="m-0">Fetching live allocations from BetterGov Budget API...</p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-[#D1432A]/30 bg-red-50 p-4 text-sm text-[#D1432A]">
                <strong>Unable to load regional budget data:</strong> {error}
              </div>
            )}

            {!loading && !error && data && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-xl bg-[#FAF7F2] border border-black/10 p-4">
                    <div className="font-mono-data text-[11px] font-bold uppercase text-[#26489A]">
                      FY 2027 NEP
                    </div>
                    <div className="text-2xl font-extrabold text-[#0f2342] font-mono-data tabular-nums mt-1">
                      {formatCompactPhp(kpis.nep)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Executive budget proposal
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#FAF7F2] border border-black/10 p-4">
                    <div className="font-mono-data text-[11px] font-bold uppercase text-[#2E8B57]">
                      FY 2027 House Bill
                    </div>
                    <div className="text-2xl font-extrabold text-[#2E8B57] font-mono-data tabular-nums mt-1">
                      {formatCompactPhp(kpis.house)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      House version (compared, not added)
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#FAF7F2] border border-black/10 p-4">
                    <div className="font-mono-data text-[11px] font-bold uppercase text-[#D1432A]">
                      Net Delta (House − NEP)
                    </div>
                    <div className="text-2xl font-extrabold text-[#D1432A] font-mono-data tabular-nums mt-1">
                      {kpis.delta >= 0 ? '+' : '−'}
                      {formatCompactPhp(Math.abs(kpis.delta))}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Candidate difference across versions
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#FAF7F2] border border-black/10 p-4">
                    <div className="font-mono-data text-[11px] font-bold uppercase text-[#1976A8]">
                      Matched Lines
                    </div>
                    <div className="text-2xl font-extrabold text-[#1976A8] font-mono-data tabular-nums mt-1">
                      {kpis.count.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {data.gaaRecords.length.toLocaleString()} GAA programs (2020–2026)
                    </div>
                  </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
                  <div className="sticky top-[104px] sm:top-[112px] z-20 md:static bg-white/95 backdrop-blur-sm py-2 md:py-0 flex flex-nowrap overflow-x-auto items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSubView('2027')}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        subView === '2027'
                          ? 'bg-[#0f2342] text-white border border-[#0f2342]'
                          : 'bg-[#FAF7F2] text-[#0f2342] border border-black/10 hover:border-[#26489A]'
                      }`}
                    >
                      FY 2027 NEP vs. House ({data.projects.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubView('gaa')}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                        subView === 'gaa'
                          ? 'bg-[#0f2342] text-white border border-[#0f2342]'
                          : 'bg-[#FAF7F2] text-[#0f2342] border border-black/10 hover:border-[#26489A]'
                      }`}
                    >
                      Enacted GAA 2020–2026 ({data.gaaRecords.length})
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter projects or offices..."
                      aria-label="Filter regional budget projects"
                      className="w-full sm:w-auto sm:min-w-[230px] rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs sm:text-sm focus:border-[#26489A] focus:outline-none"
                    />

                    {subView === '2027' ? (
                      <>
                        <select
                          aria-label="Filter by program"
                          value={datasetFilter}
                          onChange={(e) => setDatasetFilter(e.target.value as 'all' | DatasetKey)}
                          className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0f2342]"
                        >
                          <option value="all">All Programs</option>
                          <option value="dpwh">DPWH</option>
                          <option value="fmr">FMR (DA)</option>
                          <option value="hfep">HFEP (DOH)</option>
                          <option value="nia">NIA</option>
                        </select>
                        <select
                          aria-label="Filter by status"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0f2342]"
                        >
                          <option value="all">All Statuses</option>
                          {statusOptions.map((st) => (
                            <option key={st} value={st}>
                              {formatStatusLabel(st)}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <select
                        aria-label="Select GAA Fiscal Year"
                        value={gaaYear}
                        onChange={(e) => setGaaYear(e.target.value)}
                        className="rounded-lg border border-black/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0f2342]"
                      >
                        {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
                          <option key={yr} value={yr}>
                            FY {yr} GAA
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={exportCsv}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f2342]/20 bg-[#FAF7F2] hover:border-[#0f2342] px-3 py-1.5 text-xs font-semibold text-[#0f2342] cursor-pointer"
                    >
                      <i className="bi bi-download" aria-hidden="true" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {data.truncatedProjects && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                    Showing the first 200 rows per query. Use the search box or switch to a
                    specific city/municipality to narrow results.
                  </p>
                )}

                {/* 2027 Projects: Mobile Accordion + Desktop Table */}
                {subView === '2027' && (
                  <div className="rounded-xl border border-black/10 overflow-hidden">
                    {/* Mobile Accordion */}
                    <div className="md:hidden divide-y divide-black/10">
                      {filteredProjects.slice(0, 100).map((p) => {
                        const rowKey = `${p.dataset}-${p.id}`;
                        const isOpen = expandedKey === rowKey;
                        const isChangedOrInserted = p.nepPhp !== p.housePhp;
                        return (
                          <div key={rowKey} className="bg-white">
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              onClick={() => setExpandedKey(isOpen ? null : rowKey)}
                              className="w-full text-left p-2.5 sm:p-3.5 flex items-start justify-between gap-2.5 cursor-pointer bg-transparent border-0"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="font-mono-data text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#26489A]/10 text-[#26489A]">
                                    {DATASET_LABELS[p.dataset]}
                                  </span>
                                  <span
                                    className={`text-[11px] font-medium ${
                                      isChangedOrInserted ? 'text-[#D1432A] font-semibold' : 'text-slate-500'
                                    }`}
                                  >
                                    {formatStatusLabel(p.statusLabel)}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-[#0f2342] leading-snug">
                                  {p.title}
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <div
                                  className={`font-mono-data text-xs font-bold tabular-nums ${
                                    isChangedOrInserted ? 'text-[#D1432A]' : 'text-[#0f2342]'
                                  }`}
                                >
                                  {formatPhp(p.housePhp ?? p.nepPhp)}
                                </div>
                                <i
                                  className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} text-xs text-slate-400`}
                                  aria-hidden="true"
                                />
                              </div>
                            </button>

                            {isOpen && (
                              <div className="px-2.5 pb-3 pt-2 bg-[#FAF7F2] border-t border-black/5 text-xs space-y-2">
                                {p.office && (
                                  <div className="flex justify-between gap-2">
                                    <span className="text-slate-500">Office</span>
                                    <span className="font-medium text-[#0f2342] text-right">
                                      {p.office}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500">FY 2027 NEP</span>
                                  <span className="font-mono-data tabular-nums text-[#0f2342]">
                                    {formatPhp(p.nepPhp)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-2">
                                  <span className="text-slate-500">House Bill</span>
                                  <span
                                    className={`font-mono-data tabular-nums font-bold ${
                                      isChangedOrInserted ? 'text-[#D1432A]' : 'text-[#0f2342]'
                                    }`}
                                  >
                                    {formatPhp(p.housePhp)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 pt-1 font-semibold">
                                  {p.nepPdfUrl && (
                                    <a
                                      href={p.nepPdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#26489A] hover:underline"
                                    >
                                      NEP PDF{' '}
                                      <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                                    </a>
                                  )}
                                  {p.housePdfUrl && (
                                    <a
                                      href={p.housePdfUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#2E8B57] hover:underline"
                                    >
                                      House PDF{' '}
                                      <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                                    </a>
                                  )}
                                  {p.detailUrl && (
                                    <a
                                      href={
                                        p.detailUrl.startsWith('http')
                                          ? p.detailUrl
                                          : `https://budget.bettergov.ph${p.detailUrl}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-slate-700 hover:underline"
                                    >
                                      Details{' '}
                                      <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {filteredProjects.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No FY 2027 projects match the current filter.
                        </div>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-black/10 text-[#0f2342]">
                          <th className="py-3 px-3.5 font-bold">Program &amp; Project</th>
                          <th className="py-3 px-3.5 font-bold whitespace-nowrap">Status</th>
                          <th className="py-3 px-3.5 font-bold text-right whitespace-nowrap">
                            FY 2027 NEP
                          </th>
                          <th className="py-3 px-3.5 font-bold text-right whitespace-nowrap">
                            House Bill
                          </th>
                          <th className="py-3 px-3.5 font-bold whitespace-nowrap">Sources</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredProjects.slice(0, 100).map((p) => (
                          <tr key={`${p.dataset}-${p.id}`} className="hover:bg-[#FAF7F2]/60">
                            <td className="py-3 px-3.5">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="font-mono-data text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#26489A]/10 text-[#26489A]">
                                  {DATASET_LABELS[p.dataset]}
                                </span>
                                {p.office && (
                                  <span className="text-[11px] text-slate-500">{p.office}</span>
                                )}
                              </div>
                              <div className="font-medium text-[#0f2342] leading-snug">
                                {p.title}
                              </div>
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                                {formatStatusLabel(p.statusLabel)}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono-data tabular-nums whitespace-nowrap text-slate-700">
                              {formatPhp(p.nepPhp)}
                            </td>
                            <td
                              className={`py-3 px-3.5 text-right font-mono-data tabular-nums font-bold whitespace-nowrap ${
                                p.nepPhp !== p.housePhp ? 'text-[#D1432A]' : 'text-[#0f2342]'
                              }`}
                            >
                              {formatPhp(p.housePhp)}
                            </td>
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-[11px] font-semibold">
                                {p.nepPdfUrl && (
                                  <a
                                    href={p.nepPdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#26489A] hover:underline"
                                  >
                                    NEP
                                  </a>
                                )}
                                {p.housePdfUrl && (
                                  <a
                                    href={p.housePdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#2E8B57] hover:underline"
                                  >
                                    House
                                  </a>
                                )}
                                {p.detailUrl && (
                                  <a
                                    href={
                                      p.detailUrl.startsWith('http')
                                        ? p.detailUrl
                                        : `https://budget.bettergov.ph${p.detailUrl}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-600 hover:underline"
                                  >
                                    Details
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProjects.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                              No FY 2027 projects match the current filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      </table>
                    </div>
                    {filteredProjects.length > 100 && (
                      <div className="bg-[#FAF7F2] px-4 py-2.5 text-xs text-slate-600 border-t border-black/10">
                        Showing top 100 of {filteredProjects.length} projects — filter by keyword or
                        export CSV to inspect all rows.
                      </div>
                    )}
                  </div>
                )}

                {/* GAA 2020-2026: Mobile Stacked Cards + Desktop Table */}
                {subView === 'gaa' && (
                  <div className="rounded-xl border border-black/10 overflow-hidden">
                    <div className="bg-[#FAF7F2] px-4 py-2.5 border-b border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#0f2342]">
                        FY {gaaYear} Enacted GAA Programs ({filteredGaa.length})
                      </span>
                      <span className="font-mono-data font-bold text-[#26489A] tabular-nums">
                        Total: {formatPhp(gaaYearTotal)}
                      </span>
                    </div>

                    {/* Mobile Stacked List */}
                    <div className="md:hidden divide-y divide-black/10">
                      {filteredGaa.slice(0, 100).map((g) => (
                        <div key={g.famKey} className="p-2.5 sm:p-3.5 bg-white">
                          <div className="text-[11px] font-semibold text-[#2E8B57] mb-0.5">
                            {g.department}
                          </div>
                          <div className="text-xs font-medium text-[#0f2342] leading-snug mb-1.5">
                            {g.name}
                          </div>
                          <div className="font-mono-data tabular-nums text-xs font-bold text-[#0f2342]">
                            {formatPhp(g.years[gaaYear])}
                          </div>
                        </div>
                      ))}
                      {filteredGaa.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-500">
                          No enacted GAA records found for FY {gaaYear} with the current filter.
                        </div>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-white border-b border-black/10 text-[#0f2342]">
                          <th className="py-3 px-3.5 font-bold">Department &amp; Program</th>
                          <th className="py-3 px-3.5 font-bold text-right whitespace-nowrap">
                            FY {gaaYear} Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {filteredGaa.slice(0, 100).map((g) => (
                          <tr key={g.famKey} className="hover:bg-[#FAF7F2]/60">
                            <td className="py-3 px-3.5">
                              <div className="text-[11px] font-semibold text-[#2E8B57] mb-0.5">
                                {g.department}
                              </div>
                              <div className="font-medium text-[#0f2342] leading-snug">{g.name}</div>
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono-data tabular-nums font-bold text-[#0f2342] whitespace-nowrap">
                              {formatPhp(g.years[gaaYear])}
                            </td>
                          </tr>
                        ))}
                        {filteredGaa.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-slate-500">
                              No enacted GAA records found for FY {gaaYear} with the current filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Official API Notice */}
                <div className="mt-5 rounded-xl bg-[#FAF7F2] border border-black/10 px-4 py-3 text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span>{data.notice}</span>
                  <a
                    href="https://budget.bettergov.ph/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#26489A] hover:underline whitespace-nowrap"
                  >
                    BetterGov Budget API Docs{' '}
                    <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
