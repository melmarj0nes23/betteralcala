import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import BarangayProjectTracker from '../components/BarangayProjectTracker';
import NationalBudgetSection from '../components/NationalBudgetSection';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import { BUDGET_RECORDS, INFRASTRUCTURE_PROJECTS } from '../data/transparencyData';
import { isValidCitation, useCivicDataset } from '../hooks/useCivicDataset';
import { BudgetYearRecord, InfrastructureProject } from '../types/civic';

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isValidBudgetYear(item: unknown): item is BudgetYearRecord {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.fiscalYear === 'number' &&
    typeof r.approvedBudget === 'number' &&
    r.approvedBudget > 0 &&
    typeof r.appropriationOrdinance === 'string' &&
    typeof r.spResolution === 'string' &&
    isValidCitation(r.citation)
  );
}

function isValidInfraProject(item: unknown): item is InfrastructureProject {
  if (!item || typeof item !== 'object') return false;
  const p = item as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.barangay === 'string' &&
    typeof p.category === 'string' &&
    isValidCitation(p.citation)
  );
}

type BudgetTab = 'summary' | 'tracker' | 'municipal' | 'documents' | 'dpwh' | 'national';

export default function BudgetPage() {
  const [searchParams] = useSearchParams();
  const { hash } = useLocation();
  const [activeTab, setActiveTab] = useState<BudgetTab>(() => {
    if (hash === '#barangay-tracker') return 'tracker';
    if (hash === '#dpwh-projects' || searchParams.get('project')) return 'dpwh';
    if (hash === '#national-gaa') return 'national';
    return 'summary';
  });
  const budgetRecords = useCivicDataset(
    'fiscal_transparency.json',
    'fiscal_years',
    BUDGET_RECORDS,
    isValidBudgetYear
  );
  const infrastructureProjects = useCivicDataset(
    'dpwh-projects.json',
    'projects',
    INFRASTRUCTURE_PROJECTS,
    isValidInfraProject
  );

  const [selectedYear, setSelectedYear] = useState<number>(() => BUDGET_RECORDS[0]?.fiscalYear || 2026);
  const [hasManuallySelectedYear, setHasManuallySelectedYear] = useState(false);
  const [projectSearch, setProjectSearch] = useState(() => searchParams.get('project') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const paramProj = searchParams.get('project');
    if (paramProj !== null) {
      setProjectSearch(paramProj);
      setActiveTab('dpwh');
    }
  }, [searchParams]);

  useEffect(() => {
    if (hash === '#barangay-tracker') setActiveTab('tracker');
    else if (hash === '#dpwh-projects') setActiveTab('dpwh');
    else if (hash === '#national-gaa') setActiveTab('national');
  }, [hash]);

  useEffect(() => {
    if (!hasManuallySelectedYear && budgetRecords.length > 0) {
      const latestYear = Math.max(...budgetRecords.map((b) => b.fiscalYear));
      setSelectedYear(latestYear);
    }
  }, [budgetRecords, hasManuallySelectedYear]);

  const sortedBudgets = useMemo(
    () => [...budgetRecords].sort((a, b) => b.fiscalYear - a.fiscalYear),
    [budgetRecords]
  );

  const activeBudget =
    sortedBudgets.find((b) => b.fiscalYear === selectedYear) || sortedBudgets[0];

  const budgetYearsSummary = useMemo(() => {
    const asc = [...budgetRecords].sort((a, b) => a.fiscalYear - b.fiscalYear);
    const label =
      asc.length > 1
        ? `FY ${asc[0].fiscalYear} – FY ${asc[asc.length - 1].fiscalYear} Totals`
        : `FY ${asc[0]?.fiscalYear ?? 2026} Total`;
    const totals = asc
      .map((b) => `₱${(b.approvedBudget / 1_000_000).toFixed(2)}M`)
      .join(' / ');
    return { label, totals };
  }, [budgetRecords]);

  const projectCategories = useMemo(() => {
    return ['all', ...Array.from(new Set(infrastructureProjects.map((p) => p.category)))];
  }, [infrastructureProjects]);

  const filteredProjects = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return infrastructureProjects.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.barangay.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q)
      );
    });
  }, [infrastructureProjects, projectSearch, selectedCategory]);

  const totalVerifiedContractValue = useMemo(() => {
    return infrastructureProjects.reduce(
      (sum, p) => sum + (p.contractCost ?? p.abcAmount ?? 0),
      0
    );
  }, [infrastructureProjects]);

  const ascendingBudgets = useMemo(
    () => [...budgetRecords].sort((a, b) => a.fiscalYear - b.fiscalYear),
    [budgetRecords]
  );

  const maxAnnualBudget = useMemo(
    () => Math.max(...budgetRecords.map((b) => b.approvedBudget), 1),
    [budgetRecords]
  );

  const categoryTotals = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const p of infrastructureProjects) {
      const prev = map.get(p.category) || { count: 0, total: 0 };
      map.set(p.category, {
        count: prev.count + 1,
        total: prev.total + (p.contractCost ?? p.abcAmount ?? 0),
      });
    }
    return Array.from(map.entries()).map(([category, stats]) => ({ category, ...stats }));
  }, [infrastructureProjects]);

  return (
    <Layout breadcrumbs={[{ label: 'Transparency & Budget' }]}>
      <section className="trans-hero-v2">
        <div className="container">
          <div className="trans-hero-content-v2">
            <span className="trans-hero-badge-v2">
              <i className="bi bi-shield-check" aria-hidden="true" />{' '}
              <span>Fiscal &amp; Project Transparency</span>
            </span>
            <h1>Budget &amp; Financial Transparency</h1>
            <p>
              Approved municipal appropriations, execution status, COA/BLGF reporting, and DPWH
              infrastructure projects in Alcala
            </p>
          </div>
        </div>
      </section>

      {/* Budget Section Navigation */}
      <section className="bg-white border-b border-black/10">
        <div className="container">
          <div
            className="flex flex-nowrap overflow-x-auto gap-2 py-3"
            role="tablist"
            aria-label="Transparency & Budget Sections"
          >
            {[
              { id: 'summary' as const, label: 'Overview Summary', icon: 'bi-grid-1x2-fill' },
              { id: 'tracker' as const, label: 'Barangay Tracker', icon: 'bi-geo-alt-fill' },
              { id: 'municipal' as const, label: 'Municipal Budget', icon: 'bi-graph-up-arrow' },
              { id: 'documents' as const, label: 'Document Registry', icon: 'bi-folder-check' },
              {
                id: 'dpwh' as const,
                label: `DPWH Projects (${infrastructureProjects.length})`,
                icon: 'bi-cone-striped',
              },
              { id: 'national' as const, label: 'National GAA / FY27', icon: 'bi-database-check' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#0f2342] text-white border border-[#0f2342]'
                    : 'bg-[#FAF7F2] text-[#0f2342] border border-black/10 hover:border-[#26489A]'
                }`}
              >
                <i className={`bi ${tab.icon}`} aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Summary View (Default for effortless mobile/desktop scanning) */}
      {activeTab === 'summary' && (
        <section className="section">
          <div className="container">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0f2342] m-0">
                Transparency &amp; Budget Summary
              </h2>
              <p className="text-sm text-slate-600 m-0 mt-1">
                Select a section below to inspect detailed figures, documents, or project records.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                className="md:col-span-2 text-left bg-[#EAF2EE] border border-[#2E8B57]/25 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#2E8B57] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#2E8B57] text-white">
                      <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                    </span>
                    <span className="font-mono-data text-xs font-bold uppercase tracking-wider text-[#2E8B57]">
                      Community-Wide · All 21 Barangays
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0f2342] mb-1">
                    Barangay-Level Project Tracker (2024–2027)
                  </h3>
                  <p className="text-xs text-slate-600 m-0">
                    Filter every funded road, FMR, flood control, and multi-purpose building across
                    all 21 Alcala barangays from GAA (2024–2026), FY 2027 NEP/HGAB, and DPWH
                    records.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f2342] text-white text-xs font-bold px-4 py-2 whitespace-nowrap self-start sm:self-center">
                  <span>Open Tracker</span>
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('municipal')}
                className="text-left bg-white border border-black/10 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#26489A]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#26489A]/10 text-[#26489A]">
                      <i className="bi bi-graph-up-arrow" aria-hidden="true" />
                    </span>
                    <span className="font-mono-data text-xs font-bold text-[#26489A] bg-[#26489A]/10 px-2.5 py-1 rounded-full">
                      FY {activeBudget.fiscalYear}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f2342] mb-1">
                    Municipal Annual Budget &amp; SRE
                  </h3>
                  <div className="text-2xl font-extrabold text-[#26489A] tabular-nums mb-1">
                    {formatPeso(activeBudget.approvedBudget)}
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    Approved appropriations, multi-year comparison (FY 2024–2026), and execution
                    status.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#26489A]">
                  Explore Municipal Budget →
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('national')}
                className="text-left bg-white border border-black/10 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#2E8B57]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#2E8B57]/12 text-[#2E8B57]">
                      <i className="bi bi-database-check" aria-hidden="true" />
                    </span>
                    <span className="font-mono-data text-xs font-bold text-[#2E8B57] bg-[#2E8B57]/12 px-2.5 py-1 rounded-full">
                      Alcala-Exclusive
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f2342] mb-1">
                    National GAA &amp; FY 2027 Appropriations
                  </h3>
                  <div className="text-2xl font-extrabold text-[#2E8B57] tabular-nums mb-1">
                    FY 2024–2027 Records
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    29 enacted GAA (2024–2026) &amp; 14 FY 2027 NEP/HGAB projects exclusive to
                    Alcala, Pangasinan.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#2E8B57]">
                  Explore National Appropriations →
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dpwh')}
                className="text-left bg-white border border-black/10 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#D1432A]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#D1432A]/10 text-[#D1432A]">
                      <i className="bi bi-cone-striped" aria-hidden="true" />
                    </span>
                    <span className="font-mono-data text-xs font-bold text-[#D1432A] bg-[#D1432A]/10 px-2.5 py-1 rounded-full">
                      {infrastructureProjects.length} Records
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f2342] mb-1">
                    DPWH Infrastructure Registry
                  </h3>
                  <div className="text-2xl font-extrabold text-[#D1432A] tabular-nums mb-1">
                    {infrastructureProjects.length} Documented Projects
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    Searchable public works projects across Alcala barangays by category and
                    status.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#D1432A]">
                  Browse DPWH Projects →
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className="text-left bg-white border border-black/10 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-[#1976A8]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#1976A8]/12 text-[#1976A8]">
                      <i className="bi bi-folder-check" aria-hidden="true" />
                    </span>
                    <span className="font-mono-data text-xs font-bold text-[#1976A8] bg-[#1976A8]/12 px-2.5 py-1 rounded-full">
                      FDP / COA / BLGF
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0f2342] mb-1">
                    Financial &amp; Procurement Document Registry
                  </h3>
                  <div className="text-2xl font-extrabold text-[#1976A8] tabular-nums mb-1">
                    4 Core Disclosures
                  </div>
                  <p className="text-xs text-slate-600 m-0">
                    Availability status for Annual Budgets, BLGF SRE, COA Audits, and PhilGEPS
                    records.
                  </p>
                </div>
                <span className="mt-4 text-xs font-bold text-[#1976A8]">
                  View Document Registry →
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Annual Budget & SRE Distinction */}
      {activeTab === 'municipal' && (
      <section className="sre-section-v2">
        <div className="container">
          <div className="sre-header-v2">
            <div className="sre-title-group">
              <span className="sre-label">
                <i className="bi bi-graph-up-arrow" aria-hidden="true" />{' '}
                <span>Annual Municipal Budget &amp; SRE</span>
              </span>
              <h2>Approved Appropriations vs. Execution Records</h2>
              <p>
                Approved budgets are verified via Sangguniang Panlalawigan resolutions; unreleased
                execution breakdowns are awaiting official LGU release.
              </p>
            </div>

            <div className="sre-period-toggle" role="tablist" aria-label="Select fiscal year">
              {sortedBudgets.map((b) => (
                <button
                  key={b.fiscalYear}
                  type="button"
                  role="tab"
                  aria-selected={selectedYear === b.fiscalYear}
                  onClick={() => {
                    setHasManuallySelectedYear(true);
                    setSelectedYear(b.fiscalYear);
                  }}
                  className={`sre-period-btn ${selectedYear === b.fiscalYear ? 'active' : ''}`}
                >
                  <span className="sre-period-q">FY {b.fiscalYear}</span>
                  <span className="sre-period-range">Operative Budget</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sre-metrics-row">
            <div className="sre-metric-card sre-metric-income">
              <div className="sre-metric-icon">
                <i className="bi bi-check2-circle" aria-hidden="true" />
              </div>
              <div className="sre-metric-data">
                <span className="sre-metric-value tabular-nums">
                  {formatPeso(activeBudget.approvedBudget)}
                </span>
                <span className="sre-metric-label">Approved Annual Budget (FY {activeBudget.fiscalYear})</span>
              </div>
            </div>

            <div className="sre-metric-card sre-metric-expense">
              <div className="sre-metric-icon">
                <i className="bi bi-clipboard-data" aria-hidden="true" />
              </div>
              <div className="sre-metric-data">
                <span className="sre-metric-value">Pending Release</span>
                <span className="sre-metric-label">Obligations (Allotments Committed)</span>
                <div className="mt-1">
                  <VerificationBadge status={activeBudget.sreStatus} />
                </div>
              </div>
            </div>

            <div className="sre-metric-card sre-metric-net">
              <div className="sre-metric-icon">
                <i className="bi bi-cash-stack" aria-hidden="true" />
              </div>
              <div className="sre-metric-data">
                <span className="sre-metric-value">Pending Release</span>
                <span className="sre-metric-label">Disbursements (Cash Paid)</span>
                <div className="mt-1">
                  <VerificationBadge status={activeBudget.sreStatus} />
                </div>
              </div>
            </div>

            <div className="sre-metric-card sre-metric-balance">
              <div className="sre-metric-icon">
                <i className="bi bi-receipt" aria-hidden="true" />
              </div>
              <div className="sre-metric-data">
                <span className="sre-metric-value">Pending Release</span>
                <span className="sre-metric-label">Actual Expenditures (BLGF eSRE)</span>
                <div className="mt-1">
                  <VerificationBadge status={activeBudget.sreStatus} />
                </div>
              </div>
            </div>
          </div>

          {ascendingBudgets.length > 1 && (
            <div className="bg-white border border-black/10 rounded-xl p-5 mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#0032a0] m-0">
                    Multi-Year Approved Appropriations Comparison
                  </h3>
                  <p className="text-xs text-slate-600 m-0">
                    Click a fiscal year bar to inspect its Sangguniang Panlalawigan operative record
                  </p>
                </div>
                <span className="text-xs font-mono-data text-slate-500">
                  {budgetYearsSummary.label}
                </span>
              </div>
              <div className="space-y-3">
                {ascendingBudgets.map((b, idx) => {
                  const prev = idx > 0 ? ascendingBudgets[idx - 1] : null;
                  const pctDiff = prev
                    ? (((b.approvedBudget - prev.approvedBudget) / prev.approvedBudget) * 100).toFixed(
                        1
                      )
                    : null;
                  const barPct = Math.round((b.approvedBudget / maxAnnualBudget) * 100);
                  const isActive = b.fiscalYear === activeBudget.fiscalYear;
                  return (
                    <button
                      key={b.fiscalYear}
                      type="button"
                      onClick={() => {
                        setHasManuallySelectedYear(true);
                        setSelectedYear(b.fiscalYear);
                      }}
                      className={`w-full text-left rounded-lg border p-3 transition cursor-pointer ${
                        isActive
                          ? 'border-[#0032a0] bg-blue-50/40'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1.5">
                        <span className="font-bold text-slate-900 font-mono-data">
                          FY {b.fiscalYear}
                        </span>
                        <span className="font-mono-data font-bold text-[#0032a0]">
                          {formatPeso(b.approvedBudget)}
                          {pctDiff && (
                            <span className="ml-2 text-emerald-700 font-semibold">
                              (+{pctDiff}% YoY)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isActive ? 'bg-[#0032a0]' : 'bg-slate-400'
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-2 mt-6" style={{ gap: 'var(--spacing-md)' }}>
            <div className="bg-white border border-black/10 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#0032a0] mb-3">
                FY {activeBudget.fiscalYear} Enactment &amp; Provincial Review
              </h3>
              <dl className="space-y-2 text-sm text-slate-700">
                <div>
                  <dt className="font-semibold text-slate-900">Municipal Enactment</dt>
                  <dd>{activeBudget.appropriationOrdinance}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">Sangguniang Panlalawigan Action</dt>
                  <dd>{activeBudget.spResolution}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-slate-900">National Tax Allotment (NTA) &amp; 20% DF</dt>
                  <dd>{activeBudget.ntaShareNote}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-black/10 rounded-xl p-5">
              <h3 className="text-base font-bold text-[#0032a0] mb-3">
                Understanding Budget Terms &amp; Public Records
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li>
                  <strong>Approved Budget:</strong> Maximum spending authority enacted by the
                  Sangguniang Bayan and declared operative by the Sangguniang Panlalawigan.
                </li>
                <li>
                  <strong>Obligations:</strong> Binding commitments (contracts/purchase orders)
                  charged against approved appropriations.
                </li>
                <li>
                  <strong>Disbursements &amp; Actual Expenditures:</strong> Cash settled and final
                  audited expenses reported in the BLGF Statement of Receipts and Expenditures (SRE)
                  and Commission on Audit (COA) Annual Audit Reports.
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-black/10 flex flex-wrap gap-2">
                <a
                  href="https://blgf.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  BLGF eSRE Portal <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
                <a
                  href="https://www.coa.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  COA Region I Audit Reports <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
                <a
                  href="https://notices.philgeps.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  PhilGEPS Procurement <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <SourceCitationBox citation={activeBudget.citation} />
        </div>
      </section>
      )}

      {/* AIP / Financial Statements / Procurement Status Table */}
      {activeTab === 'documents' && (
      <section className="section bg-alt">
        <div className="container">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Municipal Financial &amp; Procurement Document Registry
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Status of core Full Disclosure Policy (FDP) documents for Alcala, Pangasinan
          </p>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Document Category</th>
                  <th scope="col">Issuing / Oversight Agency</th>
                  <th scope="col">Current Public Availability</th>
                  <th scope="col">Verification Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td data-label="Document Category">Annual Budgets ({budgetYearsSummary.label})</td>
                  <td data-label="Issuing / Oversight Agency">SB Alcala / SP Pangasinan</td>
                  <td data-label="Current Public Availability">
                    Operative totals verified ({budgetYearsSummary.totals})
                  </td>
                  <td data-label="Verification Status">
                    <span className="text-xs font-medium text-slate-600">Confirmed</span>
                  </td>
                </tr>
                <tr>
                  <td data-label="Document Category">Annual Investment Program (AIP)</td>
                  <td data-label="Issuing / Oversight Agency">MPDC / Municipal Budget Office</td>
                  <td data-label="Current Public Availability">
                    Full line-item schedule not yet published online
                  </td>
                  <td data-label="Verification Status">
                    <VerificationBadge status="Needs Review" />
                  </td>
                </tr>
                <tr>
                  <td data-label="Document Category">Statement of Receipts &amp; Expenditures (SRE)</td>
                  <td data-label="Issuing / Oversight Agency">
                    Bureau of Local Government Finance (BLGF)
                  </td>
                  <td data-label="Current Public Availability">
                    Routed via BLGF eSRE portal; municipal breakdown pending extraction
                  </td>
                  <td data-label="Verification Status">
                    <VerificationBadge status="Needs Review" />
                  </td>
                </tr>
                <tr>
                  <td data-label="Document Category">COA Annual Audit Reports (AAR)</td>
                  <td data-label="Issuing / Oversight Agency">
                    Commission on Audit (COA Region I)
                  </td>
                  <td data-label="Current Public Availability">
                    Archived on{' '}
                    <a href="https://www.coa.gov.ph/" target="_blank" rel="noopener noreferrer">
                      coa.gov.ph
                    </a>
                  </td>
                  <td data-label="Verification Status">
                    <span className="text-xs font-medium text-slate-600">Archived online</span>
                  </td>
                </tr>
                <tr>
                  <td data-label="Document Category">Municipal Procurement Notices &amp; Bids</td>
                  <td data-label="Issuing / Oversight Agency">BAC Alcala / PhilGEPS</td>
                  <td data-label="Current Public Availability">
                    Published via{' '}
                    <a
                      href="https://notices.philgeps.gov.ph/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PhilGEPS
                    </a>
                  </td>
                  <td data-label="Verification Status">
                    <VerificationBadge status="Needs Review" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* DPWH Infrastructure Projects in Alcala */}
      {activeTab === 'dpwh' && (
      <section id="dpwh-projects" className="infra-section-v5">
        <div className="container">
          <div className="mb-6">
            <span className="sre-label">
              <i className="bi bi-cone-striped" aria-hidden="true" />{' '}
              <span>DPWH Pangasinan 3rd District Engineering Office</span>
            </span>
            <h2 className="mt-2">Infrastructure Projects in Alcala, Pangasinan</h2>
            <p className="text-slate-600">
              {infrastructureProjects.length} documented DPWH public works projects across Alcala’s
              barangays (total documented ABC/awarded allocations shown:{' '}
              <strong className="tabular-nums">{formatPeso(totalVerifiedContractValue)}</strong>).
            </p>
          </div>

          {categoryTotals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {categoryTotals.map((item) => {
                const isSelected = selectedCategory === item.category;
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() =>
                      setSelectedCategory((prev) =>
                        prev === item.category ? 'all' : item.category
                      )
                    }
                    className={`text-left rounded-xl border p-4 transition cursor-pointer ${
                      isSelected
                        ? 'border-[#0032a0] bg-blue-50/60'
                        : 'border-black/10 bg-white hover:border-[#0032a0]/40'
                    }`}
                  >
                    <div className="text-xs font-semibold text-slate-500 truncate">
                      {item.category}
                    </div>
                    <div className="text-base font-bold text-[#0032a0] font-mono-data mt-1">
                      {item.total > 0 ? formatPeso(item.total) : 'Pending / N/A'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 font-mono-data">
                      {item.count} {item.count === 1 ? 'project' : 'projects'} ·{' '}
                      {isSelected ? 'Showing (click to clear)' : 'Click to filter'}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-slate-50 border border-black/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-3">
              <input
                type="search"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search Contract ID, barangay, or contractor..."
                aria-label="Search infrastructure projects"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
              />
              <span className="text-sm text-slate-600 self-center tabular-nums">
                {filteredProjects.length}{' '}
                {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
            <div className="mobile-filter-select-wrap">
              <label htmlFor="budget-project-category-select" className="mobile-filter-select-label">
                Project Type
              </label>
              <select
                id="budget-project-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mobile-filter-select"
                aria-label="Filter infrastructure projects by type"
              >
                {projectCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Project Types' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-tab-bar filter-tab-bar--collapsible mb-0">
              {projectCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`filter-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'all' ? 'All Project Types' : cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-xl p-8 text-center">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No infrastructure projects match your filter.
              </p>
              <p className="text-xs text-slate-600 mb-4">
                Try clearing the search query or selecting All Project Types.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setProjectSearch('');
                  setSelectedCategory('all');
                }}
              >
                Show All Projects
              </button>
            </div>
          ) : (
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              {filteredProjects.map((proj) => (
                <article
                  key={proj.id}
                  className="bg-white border border-black/10 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-[#0032a0] tabular-nums">
                        Contract ID: {proj.id} · {proj.projectDate}
                      </span>
                      <VerificationBadge status={proj.citation.verificationStatus} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">{proj.name}</h3>
                    <div className="text-xs text-slate-600 space-y-1 mb-3">
                      <div>
                        <strong>Location / Barangay:</strong> {proj.location}
                      </div>
                      <div>
                        <strong>Category:</strong> {proj.category}
                      </div>
                      <div>
                        <strong>Implementing Agency:</strong> {proj.implementingAgency}
                      </div>
                      <div>
                        <strong>Funding Source:</strong> {proj.fundingSource}
                      </div>
                      <div>
                        <strong>Contractor:</strong> {proj.contractor}
                      </div>
                      {proj.abcAmount && (
                        <div className="tabular-nums">
                          <strong>Approved Budget (ABC):</strong> {formatPeso(proj.abcAmount)}
                        </div>
                      )}
                      {proj.contractCost && (
                        <div className="tabular-nums">
                          <strong>Awarded Contract Cost:</strong> {formatPeso(proj.contractCost)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-black/5 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-emerald-700">{proj.statusLabel}</span>
                    <a
                      href={proj.citation.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#0032a0]"
                    >
                      DPWH Source <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {activeTab === 'tracker' && (
        <BarangayProjectTracker dpwhProjects={infrastructureProjects} />
      )}

      {activeTab === 'national' && <NationalBudgetSection />}
    </Layout>
  );
}
