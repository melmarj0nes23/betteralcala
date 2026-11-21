import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SearchAutocomplete from '../components/SearchAutocomplete';
import WeatherMapSection from '../components/WeatherMapSection';
import { VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { MUNICIPAL_PROFILE, OFFICIALS_DATA } from '../data/municipalInfo';
import { ALCALA_QUIZ_QUESTIONS, NEWS_ITEMS } from '../data/communityData';

export default function HomePage() {
  const { t } = useLanguage();
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const mayor = OFFICIALS_DATA.find((o) => o.id === 'mayor-collado');
  const viceMayor = OFFICIALS_DATA.find((o) => o.id === 'vicemayor-callejo');
  const latestNews = NEWS_ITEMS.slice(0, 3);

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
      {/* Hero Section */}
      <section className="home-hero-v2">
        <div className="container">
          <div className="home-hero-v2-inner">
            <div className="home-hero-v2-text">
              <h1>{t('hero-welcome')}</h1>
              <p>{t('hero-subtitle')}</p>
              <div className="home-hero-v2-actions">
                <Link to="/services" className="btn btn-primary">
                  <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
                  <span>{t('home-browse-services')}</span>
                </Link>
                <Link to="/contact" className="btn btn-outline">
                  {t('home-contact-us')}
                </Link>
              </div>
            </div>

            <div className="home-hero-v2-search">
              <div className="home-search-box">
                <h2>
                  <i className="bi bi-search" aria-hidden="true" />{' '}
                  <span>{t('home-find-a-service')}</span>
                </h2>
                <SearchAutocomplete />
                <div className="home-search-tags">
                  <span>{t('home-popular')}</span>
                  <Link to="/service-details/birth-certificate">{t('home-birth-certificate')}</Link>
                  <Link to="/service-details/business-permits-licensing">
                    {t('home-business-permit')}
                  </Link>
                  <Link to="/service-details/real-property-tax">
                    {t('home-real-property-tax')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Civic Transparency & Independent Portal Notice */}
      <section className="appointment-cta-section" aria-label="Civic Platform Overview">
        <div className="container">
          <div className="appointment-cta-inner">
            <div className="appointment-cta-content">
              <h2 className="appointment-cta-heading">{t('home-citizen-charter-title')}</h2>
              <p className="appointment-cta-subtitle">{t('home-citizen-charter-desc')}</p>
              <div className="appointment-cta-actions">
                <Link to="/services" className="appointment-cta-btn appointment-cta-btn--primary">
                  <i className="bi bi-grid-fill" aria-hidden="true" />{' '}
                  <span>{t('home-explore-directory')}</span>
                </Link>
                <Link to="/budget" className="appointment-cta-btn appointment-cta-btn--outline">
                  <i className="bi bi-pie-chart-fill" aria-hidden="true" />{' '}
                  <span>{t('home-view-budget')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Grid */}
      <section className="section">
        <div className="container">
          <div className="home-section-header">
            <h2>{t('section-popular')}</h2>
            <p>{t('home-quick-access-to-frequently-requested-municipal')}</p>
          </div>
          <div className="home-services-grid">
            <Link to="/services/certificates" className="home-service-card">
              <div className="home-service-icon">
                <i className="bi bi-file-earmark-text-fill" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('service-certificates')}</h3>
                <p>{t('service-certificates-desc')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>

            <Link to="/services/business" className="home-service-card">
              <div className="home-service-icon">
                <i className="bi bi-shop" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('service-business')}</h3>
                <p>{t('service-business-desc')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>

            <Link to="/services/tax-payments" className="home-service-card">
              <div className="home-service-icon">
                <i className="bi bi-cash-coin" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('service-tax')}</h3>
                <p>{t('service-tax-desc')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>

            <Link to="/services/social-services" className="home-service-card">
              <div className="home-service-icon">
                <i className="bi bi-people-fill" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('service-social')}</h3>
                <p>{t('service-social-desc')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>

            <Link to="/services/health" className="home-service-card">
              <div className="home-service-icon">
                <i className="bi bi-heart-pulse-fill" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('service-health')}</h3>
                <p>{t('service-health-desc')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>

            <Link to="/services" className="home-service-card home-service-card--all">
              <div className="home-service-icon">
                <i className="bi bi-grid-fill" aria-hidden="true" />
              </div>
              <div className="home-service-content">
                <h3>{t('btn-view-all-services')}</h3>
                <p>{t('home-browse-complete-directory')}</p>
              </div>
              <i className="bi bi-arrow-right home-service-arrow" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats: Alcala at a Glance */}
      <section className="home-stats-v2">
        <div className="container">
          <div className="home-stats-v2-header">
            <h2>{t('home-at-a-glance')}</h2>
            <Link to="/statistics" className="home-section-link">
              <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
              <span>{t('home-view-statistics')}</span>
            </Link>
          </div>
          <div className="home-stats-v2-grid">
            <Link to="/statistics" className="home-stat-card">
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

            <Link to="/government#barangays" className="home-stat-card">
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

            <Link to="/budget" className="home-stat-card">
              <div className="home-stat-card-icon">
                <i className="bi bi-award-fill" aria-hidden="true" />
              </div>
              <div className="home-stat-card-content">
                <span className="home-stat-card-value">{t('home-3rd-class')}</span>
                <span className="home-stat-card-label">{t('home-municipality')}</span>
                <span className="home-stat-card-source">{t('home-income-classification')}</span>
              </div>
            </Link>

            <Link to="/statistics" className="home-stat-card">
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

      {/* Brief History of Alcala */}
      <section className="section history-section">
        <div className="container">
          <div className="home-stats-v2-header">
            <h2>
              <i className="bi bi-book" aria-hidden="true" />{' '}
              <span>{t('home-history-title')}</span>
            </h2>
          </div>

          <div className="history-content">
            <div className="history-timeline">
              {MUNICIPAL_PROFILE.historyTimeline.map((item) => (
                <div key={item.year} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <span className="timeline-year">{item.year}</span>
                    <p>
                      <strong>{item.title}:</strong> {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
                className="bg-white border border-black/10 rounded-lg p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-600">
                    <span>
                      {item.category} · {item.date}
                    </span>
                    <VerificationBadge status={item.citation.verificationStatus} />
                  </div>
                  <h3 className="text-base font-bold text-[#0032a0] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 mobile-clamp-3">{item.summary}</p>
                </div>
                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-slate-500">
                  <span>{item.originType}</span>
                  <Link to="/news" className="font-semibold text-[#0032a0]">
                    Read details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Municipal Leadership */}
      <section className="section home-leadership-section">
        <div className="container">
          <div className="home-section-header">
            <h2>{t('section-leadership')}</h2>
            <Link to="/government" className="home-section-link">
              <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
              <span>{t('home-view-all-officials')}</span>
            </Link>
          </div>

          <div className="home-leadership-grid">
            {mayor && (
              <div className="home-leader-card">
                <div className="home-leader-badge">{t('title-mayor')}</div>
                <h3>{mayor.name}</h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <span className="text-xs text-slate-500">Term {mayor.term}</span>
                  <VerificationBadge status={mayor.citation.verificationStatus} />
                </div>
                <div className="home-leader-contacts">
                  <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`}>
                    <i className="bi bi-envelope" aria-hidden="true" />{' '}
                    <span>{MUNICIPAL_PROFILE.hallEmail}</span>
                  </a>
                  <a href="tel:+63756325938">
                    <i className="bi bi-telephone" aria-hidden="true" /> (075) 632-5938
                  </a>
                </div>
              </div>
            )}

            {viceMayor && (
              <div className="home-leader-card">
                <div className="home-leader-badge">{t('title-vice-mayor')}</div>
                <h3>{viceMayor.name}</h3>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <span className="text-xs text-slate-500">Term {viceMayor.term}</span>
                  <VerificationBadge status={viceMayor.citation.verificationStatus} />
                </div>
                <div className="home-leader-contacts">
                  <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`}>
                    <i className="bi bi-envelope" aria-hidden="true" />{' '}
                    <span>{MUNICIPAL_PROFILE.hallEmail}</span>
                  </a>
                  <a href="tel:+63755933012">
                    <i className="bi bi-telephone" aria-hidden="true" /> (075) 593-3012
                  </a>
                </div>
              </div>
            )}
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
            <a href="tel:+63756325938" className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-telephone-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>{t('contact-phone')}</h3>
                <p className="home-contact-v2-value">(075) 632-5938</p>
                <span className="home-contact-v2-note">{t('contact-hours')}</span>
              </div>
            </a>

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

      {/* Interactive Alcala Heritage & Civic Quiz CTA */}
      <section className="quiz-cta-section" aria-label="Alcala Heritage Quiz">
        <div className="quiz-cta-inner">
          <div className="quiz-cta-animation">
            <picture className="block w-full h-full">
              <source srcSet="/assets/images/alcala-heritage-quiz.webp" type="image/webp" />
              <img
                src="/assets/images/alcala-heritage-quiz.jpg"
                alt="Alcala Municipal Hall, historical monument, and municipal seal of Alcala, Pangasinan"
                className="quiz-cta-image"
                width={1200}
                height={869}
                loading="lazy"
              />
            </picture>
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
