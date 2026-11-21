import { useEffect, useMemo, useState } from 'react';

interface GaaProject {
  famKey: string;
  name: string;
  department: string;
  fy2024Php: number;
  fy2025Php: number;
  fy2026Php: number;
}

interface HgabProject {
  id: string;
  dataset: string;
  title: string;
  program: string | null;
  statusLabel: string;
  nepPhp: number | null;
  housePhp: number | null;
  deltaPhp: number | null;
  nepPdfUrl: string | null;
  housePdfUrl: string | null;
  detailUrl: string | null;
}

interface NationalBudgetPayload {
  syncedAt: string;
  sourceApi: string;
  sourceDocs: string;
  notice: string;
  gaaProjects: GaaProject[];
  hgab2027Projects: HgabProject[];
}

type YearView = '2027' | '2026' | '2025' | '2024';

function formatPhp(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function NationalBudgetSection() {
  const [payload, setPayload] = useState<NationalBudgetPayload | null>(null);
  const [yearView, setYearView] = useState<YearView>('2027');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/data/national-budget-alcala.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: NationalBudgetPayload | null) => {
        if (active && data) setPayload(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    if (!payload) {
      return { fy24: 0, fy25: 0, fy26: 0, fy27Nep: 0, fy27House: 0 };
    }
    return {
      fy24: payload.gaaProjects.reduce((s, p) => s + (p.fy2024Php || 0), 0),
      fy25: payload.gaaProjects.reduce((s, p) => s + (p.fy2025Php || 0), 0),
      fy26: payload.gaaProjects.reduce((s, p) => s + (p.fy2026Php || 0), 0),
      fy27Nep: payload.hgab2027Projects.reduce((s, p) => s + (p.nepPhp || 0), 0),
      fy27House: payload.hgab2027Projects.reduce((s, p) => s + (p.housePhp || 0), 0),
    };
  }, [payload]);

  const gaaByYear = useMemo(() => {
    if (!payload || yearView === '2027') return [];
    const q = searchQuery.trim().toLowerCase();
    const key =
      yearView === '2024' ? 'fy2024Php' : yearView === '2025' ? 'fy2025Php' : 'fy2026Php';
    return payload.gaaProjects
      .filter((p) => p[key] > 0)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q))
      .sort((a, b) => b[key] - a[key]);
  }, [payload, yearView, searchQuery]);

  const filteredHgab = useMemo(() => {
    if (!payload || yearView !== '2027') return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return payload.hgab2027Projects;
    return payload.hgab2027Projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.program || '').toLowerCase().includes(q)
    );
  }, [payload, yearView, searchQuery]);

  if (!payload) return null;

  const yearTabs: Array<{ id: YearView; label: string; count: number }> = [
    { id: '2027', label: 'FY 2027 (NEP / House)', count: payload.hgab2027Projects.length },
    {
      id: '2026',
      label: 'FY 2026 GAA',
      count: payload.gaaProjects.filter((p) => p.fy2026Php > 0).length,
    },
    {
      id: '2025',
      label: 'FY 2025 GAA',
      count: payload.gaaProjects.filter((p) => p.fy2025Php > 0).length,
    },
    {
      id: '2024',
      label: 'FY 2024 GAA',
      count: payload.gaaProjects.filter((p) => p.fy2024Php > 0).length,
    },
  ];

  return (
    <section id="national-gaa" className="section bg-alt">
      <div className="container">
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 font-mono-data text-xs font-bold uppercase tracking-wider text-[#2E8B57] bg-[#2E8B57]/10 border border-[#2E8B57]/25 px-3 py-1 rounded-full">
            <i className="bi bi-database-check" aria-hidden="true" />
            <span>BetterGov Philippine Budget Data API (FY 2024–2027)</span>
          </span>
          <h2 className="mt-3 mb-1 text-2xl font-bold text-[#0f2342]">
            National GAA &amp; FY 2027 Appropriations for Alcala, Pangasinan
          </h2>
          <p className="text-sm text-slate-600 m-0">
            Exact-peso national allocations from enacted GAA (FY 2024–2026) and FY 2027 NEP / House
            Bill (HGAB) documents—filtered exclusively for projects located in Alcala, Pangasinan.
          </p>
        </div>

        {/* Multi-Year Alcala-Exclusive Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              FY 2024 GAA
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#1976A8] tabular-nums mt-1">
              {formatPhp(totals.fy24)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Enacted Alcala total</div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              FY 2025 GAA
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#26489A] tabular-nums mt-1">
              {formatPhp(totals.fy25)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Enacted Alcala total</div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              FY 2026 GAA
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#2E8B57] tabular-nums mt-1">
              {formatPhp(totals.fy26)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Enacted Alcala total</div>
          </div>

          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              FY 2027 House Bill
            </div>
            <div className="text-lg sm:text-2xl font-extrabold text-[#D1432A] tabular-nums mt-1">
              {formatPhp(totals.fy27House)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              NEP: {formatPhp(totals.fy27Nep)}
            </div>
          </div>
        </div>

        {/* Fiscal Year Switcher + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1">
            {yearTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setYearView(tab.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  yearView === tab.id
                    ? 'bg-[#0f2342] text-white border border-[#0f2342]'
                    : 'bg-white text-[#0f2342] border border-black/15 hover:border-[#26489A]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter barangay or project..."
            aria-label="Filter national budget projects"
            className="w-full md:w-64 rounded-full border border-black/15 bg-white px-4 py-1.5 text-sm focus:border-[#26489A] focus:outline-none"
          />
        </div>

        {/* FY 2027 Projects List */}
        {yearView === '2027' && (
          <div className="space-y-3 mb-6">
            {filteredHgab.map((proj) => (
              <article
                key={proj.id}
                className="bg-white border border-black/10 rounded-xl p-4 sm:p-5 shadow-xs"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono-data text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#26489A]/10 text-[#26489A]">
                        {proj.dataset === 'fmr' ? 'DA Farm-to-Market Road' : 'DPWH'}
                      </span>
                      <span className="font-mono-data text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {proj.statusLabel}
                      </span>
                    </div>
                    <h4 className="m-0 text-sm sm:text-base font-bold text-[#0f2342]">
                      {proj.title}
                    </h4>
                    {proj.program && (
                      <p className="m-0 mt-1 text-xs text-slate-500">{proj.program}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-black/5">
                    <div>
                      <div className="text-[11px] text-slate-500">FY27 NEP</div>
                      <div className="text-sm font-bold text-[#0f2342] tabular-nums">
                        {formatPhp(proj.nepPhp)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">FY27 House Bill</div>
                      <div className="text-sm font-bold text-[#2E8B57] tabular-nums">
                        {formatPhp(proj.housePhp)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {proj.housePdfUrl && (
                        <a
                          href={proj.housePdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-2.5 py-1.5 text-xs font-semibold text-[#26489A] hover:border-[#26489A] no-underline"
                        >
                          <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                          <span>PDF</span>
                        </a>
                      )}
                      {proj.detailUrl && (
                        <a
                          href={proj.detailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0f2342] text-white px-2.5 py-1.5 text-xs font-semibold no-underline"
                        >
                          <span>Source</span>
                          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* FY 2024 / 2025 / 2026 GAA Projects List */}
        {yearView !== '2027' && (
          <div className="space-y-3 mb-6">
            {gaaByYear.length > 0 ? (
              gaaByYear.map((g) => {
                const amt =
                  yearView === '2024'
                    ? g.fy2024Php
                    : yearView === '2025'
                      ? g.fy2025Php
                      : g.fy2026Php;
                return (
                  <article
                    key={g.famKey}
                    className="bg-white border border-black/10 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="inline-block font-mono-data text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-[#2E8B57]/12 text-[#2E8B57] mb-1.5">
                        FY {yearView} Enacted GAA
                      </span>
                      <h4 className="m-0 text-sm sm:text-base font-bold text-[#0f2342]">
                        {g.name}
                      </h4>
                      <p className="m-0 mt-1 text-xs text-slate-500">{g.department}</p>
                    </div>
                    <div className="text-base sm:text-lg font-extrabold text-[#26489A] tabular-nums whitespace-nowrap">
                      {formatPhp(amt)}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="bg-white border border-black/10 rounded-xl p-6 text-center text-sm text-slate-600">
                No matching Alcala, Pangasinan GAA records found for FY {yearView}.
              </div>
            )}
          </div>
        )}

        {/* Provenance Notice */}
        <div className="rounded-xl border border-black/10 bg-white/80 p-4 text-xs text-slate-600">
          <strong>Methodology &amp; Source Notice:</strong> {payload.notice}{' '}
          <a
            href={payload.sourceDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#26489A]"
          >
            API Documentation →
          </a>
        </div>
      </div>
    </section>
  );
}
