import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, MailIcon, MenuIcon, SearchIcon, XIcon } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDetailedWeather } from '../../hooks/useDetailedWeather';
import CommandSearchModal from '../CommandSearchModal';
import Container from '../v2/ui/Container';
import Button from '../v2/ui/Button';
import { cn } from '../../lib/utils';

type NavChild = {
  label: string;
  to: string;
  blurb?: string;
  external?: boolean;
};

type NavItem = {
  label: string;
  to: string;
  matchPrefixes: string[];
  children?: NavChild[];
};

const navItemBase =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-5 py-3 font-serif-ed text-base font-semibold text-ed-ink-2 no-underline transition-colors hover:bg-ed-navy-tint hover:text-ed-navy';
const activeClasses = 'bg-ed-navy-tint text-ed-navy';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [showPrimaryNav, setShowPrimaryNav] = useState(true);
  const lastScrollYRef = useRef(0);
  const { pathname } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const weather = useDetailedWeather();

  const hoverCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRootRef = useRef<HTMLElement>(null);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  );

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: t('nav-services') || 'Services',
        to: '/services',
        matchPrefixes: ['/services', '/service-details'],
        children: [
          { label: t('nav-all-services') || 'All Municipal Services', to: '/services', blurb: 'Complete directory of Alcala municipal & barangay services.' },
          { label: t('service-certificates') || 'Certificates & Civil Registry', to: '/services/certificates', blurb: 'Birth, marriage, death certificates and clearances.' },
          { label: t('service-business') || 'Business & Permits (BPLO)', to: '/services/business', blurb: 'New business registration, renewals, and BOSS.' },
          { label: t('service-tax') || 'Tax Payments (Treasury)', to: '/services/tax-payments', blurb: 'Real property tax, community tax, and assessments.' },
          { label: t('service-social') || 'Social Services (MSWDO)', to: '/services/social-services', blurb: 'AICS, senior citizen, PWD, and solo parent support.' },
          { label: t('service-health') || 'Health & RHU', to: '/services/health', blurb: 'Rural Health Unit consultations, vaccines, and sanitation.' },
        ],
      },
      {
        label: t('nav-statistics') || 'Statistics',
        to: '/statistics',
        matchPrefixes: ['/statistics'],
        children: [
          { label: 'Municipal Overview', to: '/statistics?view=overview', blurb: 'Population, land area, and civic profile of Alcala.' },
          { label: 'Explore by Barangay', to: '/statistics', blurb: 'Profiles and data across all 21 barangays.' },
        ],
      },
      {
        label: t('nav-legislative') || 'Legislative',
        to: '/legislative',
        matchPrefixes: ['/legislative'],
        children: [
          { label: t('nav-legislative-hub') || 'Legislative Hub', to: '/legislative', blurb: 'Sangguniang Bayan ordinances, resolutions, and records.' },
          { label: t('nav-ordinances') || 'Ordinance Framework', to: '/legislative/ordinance-framework', blurb: 'Browse enacted municipal ordinances.' },
          { label: t('nav-resolutions') || 'Resolution Framework', to: '/legislative/resolution-framework', blurb: 'Browse municipal council resolutions.' },
        ],
      },
      {
        label: t('nav-transparency') || 'Budget',
        to: 'https://budget.betteralcala.org/',
        matchPrefixes: [],
        children: [
          { label: 'Alcala Budget Portal', to: 'https://budget.betteralcala.org/', blurb: 'Approved FY 2026 municipal budget, appropriations, and project tracker.', external: true },
        ],
      },
      {
        label: t('nav-government') || 'Government',
        to: '/government',
        matchPrefixes: ['/government'],
      },
      {
        label: t('nav-officials') || 'Officials',
        to: '/officials',
        matchPrefixes: ['/officials'],
      },
      {
        label: t('nav-weather') || 'Weather',
        to: '/weather',
        matchPrefixes: ['/weather'],
      },
    ],
    [t]
  );

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenItem(null);
    setMobileAccordion(null);
  }, [pathname]);

  useEffect(() => {
    if (!openItem) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!navRootRef.current?.contains(e.target as Node)) setOpenItem(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenItem(null);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openItem]);

  useEffect(() => {
    return () => {
      if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);
    };
  }, []);

  // Desktop: show PrimaryNav at the top and while scrolling up; hide when scrolling down
  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollYRef.current;
      if (y <= 40) {
        setShowPrimaryNav(true);
      } else if (delta > 8) {
        setShowPrimaryNav(false);
        setOpenItem(null);
      } else if (delta < -8) {
        setShowPrimaryNav(true);
      }
      lastScrollYRef.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleHoverEnter = (label: string) => {
    if (hoverCloseRef.current) {
      clearTimeout(hoverCloseRef.current);
      hoverCloseRef.current = null;
    }
    setOpenItem(label);
  };

  const handleHoverLeave = () => {
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);
    hoverCloseRef.current = setTimeout(() => setOpenItem(null), 120);
  };

  const isActivePath = (prefixes: string[]) =>
    prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <>
      {/* Tier 2: MastheadTop — scrolls away on desktop, hidden on mobile */}
      <div className="bg-white font-sans-ed text-ed-ink antialiased max-md:hidden">
        <Container>
          <div className="flex items-center gap-6 border-b border-ed-rule py-2.5 font-serif-ed text-[12px] tracking-normal text-ed-ink-3">
            <div className="flex min-w-0 items-center gap-4">
              <span className="whitespace-nowrap">{today}</span>
              {weather.data?.current?.tempC != null && (
                <span className="inline-flex items-center gap-3 max-xl:hidden">
                  <span className="text-ed-rule-strong">|</span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <span>Alcala, Pangasinan</span>
                    <span className="text-ed-ink font-semibold">{Math.round(weather.data.current.tempC)}°C</span>
                  </span>
                </span>
              )}
            </div>
            <nav aria-label="Utility" className="ml-auto flex shrink-0 items-center gap-4">
              <Link to="/contact" className="text-ed-ink-3 no-underline hover:text-ed-navy">
                Contact
              </Link>
              <span className="text-ed-rule-strong">|</span>
              <Link to="/accessibility" className="text-ed-ink-3 no-underline hover:text-ed-navy">
                Accessibility
              </Link>
              <span className="text-ed-rule-strong">|</span>
              <Link to="/faq" className="text-ed-ink-3 no-underline hover:text-ed-navy">
                FAQ
              </Link>
              <span className="text-ed-rule-strong">|</span>
              <div className="relative inline-flex">
                <select
                  aria-label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'fil' | 'ilo')}
                  className="cursor-pointer border border-ed-rule-strong bg-white py-1 px-2.5 font-serif-ed text-[12px] text-ed-ink-3 transition-colors hover:border-ed-navy hover:text-ed-navy focus:border-ed-navy focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                  <option value="ilo">Ilocano</option>
                </select>
              </div>
            </nav>
          </div>
        </Container>
      </div>

      {/* Persistent Sticky Header (LogoRow + PrimaryNav + MobileMenu) */}
      <header className="sticky top-0 z-40 bg-white font-sans-ed text-ed-ink antialiased border-b-2 border-b-ed-ink shadow-md">
        <Container>
          {/* Tier 3: LogoRow */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-8 py-6 max-md:grid-cols-[auto_auto] max-md:justify-between max-md:gap-3 max-md:py-3">
          <Link to="/" aria-label="BetterAlcala home" className="inline-flex items-center gap-3 no-underline">
            <img
              src="/assets/images/logo/alcala-seal-v2.png"
              alt="Official Seal of the Municipality of Alcala — BetterAlcala Logo"
              width={48}
              height={48}
              className="block h-12 w-12 object-contain max-md:h-9 max-md:w-9"
            />
            <span className="flex flex-col leading-none">
              <span className="font-serif-ed text-[24px] font-bold tracking-[-0.025em] text-ed-ink max-md:text-[20px]">
                Better<span className="text-ed-navy">Alcala</span>
              </span>
              <span className="mt-1 font-mono-ed text-[10px] uppercase tracking-[0.14em] text-ed-ink-3">
                Alcala, Pangasinan
              </span>
            </span>
          </Link>

          <div className="border-l border-ed-rule pl-6 font-mono-ed text-[10px] uppercase leading-tight tracking-[0.16em] text-ed-ink-3 max-w-[320px] max-xl:hidden">
            The volunteer run civic portal of the Municipality of Alcala
          </div>

          <div className="flex items-center gap-3.5 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-ed-ink-3">
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              aria-label="Search BetterAlcala (Ctrl+K)"
              className="relative flex h-11 w-[220px] cursor-pointer items-center border border-ed-rule-strong bg-white pl-9 pr-3 text-left font-sans-ed text-sm normal-case tracking-normal text-ed-ink-4 transition-colors hover:border-ed-navy lg:w-[280px] xl:w-[320px] max-md:hidden"
            >
              <SearchIcon
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ed-ink-3"
              />
              <span className="truncate">Search services, ordinances…</span>
              <kbd className="ml-auto border border-ed-rule bg-ed-paper-2 px-1.5 py-0.5 font-mono-ed text-[10px] text-ed-ink-3">
                ⌘K
              </kbd>
            </button>

            <Button as={Link} to="/contact" className="max-lg:hidden">
              <MailIcon size={15} />
              <span>Contact us</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Toggle menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <XIcon size={16} /> : <MenuIcon size={16} />}
              <span>Menu</span>
            </Button>
          </div>
        </div>
      </Container>

      {/* Tier 4: PrimaryNav — positioned absolutely below LogoRow on desktop so toggling it causes 0px layout shift */}
      <nav
        ref={navRootRef}
        aria-hidden={!showPrimaryNav}
        className={cn(
          'border-t border-ed-rule bg-white transition-all duration-150 max-lg:hidden lg:absolute lg:left-0 lg:right-0 lg:top-full lg:border-b-2 lg:border-b-ed-ink lg:shadow-md',
          showPrimaryNav
            ? 'lg:translate-y-0 lg:opacity-100'
            : 'lg:-translate-y-2 lg:opacity-0 lg:pointer-events-none'
        )}
        aria-label="Primary"
      >
        <Container className="flex flex-wrap items-stretch justify-start">
          <Link
            to="/"
            className={cn(navItemBase, pathname === '/' && activeClasses)}
          >
            {t('nav-home') || 'Home'}
          </Link>

          {navItems.map((item) => {
            const active = isActivePath(item.matchPrefixes);
            const isOpen = openItem === item.label;

            if (!item.children) {
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(navItemBase, active && activeClasses)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleHoverEnter(item.label)}
                onMouseLeave={handleHoverLeave}
              >
                <button
                  type="button"
                  onClick={() => setOpenItem(isOpen ? null : item.label)}
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  className={cn(
                    navItemBase,
                    'cursor-pointer select-none border-0 bg-transparent',
                    (active || isOpen) && activeClasses
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronDownIcon
                    size={12}
                    className={cn('opacity-70 transition-transform', isOpen && 'rotate-180')}
                  />
                </button>
                {isOpen && (
                  <div
                    role="menu"
                    className="absolute left-[-1px] top-full z-[100] min-w-[420px] border border-ed-navy border-t-2 bg-white py-2 shadow-[0_12px_32px_rgba(8,40,110,0.14)]"
                  >
                    {item.children.map((child) =>
                      child.external ? (
                        <a
                          key={child.label}
                          href={child.to}
                          target="_blank"
                          rel="noreferrer"
                          role="menuitem"
                          onClick={() => setOpenItem(null)}
                          className="block px-6 py-3.5 font-serif-ed text-base leading-snug text-ed-ink no-underline transition-colors hover:bg-ed-navy-tint"
                        >
                          <span className="block text-[17px] font-semibold text-ed-navy-ink">
                            {child.label} ↗
                          </span>
                          {child.blurb && (
                            <span className="mt-0.5 block font-sans-ed text-xs normal-case text-ed-ink-3">
                              {child.blurb}
                            </span>
                          )}
                        </a>
                      ) : (
                        <Link
                          key={child.label}
                          to={child.to}
                          role="menuitem"
                          onClick={() => setOpenItem(null)}
                          className="block px-6 py-3.5 font-serif-ed text-base leading-snug text-ed-ink no-underline transition-colors hover:bg-ed-navy-tint"
                        >
                          <span className="block text-[17px] font-semibold text-ed-navy-ink">
                            {child.label}
                          </span>
                          {child.blurb && (
                            <span className="mt-0.5 block font-sans-ed text-xs normal-case text-ed-ink-3">
                              {child.blurb}
                            </span>
                          )}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Link
            to="/news"
            className={cn(navItemBase, 'ml-auto max-xl:hidden', pathname.startsWith('/news') && activeClasses)}
          >
            News &amp; Advisories
          </Link>
        </Container>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100svh-64px)] overflow-y-auto border-t border-ed-rule bg-white py-2 pb-4 lg:hidden">
          <Container>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-between border-b border-ed-rule py-3.5 font-sans-ed text-[15px] font-medium text-ed-ink no-underline"
            >
              <span>{t('nav-home') || 'Home'}</span>
            </Link>

            {navItems.map((item) => {
              const open = mobileAccordion === item.label;
              if (!item.children) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-between border-b border-ed-rule py-3.5 font-sans-ed text-[15px] font-medium text-ed-ink no-underline"
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              }
              return (
                <div key={item.label} className="border-b border-ed-rule">
                  <button
                    type="button"
                    onClick={() => setMobileAccordion(open ? null : item.label)}
                    className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent px-0 py-3.5 text-left font-sans-ed text-[15px] font-medium text-ed-ink"
                  >
                    <span>{item.label}</span>
                    <ChevronDownIcon
                      size={14}
                      className={cn('transition-transform', open && 'rotate-180')}
                    />
                  </button>
                  {open && (
                    <div className="ml-1 flex flex-col border-l-2 border-ed-rule py-1 pl-3">
                      {item.children.map((child) =>
                        child.external ? (
                          <a
                            key={child.label}
                            href={child.to}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2 text-sm text-ed-ink-2 no-underline hover:text-ed-navy"
                          >
                            {child.label} ↗
                          </a>
                        ) : (
                          <Link
                            key={child.label}
                            to={child.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-3.5 py-2 text-sm text-ed-ink-2 no-underline hover:text-ed-navy"
                          >
                            {child.label}
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setCommandOpen(true);
              }}
              className="flex w-full cursor-pointer items-center justify-between border-0 border-b border-ed-rule bg-transparent px-0 py-3.5 text-left font-sans-ed text-[15px] font-medium text-ed-ink"
            >
              <span>Search</span>
              <SearchIcon size={14} />
            </button>

            <nav
              aria-label="Utility"
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 font-sans-ed text-sm text-ed-ink-2"
            >
              <Link to="/news" onClick={() => setMobileMenuOpen(false)} className="text-ed-ink-2 no-underline hover:text-ed-navy">
                News
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-ed-ink-2 no-underline hover:text-ed-navy">
                Contact
              </Link>
              <Link to="/accessibility" onClick={() => setMobileMenuOpen(false)} className="text-ed-ink-2 no-underline hover:text-ed-navy">
                Accessibility
              </Link>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="text-ed-ink-2 no-underline hover:text-ed-navy">
                FAQ
              </Link>
            </nav>

            <div className="mt-3">
              <div className="relative inline-flex">
                <select
                  aria-label="Language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'fil' | 'ilo')}
                  className="cursor-pointer border border-ed-rule-strong bg-white py-1.5 px-3 font-serif-ed text-[13px] text-ed-ink-3"
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                  <option value="ilo">Ilocano</option>
                </select>
              </div>
            </div>
          </Container>
        </div>
      )}

      <CommandSearchModal open={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
    {/* Static spacer matching desktop PrimaryNav height so initial y=0 layout never overlaps Hero */}
    <div className="h-[49px] bg-white max-lg:hidden" aria-hidden="true" />
    </>
  );
}
