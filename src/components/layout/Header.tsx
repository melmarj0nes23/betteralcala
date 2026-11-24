import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import CommandSearchModal from '../CommandSearchModal';

function isMobileNav(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1024px)').matches;
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleGlobalShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, []);

  const toggleDropdown = useCallback((index: number, e: React.MouseEvent) => {
    if (isMobileNav()) {
      e.preventDefault();
      setOpenDropdown((prev) => (prev === index ? null : index));
    }
  }, []);

  // Close mobile drawer cleanly on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Clean up any stale body classes from earlier builds
  useEffect(() => {
    document.body.classList.remove('mobile-menu-open');
    document.body.style.top = '';
  }, []);

  useEffect(() => {
    function handleDesktopEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && headerRef.current?.contains(document.activeElement)) {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        setOpenDropdown(null);
      }
    }
    document.addEventListener('keydown', handleDesktopEscape);
    return () => document.removeEventListener('keydown', handleDesktopEscape);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (headerRef.current && target && !headerRef.current.contains(target)) {
        closeMenu();
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeMenu();
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen, closeMenu]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isMobileNav() && mobileMenuOpen) {
          closeMenu();
        }
      }, 150);
    }
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen, closeMenu]);

  return (
    <header ref={headerRef} className="site-header">
      <div className="container header-inner">
        <div className="logo-container">
          <Link to="/" aria-label="BetterAlcala Home" className="brand-lockup" onClick={closeMenu}>
            <img
              src="/assets/images/logo/alcala-seal-v2.png"
              alt="Official Seal of the Municipality of Alcala — BetterAlcala Logo"
              className="logo-img"
              width={48}
              height={48}
            />
            <span className="brand-text-group">
              <span className="brand-wordmark">
                <span className="brand-better">Better</span>
                <span className="brand-alcala">Alcala</span>
              </span>
              <span className="brand-subtitle">Alcala, Pangasinan</span>
            </span>
          </Link>
        </div>

        <nav
          id="main-navigation"
          className={`main-nav ${mobileMenuOpen ? 'active' : ''}`}
          aria-label="Main Navigation"
        >
          <ul>
            <li>
              <Link to="/" className={pathname === '/' ? 'active' : ''} onClick={closeMenu}>
                {t('nav-home')}
              </Link>
            </li>
            <li className={`has-dropdown ${openDropdown === 0 ? 'dropdown-open' : ''}`}>
              <Link
                to="/services"
                className={pathname.startsWith('/services') || pathname.startsWith('/service-details') ? 'active' : ''}
                aria-haspopup="true"
                aria-expanded={openDropdown === 0 ? 'true' : 'false'}
                onClick={(e) => toggleDropdown(0, e)}
              >
                {t('nav-services')}
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/services" onClick={closeMenu}>
                    {t('nav-all-services')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/certificates" onClick={closeMenu}>
                    {t('service-certificates')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/business" onClick={closeMenu}>
                    {t('service-business')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/tax-payments" onClick={closeMenu}>
                    {t('service-tax')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/social-services" onClick={closeMenu}>
                    {t('service-social')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/health" onClick={closeMenu}>
                    {t('service-health')}
                  </Link>
                </li>
                <li>
                  <Link to="/services/agriculture" onClick={closeMenu}>
                    Agriculture &amp; Farmer Support
                  </Link>
                </li>
                <li>
                  <Link to="/services/infrastructure" onClick={closeMenu}>
                    Building &amp; Construction
                  </Link>
                </li>
                <li>
                  <Link to="/services/education" onClick={closeMenu}>
                    Employment Assistance (PESO)
                  </Link>
                </li>
                <li>
                  <Link to="/services/public-safety" onClick={closeMenu}>
                    Disaster Risk Reduction &amp; Safety
                  </Link>
                </li>
                <li>
                  <Link to="/services/environment" onClick={closeMenu}>
                    Environment &amp; Solid Waste
                  </Link>
                </li>
              </ul>
            </li>
            <li className={`has-dropdown ${openDropdown === 2 ? 'dropdown-open' : ''}`}>
              <Link
                to="/statistics"
                className={pathname.startsWith('/statistics') ? 'active' : ''}
                aria-haspopup="true"
                aria-expanded={openDropdown === 2 ? 'true' : 'false'}
                onClick={(e) => toggleDropdown(2, e)}
              >
                {t('nav-statistics')}
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/statistics?view=overview" onClick={closeMenu}>
                    Municipal Overview
                  </Link>
                </li>
                <li>
                  <Link to="/statistics" onClick={closeMenu}>
                    Explore by Barangay
                  </Link>
                </li>
              </ul>
            </li>
            <li className={`has-dropdown ${openDropdown === 1 ? 'dropdown-open' : ''}`}>
              <Link
                to="/legislative"
                className={pathname.startsWith('/legislative') ? 'active' : ''}
                aria-haspopup="true"
                aria-expanded={openDropdown === 1 ? 'true' : 'false'}
                onClick={(e) => toggleDropdown(1, e)}
              >
                {t('nav-legislative')}
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/legislative" onClick={closeMenu}>
                    {t('nav-legislative-hub')}
                  </Link>
                </li>
                <li>
                  <Link to="/legislative/ordinance-framework" onClick={closeMenu}>
                    {t('nav-ordinances')}
                  </Link>
                </li>
                <li>
                  <Link to="/legislative/resolution-framework" onClick={closeMenu}>
                    {t('nav-resolutions')}
                  </Link>
                </li>
              </ul>
            </li>
            <li>
              <a
                href="https://budget.betteralcala.org/"
                className={
                  pathname.startsWith('/budget') ||
                  pathname.startsWith('/tracker') ||
                  pathname.startsWith('/contracts') ||
                  pathname.startsWith('/transparency')
                    ? 'active'
                    : ''
                }
                onClick={closeMenu}
              >
                {t('nav-transparency')}
              </a>
            </li>
            <li>
              <Link
                to="/government"
                className={pathname.startsWith('/government') ? 'active' : ''}
                onClick={closeMenu}
              >
                {t('nav-government')}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={pathname.startsWith('/contact') ? 'active' : ''}
                onClick={closeMenu}
              >
                {t('nav-contact')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="header-search-trigger"
            aria-label="Open quick civic search (Ctrl+K)"
            title="Quick search (⌘K / Ctrl+K)"
          >
            <i className="bi bi-search" aria-hidden="true" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="hidden xl:inline-block">⌘K</kbd>
          </button>

          <div className="lang-selector" role="group" aria-label="Language switcher">
            <button
              type="button"
              className={`btn btn-secondary btn-sm lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              className={`btn btn-secondary btn-sm lang-btn ${language === 'fil' ? 'active' : ''}`}
              onClick={() => setLanguage('fil')}
              aria-label="Switch to Filipino"
            >
              FIL
            </button>
            <button
              type="button"
              className={`btn btn-secondary btn-sm lang-btn ${language === 'ilo' ? 'active' : ''}`}
              onClick={() => setLanguage('ilo')}
              aria-label="Switch to Ilocano"
            >
              ILO
            </button>
          </div>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? 'Close Navigation' : 'Open Navigation'}
          aria-expanded={mobileMenuOpen ? 'true' : 'false'}
          aria-controls="main-navigation"
        >
          <i className={`bi ${mobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`} aria-hidden="true" />
        </button>
      </div>
      <CommandSearchModal open={commandOpen} onClose={() => setCommandOpen(false)} />
      <div className="fs-progress" aria-hidden="true" />
    </header>
  );
}
