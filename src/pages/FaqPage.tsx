import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { FAQ_ITEMS } from '../data/communityData';

export default function FaqPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) setQuery(qParam);
  }, [searchParams]);

  const categories = useMemo(
    () => Array.from(new Set(FAQ_ITEMS.map((f) => f.category))),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (query.trim() && filtered.length > 0) {
      setOpenId(filtered[0].id);
    }
  }, [query, filtered]);

  return (
    <Layout breadcrumbs={[{ label: 'FAQ' }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-question-circle-fill" aria-hidden="true" /> <span>Help &amp; FAQ</span>
            </span>
            <h1>Frequently Asked Questions</h1>
            <p className="page-header-desc">
              Answers on BetterAlcala’s data verification standards, municipal services, budgets,
              and offline PWA access
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container max-w-4xl">
          <div className="mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              aria-label="Search FAQ"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#0032a0] focus:outline-none"
            />
          </div>

          {categories.map((cat) => {
            const items = filtered.filter((i) => i.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-8">
                <h2 className="text-lg font-bold text-[#0032a0] mb-3">{cat}</h2>
                <div className="space-y-3">
                  {items.map((item) => {
                    const isOpen = openId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-white border border-black/10 rounded-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          aria-expanded={isOpen}
                          className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 hover:bg-slate-50"
                        >
                          <span>{item.question}</span>
                          <i
                            className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'} text-[#0032a0]`}
                            aria-hidden="true"
                          />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 text-sm text-slate-700 leading-relaxed border-t border-black/5">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
