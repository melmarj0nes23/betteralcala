import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Button from '../components/v2/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { FAQ_ITEMS } from '../data/communityData';
import { cn } from '../lib/utils';

export default function FaqPage() {
  const { t } = useLanguage();
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
      <PageMasthead title={t('faq-title')} lede={t('faq-desc')} />

      <section className="py-12 max-md:py-8">
        <Container narrow>
          <div className="relative mb-10">
            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ed-ink-3"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions..."
              aria-label="Search FAQ"
              className="h-11 w-full border border-ed-ink bg-white pl-10 pr-4 font-sans-ed text-[15px] text-ed-ink outline-none placeholder:text-ed-ink-4 focus:border-ed-navy"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="border border-dashed border-ed-rule py-14 text-center">
              <p className="font-serif-ed text-xl text-ed-ink-2">
                No questions matched &ldquo;{query}&rdquo;.
              </p>
              <div className="mt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setQuery('')}>
                  Clear Search
                </Button>
              </div>
            </div>
          ) : (
            categories.map((cat) => {
              const items = filtered.filter((i) => i.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-12">
                  <SectionHeader label={cat} meta={`${items.length} questions`} />
                  <div className="divide-y divide-ed-rule border-y border-ed-rule">
                    {items.map((item) => {
                      const isOpen = openId === item.id;
                      return (
                        <div key={item.id}>
                          <button
                            type="button"
                            onClick={() => setOpenId(isOpen ? null : item.id)}
                            aria-expanded={isOpen}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent px-0 py-4 text-left font-serif-ed text-lg font-semibold text-ed-ink hover:text-ed-navy"
                          >
                            <span>{item.question}</span>
                            <ChevronDownIcon
                              size={16}
                              className={cn('shrink-0 text-ed-navy transition-transform', isOpen && 'rotate-180')}
                            />
                          </button>
                          {isOpen && (
                            <div className="pb-5 font-sans-ed text-[15px] leading-relaxed text-ed-ink-2">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </Container>
      </section>
    </Layout>
  );
}
