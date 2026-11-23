import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HotlineBar from './HotlineBar';
import Header from './Header';
import Footer from './Footer';
import PWAManager from '../PWAManager';

const SITE_ORIGIN = 'https://betteralcala.org';
const DEFAULT_TITLE = 'BetterAlcala | Civic Transparency & Public Services Portal';
const DEFAULT_DESCRIPTION =
  'BetterAlcala — Community-driven civic information, municipal services directory, public budgets, ordinances, and barangay data for Alcala, Pangasinan.';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  pageDescription?: string;
}

export default function Layout({
  children,
  breadcrumbs,
  pageTitle,
  pageDescription,
}: LayoutProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const resolvedTitle = pageTitle
      ? `${pageTitle} | BetterAlcala`
      : breadcrumbs && breadcrumbs.length > 0
        ? `${breadcrumbs[breadcrumbs.length - 1].label} | BetterAlcala`
        : DEFAULT_TITLE;
    document.title = resolvedTitle;

    const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_ORIGIN}${cleanPath}`;

    const canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.setAttribute('href', canonicalUrl);
    }

    const ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) {
      ogUrlEl.setAttribute('content', canonicalUrl);
    }

    const ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) {
      ogTitleEl.setAttribute('content', resolvedTitle);
    }

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', pageDescription || DEFAULT_DESCRIPTION);
    }
  }, [pathname, breadcrumbs, pageTitle, pageDescription]);
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <HotlineBar />
      <Header />
      <main id="main-content">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label + idx}>
                  <span>/</span>
                  {crumb.to ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current="page">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        )}
        {children}
      </main>
      <Footer />
      <PWAManager />
    </>
  );
}
