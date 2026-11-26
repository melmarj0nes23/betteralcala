import { FC, Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActivityIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  ClockIcon,
  FileTextIcon,
  LandmarkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import SearchAutocomplete from '../components/SearchAutocomplete';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Eyebrow from '../components/v2/ui/Eyebrow';
import Flag from '../components/v2/ui/Flag';
import Button from '../components/v2/ui/Button';
import ArrowLink from '../components/v2/ui/ArrowLink';
import Dropcap from '../components/v2/ui/Dropcap';
import { useLanguage } from '../contexts/LanguageContext';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { ALCALA_QUIZ_QUESTIONS, NEWS_ITEMS } from '../data/communityData';
import { isValidCitation, useCivicDataset } from '../hooks/useCivicDataset';
import { useDetailedWeather } from '../hooks/useDetailedWeather';
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

const HERO_CHIPS = [
  { label: 'Birth Certificate', to: '/services/certificates' },
  { label: 'Business Permit', to: '/services/business' },
  { label: 'Real Property Tax', to: '/services/tax-payments' },
];

const HERO_TILES = [
  { label: 'Certificates & IDs', icon: FileTextIcon, to: '/services/certificates' },
  { label: 'Business & Permits', icon: BriefcaseIcon, to: '/services/business' },
  { label: 'Tax Payments', icon: LandmarkIcon, to: '/services/tax-payments' },
  { label: 'Health & RHU', icon: ActivityIcon, to: '/services/health' },
];

const SERVICE_CATEGORIES = [
  {
    title: 'Certificates & Civil Registry',
    sub: 'Birth, Marriage, Death Certificates, Local Civil Registrar',
    to: '/services/certificates',
  },
  {
    title: 'Business & Permits',
    sub: 'BPLO, Mayor’s Permit, BOSS Renewal, Barangay Clearance',
    to: '/services/business',
  },
  {
    title: 'Tax Payments & Treasury',
    sub: 'Real Property Tax (RPT), Community Tax, Market Fees',
    to: '/services/tax-payments',
  },
  {
    title: 'Social Services (MSWDO)',
    sub: 'AICS, Senior Citizen ID, PWD & Solo Parent Support',
    to: '/services/social-services',
  },
  {
    title: 'Health & RHU',
    sub: 'Alcala Rural Health Unit, Vaccinations, Sanitary Permits',
    to: '/services/health',
  },
  {
    title: 'Agriculture & Farmer Support',
    sub: 'RSBSA Registration, Seed & Fertilizer Assistance, MAO',
    to: '/services/agriculture',
  },
  {
    title: 'Building & Construction',
    sub: 'Building Permit, Zoning Clearance, Occupancy Certificate',
    to: '/services/infrastructure',
  },
  {
    title: 'Employment Assistance (PESO)',
    sub: 'Job Placement, SPES, Livelihood & Skills Referral',
    to: '/services/education',
  },
  {
    title: 'Disaster Risk & Safety',
    sub: 'MDRRMO Advisories, Evacuation Centers, Emergency Response',
    to: '/services/public-safety',
  },
  {
    title: 'Environment & Solid Waste',
    sub: 'MENRO Clearances, Collection Schedule, Tree Planting',
    to: '/services/environment',
  },
];

const ALSO_TRENDING = [
  { agency: 'Treasury', title: 'Real Property Tax Assessment & Payment', to: '/services/tax-payments' },
  { agency: 'MSWDO', title: 'Assistance to Individuals in Crisis (AICS)', to: '/services/social-services' },
  { agency: 'Alcala RHU', title: 'Sanitary Permit & Health Certificate', to: '/services/health' },
  { agency: 'Engineering', title: 'Building & Zoning Clearance', to: '/services/infrastructure' },
  { agency: 'Sangguniang Bayan', title: 'Municipal Ordinances & Resolutions', to: '/legislative' },
];

const HOME_HOTLINES = [
  { name: 'National Emergency', number: '911', tel: '911' },
  { name: 'MDRRMO Alcala', number: '0920-9817724', tel: '09209817724' },
  { name: 'Alcala Police (PNP)', number: '0905-3712249', tel: '09053712249' },
  { name: 'Alcala Fire (BFP)', number: '0917-1893611', tel: '09171893611' },
  { name: 'Municipal Hall', number: '(075) 632-5938', tel: '+63756325938' },
];

const MUNICIPAL_BUDGET_YEARS = [
  { year: 'FY 2022', amount: '₱207.25M', value: 207.25, delta: null as string | null, positive: true },
  { year: 'FY 2023', amount: '₱182.29M', value: 182.29, delta: '(-12.0%)', positive: false },
  { year: 'FY 2024', amount: '₱193.59M', value: 193.59, delta: '(+6.2%)', positive: true },
  { year: 'FY 2025', amount: '₱230.31M', value: 230.31, delta: '(+19.0%)', positive: true },
  { year: 'FY 2026', amount: '₱260.23M', value: 260.23, delta: '(+13.0%)', positive: true },
];

const Sunburst: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false" className={className}>
    <circle r="22" fill="none" stroke="currentColor" strokeWidth="3" />
    {Array.from({ length: 16 }, (_, i) => (
      <path
        key={i}
        d={
          i % 2
            ? 'M -2.5 -30 L 2.5 -30 L 1.5 -68 L -1.5 -68 Z'
            : 'M -4 -30 L 4 -30 L 2 -97 L -2 -97 Z'
        }
        transform={`rotate(${i * 22.5})`}
        fill="currentColor"
      />
    ))}
  </svg>
);

