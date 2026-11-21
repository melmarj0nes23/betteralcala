import { useMemo, useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { SERVICE_CATEGORIES, SERVICES_DATA } from '../data/servicesData';

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
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-grid-fill" aria-hidden="true" />{' '}
              <span>{t('services-badge')}</span>
            </span>
            <h1>{activeCatObj ? activeCatObj.title : t('services-title')}</h1>
            <p className="page-header-desc">
              {activeCatObj ? activeCatObj.description : t('services-desc')}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="civic-notice-banner mb-6">
            <i className="bi bi-info-circle-fill" aria-hidden="true" />
            <div>
              <strong>Verification Note:</strong> Statutory steps follow Philippine law (RA 11032,
              RA 9994, RA 10754, RA 11861, RA 7160). Local fees awaiting published ordinances are
              marked <strong>Needs Review</strong> — call <a href="tel:+63756325938">(075) 632-5938</a>{' '}
              to confirm.
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-slate-50 border border-black/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('services-search-placeholder')}
                  aria-label="Filter municipal services"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-[#0032a0] focus:outline-none"
                />
              </div>
              <span className="text-sm text-slate-600 font-medium tabular-nums whitespace-nowrap">
                Showing {filteredServices.length} of {SERVICES_DATA.length} service guides
              </span>
            </div>

            <div className="mobile-filter-select-wrap">
              <label htmlFor="services-category-select" className="mobile-filter-select-label">
                Service Category
              </label>
              <select
                id="services-category-select"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="mobile-filter-select"
                aria-label="Filter services by category"
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

            <div
              className="filter-tab-bar filter-tab-bar--collapsible mb-0"
              role="tablist"
              aria-label="Service categories"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={`filter-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
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
                  className={`filter-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.shortTitle}
                </button>
              ))}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-black/5">
              <p className="text-slate-600 mb-3">No services matched "{query}".</p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setActiveCategory('all');
                }}
                className="btn btn-primary btn-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
              {filteredServices.map((service) => (
                <article
                  key={service.id}
                  className="bg-white border border-black/10 rounded-xl p-5 flex flex-col justify-between hover:border-[#0032a0]/40 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-xs font-semibold text-[#0032a0]">{service.category}</span>
                      <VerificationBadge status={service.citation.verificationStatus} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <i className={`bi ${service.icon} text-[#0032a0]`} aria-hidden="true" />
                      <span>{service.title}</span>
                    </h2>
                    <p className="text-sm text-slate-600 mb-4 mobile-clamp-2">{service.description}</p>
                  </div>

                  <div className="border-t border-black/5 pt-3 text-xs text-slate-600 space-y-1.5">
                    <div>
                      <strong>Office:</strong> {service.office}
                    </div>
                    <div>
                      <strong>Fees:</strong> {service.fees}
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <a href={`tel:${service.officePhones[0]?.replace(/[^+\d]/g, '')}`}>
                        <i className="bi bi-telephone" aria-hidden="true" /> {service.officePhones[0]}
                      </a>
                      <Link
                        to={`/service-details/${service.id}`}
                        className="font-semibold text-[#0032a0]"
                      >
                        {t('services-view-guide')} →
                      </Link>
                    </div>
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
