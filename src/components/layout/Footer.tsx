import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, increment, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../contexts/LanguageContext';
import Container from '../v2/ui/Container';
import Flag from '../v2/ui/Flag';

const VISIT_SESSION_KEY = 'betteralcala_visit_counted';
let visitRecordedInMemory = false;

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

function FooterCol({ heading, links }: { heading: string; links: FooterLinkItem[] }) {
  return (
    <div>
      <h3 className="mb-[18px] font-mono-ed text-[11px] font-medium uppercase tracking-[0.14em] text-white">
        {heading}
      </h3>
      <ul className="m-0 list-none p-0">
        {links.map((l) => (
          <li key={l.label} className="mb-2.5">
            {l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="text-white/80 no-underline hover:text-white hover:underline"
              >
                {l.label}
              </a>
            ) : (
              <Link
                to={l.href}
                className="text-white/80 no-underline hover:text-white hover:underline"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const [version, setVersion] = useState('1.0.0');
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/version.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.version) setVersion(data.version);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const metricsRef = doc(db, 'siteMetrics', 'visitors');

    const unsubscribe = onSnapshot(
      metricsRef,
      (snap) => {
        const count = snap.data()?.count;
        if (typeof count === 'number' && Number.isFinite(count)) {
          setVisitorCount(count);
        }
      },
      () => {}
    );

    const alreadyCounted =
      visitRecordedInMemory ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(VISIT_SESSION_KEY) === '1');

    if (!alreadyCounted) {
      visitRecordedInMemory = true;
      try {
        sessionStorage.setItem(VISIT_SESSION_KEY, '1');
      } catch {}
      setDoc(
        metricsRef,
        { count: increment(1), updatedAt: serverTimestamp() },
        { merge: true }
      ).catch(() => {});
    }

    return () => unsubscribe();
  }, []);

  const servicesCol: FooterLinkItem[] = [
    { label: 'All Municipal Services', href: '/services' },
    { label: 'Certificates & Civil Registry', href: '/services/certificates' },
    { label: 'Business & Permits', href: '/services/business' },
    { label: 'Tax Payments', href: '/services/tax-payments' },
    { label: 'Social Services (MSWDO)', href: '/services/social-services' },
    { label: 'Health & RHU', href: '/services/health' },
  ];

  const governmentCol: FooterLinkItem[] = [
    { label: 'Municipal Government', href: '/government' },
    { label: 'Elected Officials', href: '/officials' },
    { label: 'Sangguniang Bayan', href: '/legislative' },
    { label: 'Ordinance Framework', href: '/legislative/ordinance-framework' },
    { label: 'Municipal Statistics', href: '/statistics' },
    { label: 'Budget Portal', href: 'https://budget.betteralcala.org/', external: true },
  ];

  const resourcesCol: FooterLinkItem[] = [
    { label: 'News & Announcements', href: '/news' },
    { label: 'Weather & Advisories', href: '/weather' },
    { label: 'Emergency Hotlines', href: '/contact#hotlines' },
    { label: 'Open Data Philippines', href: 'https://data.gov.ph', external: true },
    { label: 'Freedom of Information', href: 'https://www.foi.gov.ph/', external: true },
    { label: 'Province of Pangasinan', href: 'https://www.pangasinan.gov.ph/', external: true },
  ];

  const aboutCol: FooterLinkItem[] = [
    { label: 'BetterGov.ph Initiative', href: 'https://bettergov.ph/', external: true },
    { label: 'GitHub Repository', href: 'https://github.com/melmarj0nes23/betteralcala', external: true },
    { label: 'Frequently Asked Questions', href: '/faq' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Sitemap', href: '/sitemap' },
  ];

  return (
    <footer className="mt-20 bg-ed-navy-ink pb-7 pt-[60px] font-sans-ed text-[13px] text-white/75 max-md:mt-12 max-md:pb-6 max-md:pt-10">
      <Container>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 border-b border-white/10 pb-12 max-lg:grid-cols-[1fr_1fr_1fr] max-md:grid-cols-[1fr_1fr] max-md:gap-7 max-md:pb-8 max-[480px]:grid-cols-1">
          <div className="max-md:col-span-full">
            <Link to="/" className="inline-flex items-center gap-3 no-underline">
              <img
                src="/assets/images/logo/alcala-seal-v2.png"
                alt="BetterAlcala logo"
                width={44}
                height={44}
                loading="lazy"
                className="block h-11 w-11 object-contain"
              />
              <span className="flex flex-col leading-none">
                <span className="font-serif-ed text-xl font-bold tracking-[-0.02em] text-white">
                  BetterAlcala
                </span>
                <span className="mt-1 font-mono-ed text-[10px] uppercase tracking-[0.14em] text-white/65">
                  Alcala, Pangasinan · BetterLGU
                </span>
              </span>
            </Link>
            <p className="mt-4 max-w-[340px] leading-relaxed text-white/60">
              {t('footer-tagline')}
            </p>
            <p className="mt-3 max-w-[340px] leading-relaxed text-white/60">
              Built by BetterAlcala volunteers under the BetterGov.ph open-source civic movement. Cost to the people of Alcala: <strong className="text-white">₱0</strong>.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Flag variant="outline" className="border-white/25 text-white/70">
                v{version}
              </Flag>
              <Flag variant="outline" className="border-white/25 text-white/70">
                Open Source
              </Flag>
              {visitorCount !== null && (
                <Flag variant="outline" className="border-white/25 text-white/70 tabular-nums">
                  {visitorCount.toLocaleString()} Visits
                </Flag>
              )}
            </div>
          </div>

          <FooterCol heading="Services" links={servicesCol} />
          <FooterCol heading="Government" links={governmentCol} />
          <FooterCol heading="Resources" links={resourcesCol} />
          <FooterCol heading="About" links={aboutCol} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-white/70 max-md:text-[10px]">
          <span>
            © {currentYear} BetterAlcala · MIT · CC BY 4.0
          </span>
          <span>
            Independent civic portal · Not an official LGU website
          </span>
        </div>
      </Container>
    </footer>
  );
}
