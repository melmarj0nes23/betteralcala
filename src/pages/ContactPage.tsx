import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { BARANGAYS_DATA, EMERGENCY_CONTACTS, MUNICIPAL_PROFILE } from '../data/municipalInfo';
import { EmergencyContactCategory } from '../types/civic';

type FilterTab =
  | 'All'
  | 'Emergency & Rescue'
  | 'Health & Social Welfare'
  | 'Utilities'
  | 'Escalation';

const FILTER_MAP: Record<FilterTab, EmergencyContactCategory[] | null> = {
  All: null,
  'Emergency & Rescue': ['Police', 'Fire Protection', 'Disaster & Rescue'],
  'Health & Social Welfare': ['Health & Medical', 'Social Welfare & Assistance'],
  Utilities: ['Private / Public Utilities'],
  Escalation: ['National / Provincial Escalation'],
};

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [contactSearch, setContactSearch] = useState(() => searchParams.get('q') || '');
  const [brgySearch, setBrgySearch] = useState('');
  const [senderName, setSenderName] = useState('');
  const [topic, setTopic] = useState(
    () => searchParams.get('topic') || 'Data Verification / Update'
  );
  const [message, setMessage] = useState(() => {
    const srv = searchParams.get('service');
    return srv
      ? `Regarding "${srv}": I would like to share updated local fee, processing time, or official Citizen's Charter information.`
      : '';
  });
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) setContactSearch(qParam);
    const topicParam = searchParams.get('topic');
    if (topicParam) setTopic(topicParam);
    const srvParam = searchParams.get('service');
    if (srvParam) {
      setMessage(
        `Regarding "${srvParam}": I would like to share updated local fee, processing time, or official Citizen's Charter information.`
      );
    }
  }, [searchParams]);

  const filteredContacts = useMemo(() => {
    const allowedCategories = FILTER_MAP[activeFilter];
    const q = contactSearch.trim().toLowerCase();
    return EMERGENCY_CONTACTS.filter((item) => {
      if (allowedCategories && !allowedCategories.includes(item.category)) return false;
      if (!q) return true;
      return (
        item.office.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.phones.some((p) => p.toLowerCase().includes(q)) ||
        item.address.toLowerCase().includes(q)
      );
    });
  }, [activeFilter, contactSearch]);

  const filteredBarangays = useMemo(() => {
    const q = brgySearch.trim().toLowerCase();
    if (!q) return BARANGAYS_DATA;
    return BARANGAYS_DATA.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.psgcCode.includes(q) ||
        b.phones?.some((p) => p.toLowerCase().includes(q))
    );
  }, [brgySearch]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedNotice(true);
    const subject = encodeURIComponent(`[BetterAlcala] ${topic} - ${senderName || 'Resident'}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${MUNICIPAL_PROFILE.hallEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyInquiry = async () => {
    const text = [
      `To: ${MUNICIPAL_PROFILE.hallEmail}`,
      `Subject: [BetterAlcala] ${topic} - ${senderName || 'Resident'}`,
      '',
      message || '(Please add your inquiry details here)',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <Layout breadcrumbs={[{ label: t('nav-contact') }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-telephone-fill" aria-hidden="true" />{' '}
              <span>{t('contact-badge')}</span>
            </span>
            <h1>{t('contact-title')}</h1>
            <p className="page-header-desc">{t('contact-desc')}</p>
          </div>
        </div>
      </section>

      {/* Municipal Hall Contacts */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3 contact-hall-grid" style={{ gap: 'var(--spacing-md)' }}>
            <div className="home-contact-v2-card" style={{ cursor: 'default' }}>
              <div className="home-contact-v2-icon">
                <i className="bi bi-telephone-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>Municipal Hall Trunklines</h3>
                <div className="flex flex-col gap-1 text-sm font-semibold">
                  {MUNICIPAL_PROFILE.hallPhones.map((ph) => (
                    <a key={ph} href={`tel:${ph.replace(/[^+\d]/g, '')}`}>
                      {ph}
                    </a>
                  ))}
                </div>
                <span className="home-contact-v2-note">Mon–Fri: 8:00 AM – 5:00 PM</span>
              </div>
            </div>

            <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`} className="home-contact-v2-card">
              <div className="home-contact-v2-icon">
                <i className="bi bi-envelope-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>Official Municipal Email</h3>
                <p className="home-contact-v2-value">{MUNICIPAL_PROFILE.hallEmail}</p>
                <span className="home-contact-v2-note">Verified via DTI / LGU Directory</span>
              </div>
            </a>

            <div className="home-contact-v2-card" style={{ cursor: 'default' }}>
              <div className="home-contact-v2-icon">
                <i className="bi bi-geo-alt-fill" aria-hidden="true" />
              </div>
              <div className="home-contact-v2-content">
                <h3>Municipal Hall Address</h3>
                <p className="home-contact-v2-value">Poblacion East, Alcala</p>
                <span className="home-contact-v2-note">{MUNICIPAL_PROFILE.hallAddress}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Hotlines & Utilities Directory */}
      <section className="section bg-alt">
        <div className="container">
          <div className="text-center mb-6">
            <h2>Emergency, Office &amp; Utility Hotlines</h2>
            <p className="text-slate-600">
              Tap any number to call directly. Filter by category or jump to{' '}
              <a href="#barangay-hotlines" className="font-semibold text-[#0032a0] underline">
                All 21 Barangay Hotlines ↓
              </a>
            </p>
          </div>

          <div className="max-w-md mx-auto mb-4 flex gap-2">
            <input
              type="search"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search police, ambulance, fire, CENPELCO, RHU..."
              aria-label="Search emergency and office hotlines"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
            />
            {contactSearch && (
              <button
                type="button"
                onClick={() => setContactSearch('')}
                className="btn btn-outline btn-sm whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>

          <div className="filter-tab-bar justify-center" role="tablist" aria-label="Filter hotline categories">
            {(Object.keys(FILTER_MAP) as FilterTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab}
                onClick={() => setActiveFilter(tab)}
                className={`filter-tab-btn ${activeFilter === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--spacing-md)' }}>
            {filteredContacts.map((item) => (
              <article
                key={item.id}
                className="contact-directory-card bg-white border border-black/10 rounded-xl p-5 flex flex-col"
              >
                <div>
                  <div className="contact-directory-meta flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-[#0032a0]">{item.category}</span>
                    <VerificationBadge status={item.citation.verificationStatus} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.office}</h3>
                  <p className="text-xs text-slate-600 mb-2">
                    <i className="bi bi-geo-alt" aria-hidden="true" /> {item.address}
                  </p>
                  <p className="text-xs text-slate-600 mb-3">
                    <i className="bi bi-clock" aria-hidden="true" /> {item.hours}
                  </p>

                  <div className="contact-directory-phones flex flex-wrap gap-2">
                    {item.phones.map((ph) => (
                      <a
                        key={ph}
                        href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-[#0032a0]/20 px-3 py-1.5 text-sm font-bold text-[#0032a0] hover:bg-[#0032a0] hover:text-white transition tabular-nums"
                      >
                        <i className="bi bi-telephone-fill" aria-hidden="true" />
                        <span>{ph}</span>
                      </a>
                    ))}
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        <i className="bi bi-envelope" aria-hidden="true" />
                        <span>{item.email}</span>
                      </a>
                    )}
                  </div>

                  {item.phoneNote && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-3 mb-0">
                      <i className="bi bi-info-circle-fill" aria-hidden="true" /> {item.phoneNote}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">
              No hotlines matched "{contactSearch}". Try clearing your filter.
            </p>
          )}
        </div>
      </section>

      {/* 21 Barangays Hotline Directory */}
      <section id="barangay-hotlines" className="section">
        <div className="container">
          <div className="text-center mb-6">
            <h2>Barangay Emergency Hotlines (21 Barangays)</h2>
            <p className="text-slate-600">
              Direct mobile contact numbers for all 21 barangays of Alcala, Pangasinan
            </p>
          </div>

          <div className="max-w-md mx-auto mb-6">
            <input
              type="search"
              value={brgySearch}
              onChange={(e) => setBrgySearch(e.target.value)}
              placeholder="Search barangay name or hotline number..."
              aria-label="Search Alcala barangay hotlines"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
            />
          </div>

          <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
            {filteredBarangays.map((b) => (
              <div key={b.psgcCode} className="barangay-card" style={{ cursor: 'default' }}>
                <div className="barangay-card-header flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                    <span className="barangay-name">{b.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{b.classification}</span>
                </div>
                <div className="barangay-card-body">
                  <span className="text-xs text-slate-500 tabular-nums mb-1">
                    PSGC: {b.psgcCode}
                  </span>
                  <div className="barangay-phones flex flex-wrap gap-2 mt-1">
                    {b.phones?.map((ph) => (
                      <a
                        key={ph}
                        href={`tel:${ph.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-[#0032a0]/20 px-2.5 py-1 text-xs font-bold text-[#0032a0] hover:bg-[#0032a0] hover:text-white transition tabular-nums"
                      >
                        <i className="bi bi-telephone-fill" aria-hidden="true" />
                        <span>{ph}</span>
                      </a>
                    ))}
                  </div>
                  {b.phoneNote && (
                    <span className="text-[11px] text-amber-800 mt-1">{b.phoneNote}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredBarangays.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-6">
              No barangay matched "{brgySearch}". Try clearing the search box.
            </p>
          )}
        </div>
      </section>

      {/* Civic Feedback / Data Verification Report */}
      <section id="feedback" className="section bg-alt">
        <div className="container max-w-3xl">
          <div className="bg-white border border-black/10 rounded-xl p-6">
            <h2 className="text-xl font-bold text-[#0032a0] mb-2">
              Submit a Data Update or Civic Inquiry
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Notice a record marked <em>Needs Review</em> or have an official Citizen’s Charter PDF,
              ordinance, or hotline update from LGU Alcala? Draft an inquiry to{' '}
              <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`}>{MUNICIPAL_PROFILE.hallEmail}</a> or
              copy the message for webmail /{' '}
              <a
                href={MUNICIPAL_PROFILE.officialFacebookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LGU Alcala Facebook
              </a>
              .
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="grid grid-2" style={{ gap: 'var(--spacing-sm)' }}>
                <div>
                  <label htmlFor="fb-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="fb-topic" className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject / Category
                  </label>
                  <select
                    id="fb-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Data Verification / Update">Data Verification / Update</option>
                    <option value="Citizen's Charter Inquiry">Citizen's Charter Inquiry</option>
                    <option value="Barangay Contact Update">Barangay Contact Update</option>
                    <option value="General Civic Inquiry">General Civic Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="fb-msg" className="block text-xs font-semibold text-slate-700 mb-1">
                  Message &amp; Source Reference
                </label>
                <textarea
                  id="fb-msg"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details, official document reference, or your question..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className="bi bi-envelope" aria-hidden="true" /> {t('contact-open-email')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyInquiry}
                  className="btn btn-outline btn-sm"
                >
                  <i className={`bi ${copiedNotice ? 'bi-check2' : 'bi-clipboard'}`} aria-hidden="true" />{' '}
                  {copiedNotice ? t('contact-copied-report') : t('contact-copy-report')}
                </button>
              </div>

              {submittedNotice && (
                <p className="text-xs text-emerald-700 mt-2 mb-0">
                  Email draft prepared for {MUNICIPAL_PROFILE.hallEmail}. If no mail app opened,
                  use “{t('contact-copy-report')}” above or call (075) 632-5938.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
