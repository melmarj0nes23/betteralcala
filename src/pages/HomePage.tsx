import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SearchAutocomplete from '../components/SearchAutocomplete';
import WeatherMapSection from '../components/WeatherMapSection';
import AlcalaHistoryTimeline from '../components/AlcalaHistoryTimeline';
import { AlcalaPennants, AlcalaWovenStrip } from '../components/AlcalaWovenStrip';
import { VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { ALCALA_QUIZ_QUESTIONS, NEWS_ITEMS } from '../data/communityData';
import { BUDGET_RECORDS } from '../data/transparencyData';
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

export default function HomePage() {
  const { t } = useLanguage();
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const newsItems = useCivicDataset('news.json', 'news', NEWS_ITEMS, isValidNewsItem);

  const latestNews = newsItems.slice(0, 3);

  const handleQuizAnswer = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    if (idx === ALCALA_QUIZ_QUESTIONS[quizStep].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizStep + 1 < ALCALA_QUIZ_QUESTIONS.length) {
      setQuizStep((s) => s + 1);
      setSelectedOpt(null);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setSelectedOpt(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <Layout>
      {/* Warm Editorial Civic Masthead & 4-Pillar Pennants */}
      <section className="alcala-hero">
        <div className="container">
          <div className="alcala-hero-grid">
            <div className="text-center lg:text-left">
              <div className="alcala-hero-kicker justify-center lg:justify-start">
                <span className="whitespace-nowrap">Alcala, Pangasinan</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">PSGC {MUNICIPAL_PROFILE.psgcCode}</span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">5th District</span>
              </div>
              <h1 className="alcala-hero-title">
                BetterAlcala<span className="alcala-hero-accent">.org</span>
              </h1>
              <p className="alcala-hero-subtitle mx-auto lg:mx-0 mb-6">{t('hero-subtitle')}</p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm sm:text-base font-semibold text-[#0f2342]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#26489A]" aria-hidden="true" />
                  <span className="tabular-nums">
                    {MUNICIPAL_PROFILE.population2024.toLocaleString()} Residents
                  </span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2E8B57]" aria-hidden="true" />
                  <span>{MUNICIPAL_PROFILE.barangayCount} Barangays</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D1432A]" aria-hidden="true" />
                  <span>Est. 1875</span>
                </span>
              </div>
            </div>

            <div>
              <AlcalaPennants />
            </div>
          </div>

          <div className="home-search-box alcala-hero-search-card max-w-3xl mx-auto mt-10 md:mt-14 lg:mt-16 mb-0">
            <div className="flex items-center justify-center md:justify-between gap-2 mb-3">
              <h2 className="m-0 text-sm sm:text-base font-bold text-[#0f2342] flex items-center gap-2 leading-none">
                <i className="bi bi-search text-[#26489A]" aria-hidden="true" />
                <span>{t('home-find-a-service')}</span>
              </h2>
              <span className="text-[11px] font-mono-data text-slate-500 hidden md:inline-flex items-center leading-none">
                Press ⌘K anywhere
              </span>
            </div>
            <SearchAutocomplete />
            <div className="home-search-tags justify-center">
              <span className="font-semibold text-slate-700">{t('home-popular')}</span>
              <Link to="/service-details/birth-certificate">{t('home-birth-certificate')}</Link>
              <Link to="/service-details/business-permits-licensing">
                {t('home-business-permit')}
              </Link>
              <Link to="/service-details/real-property-tax">{t('home-real-property-tax')}</Link>
              <Link to="/budget">FY 2026 Budget</Link>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f2342] hover:bg-[#26489A] text-white text-sm font-semibold px-5 py-2.5 transition-colors no-underline"
            >
              <span>{t('home-browse-services')}</span>
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#0f2342]/25 bg-white hover:border-[#0f2342] text-[#0f2342] text-sm font-semibold px-5 py-2.5 transition-colors no-underline"
            >
              {t('home-contact-us')}
            </Link>
          </div>
        </div>
      </section>

      <AlcalaWovenStrip />

      {/* Popular Services Grid */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>{t('section-popular')}</h2>
            <p>{t('home-quick-access-to-frequently-requested-municipal')}</p>
          </div>
          <div className="alcala-services-grid">
            <Link to="/services/certificates" className="alcala-service-tile alcala-service-tile--blue">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-file-earmark-text-fill" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">Civil Registry</span>
              </div>
              <div>
                <h3>{t('service-certificates')}</h3>
                <p>{t('service-certificates-desc')}</p>
              </div>
            </Link>

            <Link to="/services/business" className="alcala-service-tile alcala-service-tile--terracotta">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-shop" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">BPLO · BOSS</span>
              </div>
              <div>
                <h3>{t('service-business')}</h3>
                <p>{t('service-business-desc')}</p>
              </div>
            </Link>

            <Link to="/services/tax-payments" className="alcala-service-tile alcala-service-tile--navy">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-cash-coin" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">Treasury</span>
              </div>
              <div>
                <h3>{t('service-tax')}</h3>
                <p>{t('service-tax-desc')}</p>
              </div>
            </Link>

            <Link to="/services/social-services" className="alcala-service-tile alcala-service-tile--green">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-people-fill" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">MSWDO</span>
              </div>
              <div>
                <h3>{t('service-social')}</h3>
                <p>{t('service-social-desc')}</p>
              </div>
            </Link>

            <Link to="/services/health" className="alcala-service-tile alcala-service-tile--teal">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-heart-pulse-fill" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">Alcala RHU</span>
              </div>
              <div>
                <h3>{t('service-health')}</h3>
                <p>{t('service-health-desc')}</p>
              </div>
            </Link>

            <Link to="/services" className="alcala-service-tile alcala-service-tile--all">
              <div className="alcala-service-tile-top">
                <div className="alcala-service-tile-icon">
                  <i className="bi bi-grid-fill" aria-hidden="true" />
                </div>
                <span className="alcala-service-tile-badge">All Categories →</span>
              </div>
              <div>
                <h3>{t('btn-view-all-services')}</h3>
                <p>{t('home-browse-complete-directory')}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats: Alcala at a Glance */}
      <section className="home-stats-v2">
        <div className="container">
          <div className="home-stats-v2-header">
            <div>
              <h2>{t('home-at-a-glance')}</h2>
              <p className="m-0 mt-1 text-sm text-slate-600">
                Demographic, geographic, and administrative profile of Alcala, 5th District of
                Pangasinan
              </p>
            </div>
            <Link to="/statistics" className="home-section-link">
              <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
              <span>{t('home-view-statistics')}</span>
            </Link>
          </div>
          <div className="home-stats-v2-grid">
            <Link to="/statistics" className="home-stat-card home-stat-card--blue">
              <div className="home-stat-card-icon">
                <i className="bi bi-people-fill" aria-hidden="true" />
              </div>
              <div className="home-stat-card-content">
                <span className="home-stat-card-value tabular-nums">
                  {MUNICIPAL_PROFILE.population2024.toLocaleString()}
                </span>
                <span className="home-stat-card-label">{t('home-population')}</span>
                <span className="home-stat-card-source">{t('home-2024-census')}</span>
              </div>
            </Link>

            <Link to="/statistics" className="home-stat-card home-stat-card--green">
              <div className="home-stat-card-icon">
                <i className="bi bi-geo-alt-fill" aria-hidden="true" />
              </div>
              <div className="home-stat-card-content">
                <span className="home-stat-card-value tabular-nums">
                  {MUNICIPAL_PROFILE.barangayCount}
                </span>
                <span className="home-stat-card-label">{t('home-barangays')}</span>
                <span className="home-stat-card-source">{t('home-administrative-units')}</span>
              </div>
            </Link>

            <Link to="/budget" className="home-stat-card home-stat-card--teal">
              <div className="home-stat-card-icon">
                <i className="bi bi-award-fill" aria-hidden="true" />
              </div>
              <div className="home-stat-card-content">
                <span className="home-stat-card-value">{t('home-3rd-class')}</span>
                <span className="home-stat-card-label">{t('home-municipality')}</span>
                <span className="home-stat-card-source">{t('home-income-classification')}</span>
              </div>
            </Link>

            <Link to="/statistics" className="home-stat-card home-stat-card--terracotta">
              <div className="home-stat-card-icon">
                <i className="bi bi-rulers" aria-hidden="true" />
              </div>
              <div className="home-stat-card-content">
                <span className="home-stat-card-value tabular-nums">
                  {MUNICIPAL_PROFILE.landAreaKm2} km²
                </span>
                <span className="home-stat-card-label">{t('home-land-area')}</span>
                <span className="home-stat-card-source">{t('home-total-municipal-area')}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Weather & Map of Alcala */}
      <WeatherMapSection />

      {/* Announcements & Civic Updates */}
      <section className="section bg-alt">
        <div className="container">
          <div className="home-section-header">
            <h2>{t('section-news')}</h2>
            <Link to="/news" className="home-section-link">
              <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
              <span>{t('home-view-all-news')}</span>
            </Link>
          </div>

          <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
            {latestNews.map((item) => (
              <article
                key={item.id}
                className="bg-white border border-black/10 rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-[#26489A] bg-[#26489A]/10 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <span className="tabular-nums text-slate-500">{item.date}</span>
                    </span>
                    <VerificationBadge status={item.citation.verificationStatus} />
                  </div>
                  <h3 className="text-base font-bold text-[#0f2342] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 mobile-clamp-3">{item.summary}</p>
                </div>
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.originType}</span>
                  <Link to="/news" className="font-semibold text-[#26489A]">
                    Read details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Live Transparency & Barangay Project Snapshot */}
      <section className="section" aria-label="Budget and Project Snapshot">
        <div className="container">
          <div className="rounded-2xl overflow-hidden border border-black/10 bg-white shadow-xs">
            <div className="bg-[#EAF2EE] border-b border-black/10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-center lg:text-left">
              <div>
                <span className="inline-flex items-center justify-center lg:justify-start gap-1.5 font-mono-data text-[11px] font-bold uppercase tracking-widest text-[#2E8B57] mb-2">
                  <i className="bi bi-shield-check" aria-hidden="true" />
                  <span>Open Civic Data · Alcala, Pangasinan</span>
                </span>
                <h2 className="m-0 text-2xl sm:text-3xl font-extrabold text-[#0f2342] font-serif">
                  Follow Every Peso Across Alcala&apos;s 21 Barangays
                </h2>
                <p className="m-0 mt-2 mx-auto lg:mx-0 text-sm text-slate-600 max-w-2xl leading-relaxed">
                  From municipal appropriations to Agno River flood control, farm-to-market roads,
                  and barangay multi-purpose halls—see what is funded and check project documents.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 shrink-0">
                <Link
                  to="/budget#barangay-tracker"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0f2342] hover:bg-[#26489A] text-white text-xs sm:text-sm font-bold px-5 py-2.5 transition-colors no-underline shadow-xs"
                >
                  <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                  <span>Open Barangay Project Tracker</span>
                </Link>
                <Link
                  to="/budget"
                  className="inline-flex items-center gap-2 rounded-full border border-[#0f2342]/20 bg-white hover:border-[#0f2342] text-[#0f2342] text-xs sm:text-sm font-semibold px-5 py-2.5 transition-colors no-underline"
                >
                  <span>{t('home-view-budget')}</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 sm:p-8">
              <Link
                to="/budget"
                className="rounded-xl bg-[#FAF7F2] hover:border-[#26489A]/40 border border-black/10 p-4 transition-all hover:shadow-sm no-underline"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#26489A]/12 text-[#26489A]">
                    <i className="bi bi-bank2" aria-hidden="true" />
                  </span>
                  <span className="font-mono-data text-[11px] font-bold text-[#26489A]">
                    FY {BUDGET_RECORDS[0]?.fiscalYear ?? 2026}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#26489A] tabular-nums">
                  ₱{((BUDGET_RECORDS[0]?.approvedBudget ?? 193594983) / 1_000_000).toFixed(2)}M
                </div>
                <div className="text-xs font-bold text-[#0f2342] mt-0.5">
                  Approved Municipal Budget
                </div>
                <p className="m-0 mt-1 text-[11px] text-slate-600">
                  Verified via Sangguniang Panlalawigan appropriation review
                </p>
              </Link>

              <Link
                to="/budget#national-gaa"
                className="rounded-xl bg-[#FAF7F2] hover:border-[#2E8B57]/40 border border-black/10 p-4 transition-all hover:shadow-sm no-underline"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2E8B57]/12 text-[#2E8B57]">
                    <i className="bi bi-water" aria-hidden="true" />
                  </span>
                  <span className="font-mono-data text-[11px] font-bold text-[#2E8B57]">
                    2024–2026 GAA
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#2E8B57] tabular-nums">
                  29 Enacted Records
                </div>
                <div className="text-xs font-bold text-[#0f2342] mt-0.5">
                  Flood Control, FMRs &amp; Schools
                </div>
                <p className="m-0 mt-1 text-[11px] text-slate-600">
                  Includes Agno River protection, Macayo &amp; Bersamin FMRs, and evacuation halls
                </p>
              </Link>

              <Link
                to="/budget#barangay-tracker"
                className="rounded-xl bg-[#FAF7F2] hover:border-[#D1432A]/40 border border-black/10 p-4 transition-all hover:shadow-sm no-underline"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#D1432A]/12 text-[#D1432A]">
                    <i className="bi bi-cone-striped" aria-hidden="true" />
                  </span>
                  <span className="font-mono-data text-[11px] font-bold text-[#D1432A]">
                    FY 2027 Pipeline
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-[#D1432A] tabular-nums">
                  14 Alcala Projects
                </div>
                <div className="text-xs font-bold text-[#0f2342] mt-0.5">
                  NEP vs. House Bill Tracker
                </div>
                <p className="m-0 mt-1 text-[11px] text-slate-600">
                  San Vicente FMR, Poblacion West, Pindangan, Gualsic &amp; more with PDF sources
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brief History of Alcala */}
      <AlcalaHistoryTimeline title={t('home-history-title')} />

      {/* Interactive Alcala Heritage & Civic Quiz CTA */}
      <section className="section bg-alt" aria-label="Alcala Heritage Quiz">
        <div className="container">
          <div className="quiz-cta-inner bg-white rounded-2xl overflow-hidden border border-black/10 shadow-xs">
            <div className="quiz-cta-animation">
              <img
                src="/assets/images/alcala-heritage-quiz.jpg"
                alt="Alcala Municipal Hall, historical monument, and municipal seal of Alcala, Pangasinan"
                className="quiz-cta-image"
                width={840}
                height={644}
                loading="eager"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="quiz-cta-content">
              <h2 className="quiz-cta-heading">{t('quiz-title')}</h2>
              <p className="quiz-cta-subtitle">{t('quiz-subtitle')}</p>
              <p className="quiz-cta-description">{t('quiz-description')}</p>
              <button
                type="button"
                onClick={() => {
                  resetQuiz();
                  setQuizOpen(true);
                }}
                className="quiz-cta-btn border-0 cursor-pointer"
              >
                <i className="bi bi-play-circle-fill" aria-hidden="true" />{' '}
                <span>{t('quiz-take')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>{t('section-contact')}</h2>
            <Link to="/contact" className="home-section-link">
              <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
              <span>{t('home-view-all')}</span>
            </Link>
          </div>
          <div className="home-contact-v2-grid">
            <div className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-telephone-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>{t('contact-phone')}</h3>
                <a
                  href="tel:+63756325938"
                  className="home-contact-v2-value block no-underline hover:underline"
                >
                  (075) 632-5938
                </a>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="home-contact-v2-note">{t('contact-hours')}</span>
                  <a
                    href="tel:09209817724"
                    className="inline-flex items-center gap-1 rounded-full bg-[#D1432A]/10 text-[#D1432A] px-2.5 py-0.5 text-[11px] font-bold no-underline hover:bg-[#D1432A] hover:text-white transition-colors"
                  >
                    <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                    <span>MDRRMO: 0920-9817724</span>
                  </a>
                </div>
              </div>
            </div>

            <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`} className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-envelope-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>{t('contact-email')}</h3>
                <p className="home-contact-v2-value">{MUNICIPAL_PROFILE.hallEmail}</p>
                <span className="home-contact-v2-note">Official LGU Alcala Email</span>
              </div>
            </a>

            <Link to="/contact" className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-geo-alt-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>{t('contact-address')}</h3>
                <p className="home-contact-v2-value">Poblacion East, Municipal Hall</p>
                <span className="home-contact-v2-note">Alcala, 2425 Pangasinan</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Quiz Modal */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alcala-quiz-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 id="alcala-quiz-modal-title" className="text-lg font-bold text-[#0032a0] m-0">
                Alcala, Pangasinan Civic Quiz
              </h3>
              <button
                type="button"
                onClick={() => setQuizOpen(false)}
                aria-label="Close quiz"
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {!quizFinished ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Question {quizStep + 1} of {ALCALA_QUIZ_QUESTIONS.length} · Score: {score}
                </p>
                <h4 className="text-base font-semibold text-slate-900 mb-4">
                  {ALCALA_QUIZ_QUESTIONS[quizStep].question}
                </h4>
                <div className="flex flex-col gap-2 mb-4">
                  {ALCALA_QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => {
                    const isPicked = selectedOpt === idx;
                    const isCorrect = idx === ALCALA_QUIZ_QUESTIONS[quizStep].correctIndex;
                    let cls =
                      'w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ';
                    if (selectedOpt === null) {
                      cls += 'border-slate-200 hover:border-[#0032a0] hover:bg-blue-50';
                    } else if (isCorrect) {
                      cls += 'border-emerald-600 bg-emerald-50 text-emerald-900';
                    } else if (isPicked) {
                      cls += 'border-red-500 bg-red-50 text-red-900';
                    } else {
                      cls += 'border-slate-200 text-slate-500';
                    }
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleQuizAnswer(idx)}
                        className={cls}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {selectedOpt !== null && (
                  <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    {ALCALA_QUIZ_QUESTIONS[quizStep].explanation}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuizOpen(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Close
                  </button>
                  {selectedOpt !== null && (
                    <button type="button" onClick={handleQuizNext} className="btn btn-primary btn-sm">
                      {quizStep + 1 < ALCALA_QUIZ_QUESTIONS.length
                        ? 'Next Question'
                        : 'Finish Quiz'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl text-[#0032a0] mb-3">
                  <i className="bi bi-trophy-fill" aria-hidden="true" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  You scored {score} / {ALCALA_QUIZ_QUESTIONS.length}
                </h4>
                <p className="text-sm text-slate-600 mb-5">
                  Thank you for exploring Alcala’s history, 21 barangays, and civic heritage.
                </p>
                <div className="flex justify-center gap-3">
                  <button type="button" onClick={resetQuiz} className="btn btn-outline btn-sm">
                    Retake Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuizOpen(false)}
                    className="btn btn-primary btn-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
