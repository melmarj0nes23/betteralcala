import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { NEWS_ITEMS } from '../data/communityData';
import { isValidCitation, useCivicDataset } from '../hooks/useCivicDataset';
import { NewsItem } from '../types/civic';

function isValidNewsItem(item: unknown): item is NewsItem {
  if (!item || typeof item !== 'object') return false;
  const n = item as Record<string, unknown>;
  return (
    typeof n.id === 'string' &&
    typeof n.title === 'string' &&
    typeof n.date === 'string' &&
    typeof n.summary === 'string' &&
    isValidCitation(n.citation)
  );
}

export default function NewsPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const newsItems = useCivicDataset('news.json', 'news', NEWS_ITEMS, isValidNewsItem);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [originFilter, setOriginFilter] = useState<
    'all' | 'Official Government Source' | 'Independently Compiled Civic Summary'
  >('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) setQuery(qParam);
  }, [searchParams]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(newsItems.map((n) => n.category)))],
    [newsItems]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return newsItems.filter((item) => {
      if (originFilter !== 'all' && item.originType !== originFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [newsItems, originFilter, categoryFilter, query]);

  return (
    <Layout breadcrumbs={[{ label: t('news-title') }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-megaphone-fill" aria-hidden="true" />{' '}
              <span>{t('news-badge')}</span>
            </span>
            <h1>{t('news-title')}</h1>
            <p className="page-header-desc">{t('news-desc')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="civic-notice-banner mb-6">
            <i className="bi bi-info-circle-fill" aria-hidden="true" />
            <div>
              <strong>Source Transparency:</strong> BetterAlcala clearly separates{' '}
              <strong>Official Government Source</strong> notices (derived directly from enacted
              ordinances, provincial resolutions, and agency bulletins) from{' '}
              <strong>Independently Compiled Civic Summaries</strong>. For real-time LGU posts,
              visit the{' '}
              <a
                href={MUNICIPAL_PROFILE.officialFacebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official LGU Alcala Facebook Page{' '}
                <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
              </a>
              .
            </div>
          </div>

          <div className="bg-slate-50 border border-black/10 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search announcements, advisories, deadlines..."
                aria-label="Search announcements and updates"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="btn btn-outline btn-sm whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mobile-filter-select-wrap">
              <label htmlFor="news-category-select" className="mobile-filter-select-label">
                Category
              </label>
              <select
                id="news-category-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="mobile-filter-select"
                aria-label="Filter updates by category"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-tab-bar mb-0">
              {(['all', 'Official Government Source', 'Independently Compiled Civic Summary'] as const).map(
                (org) => (
                  <button
                    key={org}
                    type="button"
                    onClick={() => setOriginFilter(org)}
                    className={`filter-tab-btn ${originFilter === org ? 'active' : ''}`}
                  >
                    {org === 'all' ? 'All Sources' : org}
                  </button>
                )
              )}
            </div>
            <div className="filter-tab-bar filter-tab-bar--collapsible mb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`filter-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-black/10 rounded-xl p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs text-slate-600">
                  <div className="flex flex-wrap items-center gap-2 font-semibold">
                    <span className="text-[#0032a0]">{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{item.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.originType}</span>
                  </div>
                  <VerificationBadge status={item.citation.verificationStatus} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h2>
                <p className="text-sm font-medium text-slate-800 mb-2">{item.summary}</p>
                <p className="text-sm text-slate-600 mb-0">{item.details}</p>
                <SourceCitationBox citation={item.citation} compact />
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-black/5">
                <p className="text-slate-600 mb-3">No updates matched your filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setOriginFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
