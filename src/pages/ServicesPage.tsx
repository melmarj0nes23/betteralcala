import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PhoneIcon, SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import Notice from '../components/v2/ui/Notice';
import Eyebrow from '../components/v2/ui/Eyebrow';
import Button from '../components/v2/ui/Button';
import ArrowLink from '../components/v2/ui/ArrowLink';
import { VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { SERVICE_CATEGORIES, SERVICES_DATA } from '../data/servicesData';
import { cn } from '../lib/utils';

export default function ServicesPage() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string>(category || 'all');

  useEffect(() => {
    setActiveCategory(category || 'all');
  }, [category]);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) setQuery(qParam);
  }, [searchParams]);

  const activeCatObj = SERVICE_CATEGORIES.find((c) => c.id === activeCategory);

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);
    return SERVICES_DATA.filter((service) => {
      const matchesCategory = activeCategory === 'all' || service.categoryId === activeCategory;
      if (!matchesCategory) return false;
      if (tokens.length === 0) return true;
      const haystack = `${service.title} ${service.description} ${service.office} ${service.category} ${service.keywords.join(' ')}`.toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [query, activeCategory]);

  return (
    <Layout
      breadcrumbs={[
        { label: t('nav-services'), to: activeCategory !== 'all' ? '/services' : undefined },
        ...(activeCatObj ? [{ label: activeCatObj.shortTitle }] : []),
      ]}
    >
      <PageMasthead
        title={activeCatObj ? activeCatObj.title : t('services-title')}
        lede={activeCatObj ? activeCatObj.description : t('services-desc')}
      />

      <section className="py-12 max-md:py-8">
        <Container>
          <Notice tag="Verification Note" title="Statutory steps &amp; local fee verification" className="mb-8">
            <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
              Statutory steps follow Philippine law (RA 11032, RA 9994, RA 10754, RA 11861, RA 7160). Local fees awaiting published ordinances are marked <strong>Needs Review</strong> — call{' '}
              <a href="tel:+63756325938" className="text-ed-navy underline underline-offset-2 hover:text-ed-red">
                (075) 632-5938
              </a>{' '}
              to confirm.
            </p>
          </Notice>

          {/* Search & Category Filters */}
          <div className="mb-8 border-b border-ed-rule pb-6">
            <div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-4 max-md:grid-cols-1">
              <div className="relative">
                <SearchIcon
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ed-ink-3"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('services-search-placeholder')}
                  aria-label="Filter municipal services"
                  className="h-11 w-full border border-ed-ink bg-white pl-10 pr-4 font-sans-ed text-[15px] text-ed-ink outline-none placeholder:text-ed-ink-4 focus:border-ed-navy"
                />
              </div>
              <div className="font-mono-ed text-xs uppercase tracking-[0.1em] text-ed-ink-2 tabular-nums">
                Showing <strong className="text-sm text-ed-ink">{filteredServices.length}</strong> of {SERVICES_DATA.length} guides
              </div>
            </div>

            <div className="md:hidden">
              <label htmlFor="services-category-select" className="mb-1.5 block font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">
                Service Category
              </label>
              <select
                id="services-category-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="h-11 w-full border border-ed-ink bg-white px-3 font-sans-ed text-sm text-ed-ink"
              >
                <option value="all">
                  {t('services-all-categories')} ({SERVICES_DATA.length})
                </option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex" role="tablist" aria-label="Service categories">
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'cursor-pointer border px-3.5 py-2 font-mono-ed text-[11px] uppercase tracking-[0.1em] transition-colors',
                  activeCategory === 'all'
                    ? 'border-ed-navy bg-ed-navy text-white'
                    : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                )}
              >
                {t('services-all-categories')} ({SERVICES_DATA.length})
              </button>
              {SERVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'cursor-pointer border px-3.5 py-2 font-mono-ed text-[11px] uppercase tracking-[0.1em] transition-colors',
                    activeCategory === cat.id
                      ? 'border-ed-navy bg-ed-navy text-white'
                      : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                  )}
                >
                  {cat.shortTitle}
                </button>
              ))}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="border border-dashed border-ed-rule py-16 text-center">
              <p className="font-serif-ed text-xl text-ed-ink-2">No services matched &ldquo;{query}&rdquo;.</p>
              <div className="mt-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setQuery('');
                    setActiveCategory('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1 max-md:gap-4">
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="flex flex-col justify-between border border-ed-rule bg-white p-6 transition-colors hover:border-ed-ink"
                >
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <Eyebrow tone="navy">{service.category}</Eyebrow>
                      <VerificationBadge status={service.citation.verificationStatus} />
                    </div>
                    <h2 className="font-serif-ed text-xl font-semibold leading-snug text-ed-ink">
                      {service.title}
                    </h2>
                    <p className="mt-2 font-sans-ed text-[15px] leading-relaxed text-ed-ink-2 mobile-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-ed-rule pt-4 font-sans-ed text-[13px] text-ed-ink-2">
                    <div className="space-y-1">
                      <div>
                        <span className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Office: </span>
                        {service.office}
                      </div>
                      <div>
                        <span className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Fees: </span>
                        {service.fees}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      {service.officePhones[0] ? (
                        <a
                          href={`tel:${service.officePhones[0].replace(/[^+\d]/g, '')}`}
                          className="inline-flex items-center gap-1.5 font-mono-ed text-xs text-ed-ink-3 no-underline hover:text-ed-navy"
                        >
                          <PhoneIcon size={12} aria-hidden />
                          <span>{service.officePhones[0]}</span>
                        </a>
                      ) : (
                        <span />
                      )}
                      <ArrowLink to={`/service-details/${service.id}`}>
                        {t('services-view-guide')}
                      </ArrowLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
}
