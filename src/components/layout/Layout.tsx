import React from 'react';
import { Link } from 'react-router-dom';
import HotlineBar from './HotlineBar';
import Header from './Header';
import InfoBar from './InfoBar';
import Footer from './Footer';
import PWAManager from '../PWAManager';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface LayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function Layout({ children, breadcrumbs }: LayoutProps) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <HotlineBar />
      <Header />
      <InfoBar />
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
