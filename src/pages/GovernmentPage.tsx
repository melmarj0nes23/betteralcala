import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import {
  MUNICIPAL_OFFICES,
  MUNICIPAL_PROFILE,
  OFFICIALS_DATA,
} from '../data/municipalInfo';

export default function GovernmentPage() {
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
    <Layout breadcrumbs={[{ label: 'Government' }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-building-fill" aria-hidden="true" /> <span>Government</span>
            </span>
            <h1>Government Structure &amp; Municipal Officials</h1>
            <p className="page-header-desc">
              Verified municipal leadership (2025–2028 term) and executive offices of Alcala,
              Pangasinan
            </p>
          </div>
        </div>
      </section>

      {/* Executive Branch */}
      <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>Municipal Executive Leadership</h2>
            <p style={{ color: 'var(--color-text-light)' }}>
              Elected executive officials serving the 2025–2028 term
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            {executiveOfficials.map((official) => (
              <div key={official.id} className="executive-card">
                <div className="executive-card-header">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="executive-badge">{official.title}</span>
                    <VerificationBadge status={official.citation.verificationStatus} />
                  </div>
                  <h3 className="executive-name">{official.name}</h3>
                  <p className="text-xs text-slate-600 mb-0">Term: {official.term}</p>
                </div>
                <div className="executive-card-body">
                  <div className="executive-contacts">
                    {official.email && (
                      <a href={`mailto:${official.email}`}>
                        <i className="bi bi-envelope" aria-hidden="true" /> {official.email}
                      </a>
                    )}
                    {official.phone && (
                      <a href={`tel:${official.phone.replace(/[^+\d]/g, '')}`}>
                        <i className="bi bi-telephone" aria-hidden="true" /> {official.phone}
                      </a>
                    )}
                    {official.officeHours && (
                      <span>
                        <i className="bi bi-clock" aria-hidden="true" /> {official.officeHours}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {executiveOfficials[0] && (
            <div className="mt-4">
              <SourceCitationBox citation={executiveOfficials[0].citation} compact />
            </div>
          )}
        </div>
      </section>

      {/* Sangguniang Bayan */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>Sangguniang Bayan Members</h2>
            <p style={{ color: 'var(--color-text-light)' }}>
              Municipal Councilors of Alcala, Pangasinan ({MUNICIPAL_PROFILE.congressionalDistrict})
            </p>
          </div>

          <div className="grid grid-3" style={{ gap: 'var(--spacing-md)' }}>
            {legislativeOfficials.map((c) => (
              <div key={c.id} className="councilor-card">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="councilor-badge whitespace-nowrap">{c.title}</span>
                  <VerificationBadge status={c.citation.verificationStatus} />
                </div>
                <h3 className="councilor-name text-lg">{c.name}</h3>
                <p className="councilor-committees">
                  {c.committees?.join(' · ') || 'Committee assignments pending confirmation'}
                </p>
                <div className="mt-3 text-xs text-slate-500">
                  Term: {c.term}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Municipal Offices & Department Heads */}
      <section id="offices" className="section" style={{ background: 'var(--color-bg-alt)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h2>Municipal Offices &amp; Department Directory</h2>
            <p style={{ color: 'var(--color-text-light)' }}>
              Frontline municipal departments, responsibilities, verified contact lines, and operating
              hours
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
            {MUNICIPAL_OFFICES.map((office) => (
              <article
                key={office.id}
                id={`office-${office.id}`}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between ${
                  focusedOfficeId === office.id
                    ? 'border-[#0032a0] ring-2 ring-[#0032a0]/20'
                    : 'border-black/10'
                }`}
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-bold text-[#0032a0] mb-0">{office.name}</h3>
                    <VerificationBadge status={office.citation.verificationStatus} />
                  </div>
                  <p className="text-xs text-slate-600 mb-2 flex items-center gap-2">
                    <span>
                      <strong>Department Head:</strong> {office.headName}
                    </span>
                  </p>
                  <p
                    className={`text-sm text-slate-700 mb-1 ${
                      expandedOffices[office.id] ? '' : 'mobile-clamp-2'
                    }`}
                  >
                    {office.description}
                  </p>
                  {office.description.length > 65 && (
                    <button
                      type="button"
                      onClick={() => toggleOfficeExpand(office.id)}
                      className="text-xs font-semibold text-[#0032a0] bg-transparent border-0 p-0 mb-3 cursor-pointer hover:underline"
                    >
                      {expandedOffices[office.id] ? 'Show less' : 'Read more'}
                    </button>
                  )}
                  <ul className="text-xs text-slate-600 space-y-1 mb-3">
                    {office.responsibilities.map((r) => (
                      <li key={r}>
                        <i className="bi bi-dot text-[#0032a0]" aria-hidden="true" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-black/5 pt-3 text-xs text-slate-700 space-y-1">
                  <div>
                    <i className="bi bi-geo-alt" aria-hidden="true" /> {office.address}
                  </div>
                  <div>
                    <i className="bi bi-clock" aria-hidden="true" /> {office.officeHours}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {office.phone.map((ph) => (
                      <a
                        key={ph}
                        href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                        className="font-semibold text-[#0032a0]"
                      >
                        <i className="bi bi-telephone" aria-hidden="true" /> {ph}
                      </a>
                    ))}
                    {office.email && (
                      <a href={`mailto:${office.email}`} className="font-semibold text-[#0032a0]">
                        <i className="bi bi-envelope" aria-hidden="true" /> {office.email}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 21 Barangays Directory Callout */}
      <section id="barangays" className="section">
        <div className="container">
          <div className="rounded-2xl border border-[#e3dfd6] bg-[#FAF7F2] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2E8B57] mb-2">
                <i className="bi bi-geo-alt-fill" aria-hidden="true" /> 21 Component Barangays
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0f2342] mb-2">
                Looking for Barangay Profiles or Direct Hotlines?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-0">
                Explore PSGC codes, census demographics, and individual profiles for all 21
                barangays in the Barangay Directory, or view one-tap emergency phone numbers in
                the Contact &amp; Hotlines page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link to="/statistics" className="btn btn-primary">
                <i className="bi bi-map-fill" aria-hidden="true" /> Barangay Directory
              </Link>
              <Link to="/contact#barangay-hotlines" className="btn btn-outline">
                <i className="bi bi-telephone-fill" aria-hidden="true" /> 21 Barangay Hotlines
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
