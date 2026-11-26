import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import Layout from './components/layout/Layout';

const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const GovernmentPage = lazy(() => import('./pages/GovernmentPage'));
const OfficialsPage = lazy(() => import('./pages/OfficialsPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const LegislativePage = lazy(() => import('./pages/LegislativePage'));
const OrdinanceFrameworkPage = lazy(() => import('./pages/OrdinanceFrameworkPage'));
const ResolutionFrameworkPage = lazy(() => import('./pages/ResolutionFrameworkPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AccessibilityPage = lazy(() =>
  import('./pages/LegalPages').then((m) => ({ default: m.AccessibilityPage }))
);
const PrivacyPage = lazy(() =>
  import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage }))
);
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));

function ScrollManager() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (hash) {
      const id = hash.slice(1);
      const tryScrollToAnchor = (attemptsLeft: number) => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if (attemptsLeft > 0) {
          timer = setTimeout(() => tryScrollToAnchor(attemptsLeft - 1), 60);
        } else {
          scrollTop();
        }
      };
      let timer: ReturnType<typeof setTimeout> | undefined;
      tryScrollToAnchor(6);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }

    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const timer = setTimeout(scrollTop, 80);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [pathname, search, hash]);

  return null;
}

function BudgetExternalRedirect() {
  useEffect(() => {
    window.location.replace('https://budget.betteralcala.org/');
  }, []);
  return null;
}

function NotFoundPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Page Not Found' }]}>
      <section className="section">
        <div className="container text-center py-12">
          <h1 className="mb-3">404 — Page Not Found</h1>
          <p className="text-slate-600 mb-6">
            The page you requested could not be found on BetterAlcala.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/" className="btn btn-primary">
              Return Home
            </Link>
            <Link to="/services" className="btn btn-outline">
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ScrollManager />
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
                  Loading BetterAlcala...
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:category" element={<ServicesPage />} />
                <Route path="/service-details/:id" element={<ServiceDetailPage />} />
                <Route path="/government" element={<GovernmentPage />} />
                <Route path="/officials" element={<OfficialsPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/statistics/:barangay" element={<StatisticsPage />} />
                <Route path="/legislative" element={<LegislativePage />} />
                <Route path="/legislative/ordinance-framework" element={<OrdinanceFrameworkPage />} />
                <Route path="/legislative/resolution-framework" element={<ResolutionFrameworkPage />} />
                <Route path="/budget" element={<BudgetExternalRedirect />} />
                <Route path="/tracker" element={<BudgetExternalRedirect />} />
                <Route path="/budgetdocs" element={<BudgetExternalRedirect />} />
                <Route path="/contracts" element={<BudgetExternalRedirect />} />
                <Route path="/contacts" element={<BudgetExternalRedirect />} />
                <Route path="/transparency" element={<BudgetExternalRedirect />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/weather" element={<WeatherPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/sitemap-page" element={<SitemapPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
