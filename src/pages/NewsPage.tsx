import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import Notice from '../components/v2/ui/Notice';
import Flag from '../components/v2/ui/Flag';
import Button from '../components/v2/ui/Button';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { NEWS_ITEMS } from '../data/communityData';
import { isValidCitation, useCivicDataset } from '../hooks/useCivicDataset';
import { NewsItem } from '../types/civic';
import { cn } from '../lib/utils';

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
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.details.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [newsItems, categoryFilter, query]);

  return (
    <Layout breadcrumbs={[{ label: t('news-title') }]}>
      <PageMasthead title={t('news-title')} lede={t('news-desc')} />

      <section className="py-12 max-md:py-8">
        <Container>
          <Notice tag="Source Transparency" title="Official notices vs. civic summaries" className="mb-8">
            <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
              BetterAlcala separates <strong>Official Government Source</strong> notices from{' '}
              <strong>Independently Compiled Civic Summaries</strong>. For real-time LGU posts, visit the{' '}
              <a
                href={MUNICIPAL_PROFILE.officialFacebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-navy underline underline-offset-2 hover:text-ed-red"
              >
                Official LGU Alcala Facebook Page ↗
              </a>
              .
            </p>
          </Notice>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4 border-b border-ed-rule pb-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ed-ink-3"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search announcements, advisories, deadlines..."
                  aria-label="Search announcements and updates"
                  className="h-11 w-full border border-ed-ink bg-white pl-10 pr-4 font-sans-ed text-[15px] text-ed-ink outline-none placeholder:text-ed-ink-4 focus:border-ed-navy"
                />
              </div>
              {query && (
                <Button type="button" variant="ghost" onClick={() => setQuery('')}>
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'cursor-pointer border px-3 py-1.5 font-mono-ed text-[11px] uppercase tracking-[0.1em] transition-colors',
                    categoryFilter === cat
                      ? 'border-ed-navy bg-ed-navy text-white'
                      : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                  )}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-ed-rule border-y border-ed-rule">
            {filtered.map((item) => (
              <article key={item.id} className="py-8">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Flag variant="navy">{item.category}</Flag>
                    <span className="font-mono-ed text-[11px] tracking-[0.12em] text-ed-ink-3 tabular-nums">
                      {item.date}
                    </span>
                    <span className="font-mono-ed text-[11px] tracking-[0.12em] text-ed-ink-3">
                      · {item.originType}
                    </span>
                  </div>
                  <VerificationBadge status={item.citation.verificationStatus} />
                </div>

                <h2 className="font-serif-ed text-2xl font-bold leading-snug text-ed-ink">
                  {item.title}
                </h2>
                <p className="mt-3 font-sans-ed text-[17px] leading-relaxed text-ed-ink">
                  {item.summary}
                </p>
                <p className="mt-2 font-sans-ed text-[15px] leading-relaxed text-ed-ink-2">
                  {item.details}
                </p>
                <SourceCitationBox citation={item.citation} compact />
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="font-serif-ed text-xl text-ed-ink-2">No updates matched your filter.</p>
                <div className="mt-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setCategoryFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
