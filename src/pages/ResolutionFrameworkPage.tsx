import { useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { RESOLUTIONS_DATA } from '../data/transparencyData';
import { isValidCitation, useCivicDataset } from '../hooks/useCivicDataset';
import { ResolutionRecord } from '../types/civic';

function isValidResolution(item: unknown): item is ResolutionRecord {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.resolutionNo === 'string' &&
    typeof r.title === 'string' &&
    typeof r.issuingBody === 'string' &&
    isValidCitation(r.citation)
  );
}

export default function ResolutionFrameworkPage() {
  const resolutions = useCivicDataset(
    'resolutions.json',
    'resolutions',
    RESOLUTIONS_DATA,
    isValidResolution
  );
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resolutions;
    return resolutions.filter(
      (r) =>
        r.resolutionNo.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.issuingBody.toLowerCase().includes(q)
    );
  }, [resolutions, query]);

  return (
    <Layout
      breadcrumbs={[
        { label: 'Legislative', to: '/legislative' },
        { label: 'Resolution Framework' },
      ]}
    >
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-file-earmark-ruled-fill" aria-hidden="true" />{' '}
              <span>Legislative</span>
            </span>
            <h1>Resolution Framework</h1>
            <p className="page-header-desc">
              Provincial review resolutions on Alcala budgets and Sangguniang Bayan resolution
              tracking
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="mb-6 max-w-xl">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resolutions by number or topic..."
              aria-label="Search resolutions"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-xl p-8 text-center">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No resolutions match "{query}".
              </p>
              <p className="text-xs text-slate-600 mb-4">
                Try clearing the search query to view all tracked resolutions.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setQuery('')}
              >
                Show All Resolutions
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((res) => (
                <article
                  key={res.resolutionNo}
                  className="bg-white border border-black/10 rounded-xl p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-[#0032a0] tabular-nums">
                      {res.resolutionNo} · {res.approvalDate}
                    </span>
                    <VerificationBadge status={res.citation.verificationStatus} />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">{res.title}</h2>
                  <p className="text-sm text-slate-600 mb-3">{res.summary}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-3 border-t border-black/5">
                    <span>
                      <strong>Issuing Body:</strong> {res.issuingBody}
                    </span>
                    {res.documentUrl && (
                      <a
                        href={res.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#0032a0]"
                      >
                        View Source Portal <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
