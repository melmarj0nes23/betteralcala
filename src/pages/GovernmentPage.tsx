import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Eyebrow from '../components/v2/ui/Eyebrow';
import Flag from '../components/v2/ui/Flag';
import Button from '../components/v2/ui/Button';
import Notice from '../components/v2/ui/Notice';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import {
  MUNICIPAL_OFFICES,
  MUNICIPAL_PROFILE,
  OFFICIALS_DATA,
} from '../data/municipalInfo';
import { cn } from '../lib/utils';

export default function GovernmentPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const focusedOfficeId = searchParams.get('office') || '';
  const [expandedOffices, setExpandedOffices] = useState<Record<string, boolean>>({});

  const toggleOfficeExpand = (id: string) => {
    setExpandedOffices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const executiveOfficials = OFFICIALS_DATA.filter((o) => o.branch === 'Executive');
  const legislativeOfficials = OFFICIALS_DATA.filter(
    (o) => o.branch === 'Legislative' || o.branch === 'Ex-Officio'
  );

  return (
    <Layout breadcrumbs={[{ label: t('gov-badge') }]}>
      <PageMasthead title={t('gov-title')} lede={t('gov-desc')} />

      {/* Executive Branch */}
      <section className="border-b border-ed-rule bg-ed-paper-2 py-12 max-md:py-8">
        <Container>
          <SectionHeader
            label="Municipal Executive Leadership"
            meta="Elected executive officials · 2025–2028 term"
          />

          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            {executiveOfficials.map((official) => (
              <div key={official.id} className="border border-ed-rule bg-white p-7">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <Flag variant="navy">{official.title}</Flag>
                  <VerificationBadge status={official.citation.verificationStatus} />
                </div>
                <h3 className="font-serif-ed text-2xl font-bold text-ed-ink">
                  {official.name}
                </h3>
                <p className="mt-1 font-mono-ed text-[11px] uppercase tracking-[0.12em] text-ed-ink-3">
                  Term: {official.term}
                </p>

                <div className="mt-5 space-y-2 border-t border-ed-rule pt-4 font-sans-ed text-sm text-ed-ink-2">
                  {official.email && (
                    <div className="flex items-center gap-2">
                      <MailIcon size={14} className="shrink-0 text-ed-ink-3" aria-hidden />
                      <a
                        href={`mailto:${official.email}`}
                        className="text-ed-navy no-underline hover:text-ed-red hover:underline"
                      >
                        {official.email}
                      </a>
                    </div>
                  )}
                  {official.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon size={14} className="shrink-0 text-ed-ink-3" aria-hidden />
                      <a
                        href={`tel:${official.phone.replace(/[^+\d]/g, '')}`}
                        className="font-mono-ed text-ed-ink no-underline hover:text-ed-navy"
                      >
                        {official.phone}
                      </a>
                    </div>
                  )}
                  {official.officeHours && (
                    <div className="flex items-center gap-2">
                      <ClockIcon size={14} className="shrink-0 text-ed-ink-3" aria-hidden />
                      <span>{official.officeHours}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {executiveOfficials[0] && (
            <div className="mt-6">
              <SourceCitationBox citation={executiveOfficials[0].citation} compact />
            </div>
          )}
        </Container>
      </section>

      {/* Sangguniang Bayan */}
      <section className="py-12 max-md:py-8">
        <Container>
          <SectionHeader
            label="Sangguniang Bayan Members"
            meta={`Municipal Councilors · ${MUNICIPAL_PROFILE.congressionalDistrict}`}
          />

          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {legislativeOfficials.map((c) => (
              <div key={c.id} className="border border-ed-rule bg-white p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <Eyebrow tone="navy">{c.title}</Eyebrow>
                  <VerificationBadge status={c.citation.verificationStatus} />
                </div>
                <h3 className="font-serif-ed text-xl font-semibold text-ed-ink">{c.name}</h3>
                <p className="mt-2 font-sans-ed text-[13px] leading-relaxed text-ed-ink-2">
                  {c.committees?.join(' · ') || 'Committee assignments pending confirmation'}
                </p>
                <div className="mt-4 border-t border-ed-rule pt-3 font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">
                  Term: {c.term}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Municipal Offices & Department Heads */}
      <section id="offices" className="border-y border-ed-rule bg-ed-paper-2 py-12 max-md:py-8">
        <Container>
          <SectionHeader
            label="Municipal Offices &amp; Department Directory"
            meta={`${MUNICIPAL_OFFICES.length} frontline offices`}
          />

          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            {MUNICIPAL_OFFICES.map((office) => (
              <article
                key={office.id}
                id={`office-${office.id}`}
                className={cn(
                  'flex flex-col justify-between border bg-white p-6',
                  focusedOfficeId === office.id ? 'border-ed-navy' : 'border-ed-rule'
                )}
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-serif-ed text-lg font-semibold text-ed-navy-ink">
                      {office.name}
                    </h3>
                    <VerificationBadge status={office.citation.verificationStatus} />
                  </div>
                  <p className="mb-3 font-mono-ed text-[11px] uppercase tracking-[0.1em] text-ed-ink-3">
                    Head: {office.headName}
                  </p>
                  <p
                    className={cn(
                      'font-sans-ed text-sm leading-relaxed text-ed-ink-2',
                      !expandedOffices[office.id] && 'mobile-clamp-2'
                    )}
                  >
                    {office.description}
                  </p>
                  {office.description.length > 65 && (
                    <button
                      type="button"
                      onClick={() => toggleOfficeExpand(office.id)}
                      className="mt-1 mb-3 cursor-pointer border-0 bg-transparent p-0 font-sans-ed text-xs font-medium text-ed-navy underline underline-offset-2 hover:text-ed-red"
                    >
                      {expandedOffices[office.id] ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  <ul className="mt-2 space-y-1 text-xs text-ed-ink-2">
                    {office.responsibilities.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <span className="text-ed-navy">·</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 space-y-1.5 border-t border-ed-rule pt-4 text-xs text-ed-ink-2">
                  <div className="flex items-center gap-2">
                    <MapPinIcon size={13} className="shrink-0 text-ed-ink-3" aria-hidden />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon size={13} className="shrink-0 text-ed-ink-3" aria-hidden />
                    <span>{office.officeHours}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    {office.phone.map((ph) => (
                      <a
                        key={ph}
                        href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1.5 font-mono-ed text-ed-navy no-underline hover:text-ed-red"
                      >
                        <PhoneIcon size={12} aria-hidden /> {ph}
                      </a>
                    ))}
                    {office.email && (
                      <a
                        href={`mailto:${office.email}`}
                        className="inline-flex items-center gap-1.5 text-ed-navy no-underline hover:text-ed-red"
                      >
                        <MailIcon size={12} aria-hidden /> {office.email}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* 21 Barangays Directory Callout */}
      <section id="barangays" className="py-12 max-md:py-8">
        <Container>
          <Notice
            tag="21 Component Barangays"
            title="Looking for Barangay Profiles or Direct Hotlines?"
          >
            <p className="mt-2 max-w-2xl font-sans-ed text-[15px] leading-relaxed text-ed-ink-2">
              Explore PSGC codes, census demographics, and individual profiles for all 21 barangays in the Barangay Directory, or view one-tap emergency phone numbers in the Contact &amp; Hotlines page.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button as={Link} to="/statistics" size="sm">
                Barangay Directory
              </Button>
              <Button as={Link} to="/contact#barangay-hotlines" variant="ghost" size="sm">
                21 Barangay Hotlines
              </Button>
            </div>
          </Notice>
        </Container>
      </section>
    </Layout>
  );
}