export default function HomePage() {
  const { t } = useLanguage();
  const weather = useDetailedWeather();
  const newsItems = useCivicDataset('news.json', 'news', NEWS_ITEMS, isValidNewsItem);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const featuredNews = newsItems[0];
  const secondaryNews = newsItems.slice(1, 5);
  const maxBudgetValue = 260.23;

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
      {/* Band 1: Hero (Original .t-blueprint + .fs-rays background with design.md 2-col split) */}
      <section className="t-blueprint ed-hero-keep-radius relative overflow-hidden py-16 text-white max-md:py-7">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="fs-rays">
            <svg viewBox="-1000 -1000 2000 2000">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <polygon transform="rotate(0)" points="-6,-190 6,-190 32,-960 -32,-960" />
                  <polygon transform="rotate(-8)" points="-6,-190 6,-190 20,-780 -20,-780" />
                  <polygon transform="rotate(8)" points="-6,-190 6,-190 20,-780 -20,-780" />
                </g>
              ))}
              <circle r="150" />
            </svg>
          </div>
        </div>
        <Container className="relative z-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 max-md:gap-5">
            <div className="animate-fade-in">
              <h1 className="mb-4 font-serif-ed text-3xl font-bold leading-none text-white md:text-4xl lg:text-5xl max-md:mb-2.5 max-md:text-[26px]">
                Welcome to BetterAlcala.org
              </h1>
              <p className="mb-8 max-w-lg font-sans-ed text-lg text-blue-200 max-md:mb-4 max-md:text-[15px] max-md:leading-snug">
                {t('hero-subtitle')}
              </p>
              <div className="ed-hero-search mb-8 max-md:mb-3 text-ed-ink">
                <SearchAutocomplete placeholder="Try: birth certificate, business permit, budget…" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 max-md:mt-0 max-md:gap-1.5">
                {HERO_CHIPS.map((chip) => (
                  <Link
                    key={chip.label}
                    to={chip.to}
                    className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white no-underline transition-colors hover:bg-white/20 max-md:px-3 max-md:py-1.5 max-md:text-[13px]"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="animate-slide-in rounded-xl bg-white/10 p-6 shadow-lg backdrop-blur-xs max-md:p-3.5">
              <h2 className="mb-4 font-serif-ed text-2xl font-bold text-white max-md:mb-2.5 max-md:text-lg">
                {t('section-popular') || 'Popular Services'}
              </h2>
              <div className="grid grid-cols-2 gap-4 max-md:gap-2">
                {HERO_TILES.map((tile) => (
                  <Link
                    key={tile.label}
                    to={tile.to}
                    className="flex flex-col items-center rounded-lg bg-white/10 p-4 text-center text-white no-underline transition-colors duration-200 hover:bg-white/20 max-md:flex-row max-md:gap-2.5 max-md:p-2.5 max-md:text-left"
                  >
                    <div className="mb-3 rounded-full bg-primary-500 p-3 max-md:mb-0 max-md:p-2">
                      <tile.icon className="h-6 w-6 text-white max-md:h-4 max-md:w-4" />
                    </div>
                    <span className="font-medium max-md:text-[13px] max-md:leading-tight">
                      {tile.label}
                    </span>
                  </Link>
                ))}
              </div>
              <Link
                to="/services"
                className="mt-4 block w-full rounded-lg bg-white/10 p-4 text-center text-white no-underline transition-colors duration-200 hover:bg-white/20 max-md:mt-2 max-md:p-2.5 max-md:text-sm"
              >
                {t('btn-view-all-services') || 'View All Services'}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Band 2: Service Categories Grid */}
      <section className="mt-16 max-md:mt-8">
        <Container>
          <SectionHeader
            label="Municipal services by category"
            meta={`${SERVICE_CATEGORIES.length} service domains · Alcala, Pangasinan`}
          />
          <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] max-md:grid-cols-2 max-md:gap-2.5">
            {SERVICE_CATEGORIES.map((c) => (
              <Link
                key={c.title}
                to={c.to}
                className="relative block min-h-[180px] border border-ed-rule bg-white p-6 text-ed-ink no-underline transition-colors hover:border-ed-ink max-md:min-h-0 max-md:p-3"
              >
                <h3 className="font-serif-ed text-2xl font-bold text-ed-ink max-md:text-base max-md:leading-tight">
                  {c.title}
                </h3>
                <p className="mt-2.5 text-[13px] leading-normal text-ed-ink-2 max-md:mt-1 max-md:line-clamp-2 max-md:text-[11px]">
                  {c.sub}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ed-navy max-md:mt-2 max-md:text-[11px]">
                  Explore <ArrowRightIcon size={14} />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Band 3: BetterGov Movement / Alcala at a Glance (bg-ed-navy-ink + Sunburst) */}
      <section className="relative mt-16 overflow-hidden bg-ed-navy-ink py-20 text-white max-md:mt-8 max-md:py-10">
        <Sunburst className="pointer-events-none absolute -bottom-[440px] -right-[340px] h-[880px] w-[880px] text-white/[0.06] max-md:-bottom-48 max-md:-right-44 max-md:h-[420px] max-md:w-[420px]" />
        <Container className="relative">
          <div className="mb-8 max-md:mb-4">
            <SectionHeader
              onDark
              label={t('home-at-a-glance') || 'Alcala at a glance'}
              meta={
                <Link
                  to="/statistics"
                  className="text-white/80 no-underline hover:text-white"
                >
                  View municipal statistics →
                </Link>
              }
            />
          </div>
          <div className="grid grid-cols-[1fr_1.1fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10 max-md:gap-6">
            <div>
              <Eyebrow tone="onDark">
                Alcala, Pangasinan · PSGC {MUNICIPAL_PROFILE.psgcCode}
              </Eyebrow>
              <h2 className="mt-2 font-serif-ed text-[clamp(32px,3.6vw,44px)] font-bold leading-[1.05] tracking-[-0.02em] text-white max-md:text-[26px]">
                Built by volunteers, in the open
              </h2>
              <p className="mt-4 max-w-[480px] font-sans-ed text-[17px] leading-relaxed text-white/80 max-md:mt-2.5 max-md:text-[14px] max-md:leading-snug">
                BetterAlcala is a volunteer-driven civic technology portal under the BetterGov.ph BetterLGU initiative, making municipal services, budgets, and ordinances easy to find and verify.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 max-md:mt-5">
                <Button
                  as={Link}
                  to="/statistics"
                  className="!border-white !bg-white !text-ed-navy-ink hover:!border-ed-navy-tint hover:!bg-ed-navy-tint"
                >
                  <span>Explore Barangay Data</span>
                  <ArrowUpRightIcon size={15} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetQuiz();
                    setQuizOpen(true);
                  }}
                  className="border-white/70 text-white hover:border-white hover:bg-white hover:text-ed-navy-ink"
                >
                  <span>{t('quiz-take') || 'Take Heritage Quiz'}</span>
                </Button>
              </div>
            </div>
            <div>
              <dl className="grid grid-cols-3 divide-x divide-white/15 border-y border-white/30 max-sm:grid-cols-1 max-sm:divide-x-0 max-sm:divide-y">
                <div className="flex flex-col px-5 py-6 first:pl-0 max-sm:px-0 max-sm:py-4">
                  <dt className="mt-2 font-sans-ed text-sm leading-snug text-white/75">
                    2024 Census Population
                  </dt>
                  <dd className="order-first m-0 font-serif-ed text-[40px] font-bold leading-none tracking-[-0.02em] text-white tabular-nums max-md:text-[32px]">
                    {MUNICIPAL_PROFILE.population2024.toLocaleString()}
                  </dd>
                </div>
                <div className="flex flex-col px-5 py-6 max-sm:px-0 max-sm:py-4">
                  <dt className="mt-2 font-sans-ed text-sm leading-snug text-white/75">
                    Administrative Barangays
                  </dt>
                  <dd className="order-first m-0 font-serif-ed text-[40px] font-bold leading-none tracking-[-0.02em] text-white tabular-nums max-md:text-[32px]">
                    {MUNICIPAL_PROFILE.barangayCount}
                  </dd>
                </div>
                <div className="flex flex-col px-5 py-6 max-sm:px-0 max-sm:py-4">
                  <dt className="mt-2 font-sans-ed text-sm leading-snug text-white/75">
                    Total Land Area (km²)
                  </dt>
                  <dd className="order-first m-0 font-serif-ed text-[40px] font-bold leading-none tracking-[-0.02em] text-white tabular-nums max-md:text-[32px]">
                    {MUNICIPAL_PROFILE.landAreaKm2}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 font-mono-ed text-[11px] uppercase tracking-[0.08em] text-white/60">
                5th District of Pangasinan · Est. 1875 · 3rd Class Municipality
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Band 4: Most Requested (3-Column Broadsheet Grid) */}
      <section className="mt-20 max-md:mt-8">
        <Container>
          <SectionHeader
            label="Most requested services"
            meta="Verified municipal procedures · Alcala, Pangasinan"
          />
          <div className="grid grid-cols-[1.4fr_1fr_1fr] border border-ed-rule bg-white max-lg:grid-cols-1">
            <Link
              to="/services/certificates"
              className="block border-r border-ed-rule p-10 text-ed-ink no-underline max-lg:border-b max-lg:border-r-0 max-md:p-4"
            >
              <Flag variant="red">Most Searched</Flag>
              <div className="mt-6 font-mono-ed text-[10px] uppercase tracking-[0.16em] text-ed-ink-3 max-md:mt-3">
                Local Civil Registrar · Municipal Hall
              </div>
              <h2 className="mt-3.5 font-serif-ed text-[clamp(30px,3.4vw,42px)] font-bold leading-[1.05] tracking-[-0.01em] text-ed-ink max-md:mt-2 max-md:text-[22px]">
                Certificates &amp; Civil Registry
              </h2>
              <p className="mt-4 max-w-[520px] font-sans-ed text-[17px] leading-relaxed text-ed-ink-2 max-md:mt-2 max-md:text-[14px] max-md:leading-snug">
                Requirements, fees, and step-by-step filing for birth, marriage, and death certificates at Alcala Municipal Hall.
              </p>
              <div className="mt-6 flex flex-wrap gap-6 font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3 max-md:mt-4 max-md:gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon size={14} /> Same-day release
                </span>
                <span>Walk-in · Mon–Fri</span>
                <span>8:00 AM – 5:00 PM</span>
              </div>
            </Link>

            <div className="flex flex-col border-r border-ed-rule max-lg:border-b max-lg:border-r-0">
              <Link
                to="/services/business"
                className="flex flex-1 flex-col border-b border-ed-rule p-8 text-ed-ink no-underline max-md:p-4"
              >
                <Eyebrow>BPLO · BOSS</Eyebrow>
                <h3 className="mt-3 font-serif-ed text-[28px] font-bold leading-[1.1] tracking-[-0.01em] text-ed-ink max-md:mt-1.5 max-md:text-[19px]">
                  Business Permits &amp; Licensing
                </h3>
                <p className="mt-2.5 flex-1 text-[13px] leading-normal text-ed-ink-2 max-md:mt-1.5 max-md:text-xs">
                  New business applications, annual renewals, barangay clearances, and sanitary/fire endorsements.
                </p>
                <div className="mt-4 flex gap-4 border-t border-ed-rule pt-3.5 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-ed-ink-3 max-md:mt-3 max-md:pt-2.5 max-md:text-[10px]">
                  <span>1–3 days</span>
                  <span>·</span>
                  <span>Municipal Hall</span>
                </div>
              </Link>
              <Link
                to="/services/social-services"
                className="flex flex-1 flex-col p-8 text-ed-ink no-underline max-md:p-4"
              >
                <Eyebrow>MSWDO</Eyebrow>
                <h3 className="mt-3 font-serif-ed text-[28px] font-bold leading-[1.1] tracking-[-0.01em] text-ed-ink max-md:mt-1.5 max-md:text-[19px]">
                  Social Welfare &amp; AICS
                </h3>
                <p className="mt-2.5 flex-1 text-[13px] leading-normal text-ed-ink-2 max-md:mt-1.5 max-md:text-xs">
                  Medical, burial, and educational assistance, plus Senior Citizen, PWD, and Solo Parent IDs.
                </p>
                <div className="mt-4 flex gap-4 border-t border-ed-rule pt-3.5 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-ed-ink-3 max-md:mt-3 max-md:pt-2.5 max-md:text-[10px]">
                  <span>Free</span>
                  <span>·</span>
                  <span>Priority Desk</span>
                </div>
              </Link>
            </div>

            <div className="bg-ed-paper-2 p-8 max-md:p-4">
              <Eyebrow className="text-ed-ink-2">Also Trending</Eyebrow>
              <div className="mt-4 max-md:mt-2">
                {ALSO_TRENDING.map((s, i) => (
                  <Link
                    key={s.title}
                    to={s.to}
                    className={`block py-3.5 text-ed-ink no-underline max-md:py-2 ${
                      i < ALSO_TRENDING.length - 1 ? 'border-b border-ed-rule' : ''
                    }`}
                  >
                    <div className="font-mono-ed text-[10px] uppercase tracking-[0.14em] text-ed-ink-3">
                      {s.agency}
                    </div>
                    <div className="mt-0.5 font-serif-ed text-base leading-tight max-md:text-[14px]">
                      {s.title}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 max-md:mt-4">
                <ArrowLink to="/services">Browse all services</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Band 5: News & Hotlines / Weather Sidebar */}
      <section className="mt-20 max-md:mt-8">
        <Container>
          <SectionHeader
            label={t('section-news') || 'News & announcements'}
            meta={
              <Link to="/news" className="text-ed-navy no-underline hover:text-ed-red">
                {t('home-view-all-news') || 'View all news →'}
              </Link>
            }
          />
          <div className="grid grid-cols-[1.6fr_1fr] gap-12 max-lg:grid-cols-1 max-lg:gap-10 max-md:gap-6">
            <div>
              {featuredNews && (
                <Link
                  to="/news"
                  className="block border-b border-ed-ink pb-8 text-ed-ink no-underline max-md:pb-4"
                >
                  <div className="flex flex-wrap items-baseline gap-3">
                    <Flag variant="navy">{featuredNews.category}</Flag>
                    <span className="font-mono-ed text-[11px] tracking-[0.12em] text-ed-ink-3">
                      {featuredNews.date}
                    </span>
                    <span className="font-mono-ed text-[11px] tracking-[0.12em] text-ed-ink-3">
                      · {featuredNews.originType}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif-ed text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.05] tracking-[-0.01em] text-ed-ink max-md:mt-2 max-md:text-[22px]">
                    {featuredNews.title}
                  </h2>
                  <Dropcap className="mt-4 max-w-[680px] font-sans-ed text-[17px] leading-relaxed text-ed-ink-2 max-md:mt-2 max-md:text-[14px] max-md:leading-snug">
                    {featuredNews.summary}
                  </Dropcap>
                </Link>
              )}

              <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-8 max-sm:grid-cols-1 max-md:mt-4 max-md:gap-y-4">
                {secondaryNews.map((n) => (
                  <Link key={n.id} to="/news" className="block text-ed-ink no-underline">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <Eyebrow tone="navy">{n.category}</Eyebrow>
                      <span className="font-mono-ed text-[11px] tracking-[0.12em] text-ed-ink-3">
                        {n.date}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif-ed text-[22px] font-semibold leading-tight tracking-[-0.005em] text-ed-ink max-md:mt-1 max-md:text-[17px]">
                      {n.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>

            <aside>
              {/* Navy Weather & Municipal Info Card */}
              <div className="bg-ed-navy p-8 text-white max-md:p-4">
                <Eyebrow tone="onDark">Alcala, Pangasinan · Live</Eyebrow>
                <h3 className="mt-2 font-serif-ed text-[28px] font-bold tracking-[-0.01em] text-white max-md:mt-1 max-md:text-[21px]">
                  Weather &amp; Municipal Hall
                </h3>
                <div className="mt-6 border-t border-white/20 max-md:mt-3">
                  <div className="grid grid-cols-[90px_1fr] items-baseline gap-3 border-b border-white/10 py-3.5">
                    <div className="font-mono-ed text-[10px] uppercase tracking-[0.14em] text-white/65">
                      Temp
                    </div>
                    <div className="font-serif-ed text-xl font-semibold text-white tabular-nums">
                      {weather.data?.current?.tempC != null ? `${Math.round(weather.data.current.tempC)}°C` : '30°C'}
                    </div>
                  </div>
                  <div className="grid grid-cols-[90px_1fr] items-baseline gap-3 border-b border-white/10 py-3.5">
                    <div className="font-mono-ed text-[10px] uppercase tracking-[0.14em] text-white/65">
                      Hours
                    </div>
                    <div className="font-serif-ed text-[15px] text-white">
                      Mon–Fri, 8:00 AM – 5:00 PM
                    </div>
                  </div>
                  <div className="grid grid-cols-[90px_1fr] items-baseline gap-3 border-b border-white/10 py-3.5">
                    <div className="font-mono-ed text-[10px] uppercase tracking-[0.14em] text-white/65">
                      Address
                    </div>
                    <div className="font-serif-ed text-[15px] text-white">
                      Poblacion East, Alcala
                    </div>
                  </div>
                </div>
                <Link
                  to="/weather"
                  className="mt-6 inline-flex items-center gap-1.5 border-b border-white/50 pb-0.5 text-[13px] text-white no-underline max-md:mt-3.5"
                >
                  View full Alcala forecast →
                </Link>
              </div>

              {/* Emergency Hotlines Card (911 in ed-red on row 0) */}
              <div className="mt-6 border border-ed-rule bg-white p-7 max-md:mt-3 max-md:p-4">
                <Eyebrow>Emergency &amp; Assistance</Eyebrow>
                <h3 className="mt-1.5 font-serif-ed text-xl font-semibold text-ed-ink">
                  Alcala Hotlines
                </h3>
                <div className="mt-4 grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2.5 max-md:mt-2.5 max-md:gap-y-1.5">
                  {HOME_HOTLINES.map((h, i) => (
                    <Fragment key={h.name}>
                      <span className="text-sm text-ed-ink-2">{h.name}</span>
                      <a
                        href={`tel:${h.tel}`}
                        className={`font-mono-ed text-sm font-medium no-underline hover:underline ${
                          i === 0 ? 'text-ed-red' : 'text-ed-ink'
                        }`}
                      >
                        {h.number}
                      </a>
                    </Fragment>
                  ))}
                </div>
                <div className="mt-6 max-md:mt-3.5">
                  <ArrowLink to="/contact">All hotlines &amp; directory</ArrowLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Band 6: Transparency Strip (border-y border-ed-navy bg-ed-paper-2) */}
      <section className="mt-20 border-y border-ed-navy bg-ed-paper-2 py-[60px] max-md:mt-8 max-md:py-6">
        <Container>
          <div className="mb-8 max-md:mb-4">
            <SectionHeader
              label="Municipal Budget (5-Year Growth)"
              meta={
                <a
                  href="https://budget.betteralcala.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-ed-navy no-underline hover:text-ed-red"
                >
                  budget.betteralcala.org ↗
                </a>
              }
            />
          </div>

          <div className="grid grid-cols-[1fr_1.4fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10 max-md:gap-5">
            <div>
              <Eyebrow>FY 2022–2026 · Municipal Budget</Eyebrow>
              <h2 className="mt-2 font-serif-ed text-[clamp(36px,4vw,48px)] font-bold leading-none tracking-[-0.02em] text-ed-navy tabular-nums max-md:text-[30px]">
                +25.6%
                <span className="text-2xl font-semibold text-ed-ink-3"> approved municipal budget growth</span>
              </h2>
              <p className="mt-4 max-w-[460px] font-sans-ed text-[15px] leading-relaxed text-ed-ink-2 max-md:mt-2.5 max-md:text-[14px] max-md:leading-snug">
                BLGF Actuals (2022–2025): ₱1.16B receipts · ₱877.37M spent (₱195.71M Capital Outlay); +₱243.52M supplemental; COA Qualified Opinion (₱0 disallowances).
              </p>
              <div className="mt-6 flex flex-wrap gap-3 max-md:mt-4">
                <Button as="a" href="https://budget.betteralcala.org/" target="_blank" rel="noreferrer">
                  <span>Explore Municipal Budget &amp; Docs</span>
                  <ArrowUpRightIcon size={14} />
                </Button>
              </div>
            </div>

            <div>
              <div className="border-y border-ed-navy">
                {MUNICIPAL_BUDGET_YEARS.map((row) => (
                  <div
                    key={row.year}
                    className="grid grid-cols-[84px_1fr_165px] items-center gap-4 border-b border-ed-rule py-3.5 last:border-b-0 max-md:grid-cols-[72px_1fr_135px] max-md:gap-2.5 max-md:py-2.5"
                  >
                    <div className="font-mono-ed text-[13px] font-medium text-ed-ink-2 tabular-nums">
                      {row.year}
                    </div>
                    <div className="relative h-2 bg-ed-paper-3">
                      <div
                        className="absolute inset-y-0 left-0 bg-ed-navy"
                        style={{ width: `${Math.round((row.value / maxBudgetValue) * 100)}%` }}
                      />
                    </div>
                    <div className="text-right font-mono-ed text-[13px] font-medium text-ed-ink tabular-nums whitespace-nowrap">
                      <span>{row.amount}</span>
                      {row.delta && (
                        <span className={row.positive ? 'ml-1.5 text-success-700' : 'ml-1.5 text-ed-red'}>
                          {row.delta}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Band 7: Contact Strip */}
      <section className="mt-20 max-md:mt-8">
        <Container>
          <SectionHeader
            label={t('section-contact') || 'Contact Municipal Hall'}
            meta={<ArrowLink to="/contact">{t('home-view-all') || 'Full contact directory'}</ArrowLink>}
          />
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-md:gap-3">
            <div className="border border-ed-rule bg-white p-6">
              <div className="flex items-center gap-2 font-mono-ed text-[11px] uppercase tracking-[0.14em] text-ed-ink-3">
                <PhoneIcon size={14} aria-hidden /> {t('contact-phone') || 'Trunkline'}
              </div>
              <a
                href="tel:+63756325938"
                className="mt-3 block font-serif-ed text-xl font-semibold text-ed-ink no-underline hover:text-ed-navy"
              >
                (075) 632-5938
              </a>
              <p className="mt-1 text-xs text-ed-ink-3">{t('contact-hours')}</p>
            </div>
            <div className="border border-ed-rule bg-white p-6">
              <div className="flex items-center gap-2 font-mono-ed text-[11px] uppercase tracking-[0.14em] text-ed-ink-3">
                <MailIcon size={14} aria-hidden /> {t('contact-email') || 'Official Email'}
              </div>
              <a
                href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`}
                className="mt-3 block break-all font-serif-ed text-xl font-semibold text-ed-navy no-underline hover:text-ed-red"
              >
                {MUNICIPAL_PROFILE.hallEmail}
              </a>
              <p className="mt-1 text-xs text-ed-ink-3">Official LGU Alcala Email</p>
            </div>
            <div className="border border-ed-rule bg-white p-6">
              <div className="flex items-center gap-2 font-mono-ed text-[11px] uppercase tracking-[0.14em] text-ed-ink-3">
                <MapPinIcon size={14} aria-hidden /> {t('contact-address') || 'Address'}
              </div>
              <div className="mt-3 font-serif-ed text-xl font-semibold text-ed-ink">
                Poblacion East, Municipal Hall
              </div>
              <p className="mt-1 text-xs text-ed-ink-3">Alcala, 2425 Pangasinan</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Interactive Quiz Modal (Square-cornered editorial treatment) */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="alcala-quiz-modal-title"
        >
          <div className="w-full max-w-lg border border-ed-ink bg-white p-6">
            <div className="mb-4 flex items-center justify-between border-b border-ed-rule pb-3">
              <h3 id="alcala-quiz-modal-title" className="m-0 font-serif-ed text-lg font-bold text-ed-ink">
                Alcala, Pangasinan Civic Quiz
              </h3>
              <button
                type="button"
                onClick={() => setQuizOpen(false)}
                aria-label="Close quiz"
                className="cursor-pointer border border-ed-rule bg-white px-2.5 py-1 font-mono-ed text-xs text-ed-ink-3 hover:border-ed-ink hover:text-ed-ink"
              >
                ✕
              </button>
            </div>

            {!quizFinished ? (
              <div>
                <p className="mb-2 font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3">
                  Question {quizStep + 1} of {ALCALA_QUIZ_QUESTIONS.length} · Score: {score}
                </p>
                <h4 className="mb-4 font-serif-ed text-lg font-semibold text-ed-ink">
                  {ALCALA_QUIZ_QUESTIONS[quizStep].question}
                </h4>
                <div className="mb-4 flex flex-col gap-2">
                  {ALCALA_QUIZ_QUESTIONS[quizStep].options.map((opt, idx) => {
                    const isPicked = selectedOpt === idx;
                    const isCorrect = idx === ALCALA_QUIZ_QUESTIONS[quizStep].correctIndex;
                    let cls =
                      'w-full cursor-pointer text-left px-4 py-3 border text-sm font-medium transition-colors ';
                    if (selectedOpt === null) {
                      cls += 'border-ed-rule bg-white text-ed-ink hover:border-ed-navy hover:bg-ed-navy-tint';
                    } else if (isCorrect) {
                      cls += 'border-success-700 bg-ed-paper-2 text-success-700';
                    } else if (isPicked) {
                      cls += 'border-ed-red bg-ed-paper-2 text-ed-red';
                    } else {
                      cls += 'border-ed-rule text-ed-ink-3';
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
                  <div className="mb-4 border-l-4 border-ed-navy bg-ed-paper-2 p-3 text-sm text-ed-ink-2">
                    {ALCALA_QUIZ_QUESTIONS[quizStep].explanation}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setQuizOpen(false)}>
                    Close
                  </Button>
                  {selectedOpt !== null && (
                    <Button type="button" size="sm" onClick={handleQuizNext}>
                      {quizStep + 1 < ALCALA_QUIZ_QUESTIONS.length ? 'Next Question' : 'Finish Quiz'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Flag variant="navy">Completed</Flag>
                <h4 className="mt-4 font-serif-ed text-2xl font-bold text-ed-ink">
                  You scored {score} / {ALCALA_QUIZ_QUESTIONS.length}
                </h4>
                <p className="mt-2 mb-6 text-sm text-ed-ink-2">
                  Thank you for exploring Alcala’s history, 21 barangays, and civic heritage.
                </p>
                <div className="flex justify-center gap-3">
                  <Button type="button" variant="ghost" size="sm" onClick={resetQuiz}>
                    Retake Quiz
                  </Button>
                  <Button type="button" size="sm" onClick={() => setQuizOpen(false)}>
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
