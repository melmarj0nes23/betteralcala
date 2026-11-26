import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ClipboardIcon, CheckIcon, PrinterIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Eyebrow from '../components/v2/ui/Eyebrow';
import Button from '../components/v2/ui/Button';
import Notice from '../components/v2/ui/Notice';
import { SourceCitationBox, VerificationBadge } from '../components/VerificationBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { SERVICES_DATA } from '../data/servicesData';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const service = SERVICES_DATA.find((s) => s.id === id);

  const storageKey = service ? `betteralcala_checklist_${service.id}` : '';
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!storageKey) {
      setCheckedItems({});
      return;
    }
    try {
      const saved = localStorage.getItem(storageKey);
      setCheckedItems(saved ? JSON.parse(saved) : {});
    } catch {
      setCheckedItems({});
    }
  }, [storageKey]);

  const toggleRequirement = (reqText: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [reqText]: !prev[reqText] };
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const resetChecklist = () => {
    setCheckedItems({});
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  };

  if (!service) {
    return (
      <Layout breadcrumbs={[{ label: t('nav-services'), to: '/services' }, { label: 'Service Not Found' }]}>
        <PageMasthead
          title="Service Guide Not Found"
          lede="The requested municipal service guide could not be found in the BetterAlcala directory."
        >
          <Button as={Link} to="/services">
            Browse All Municipal Services
          </Button>
        </PageMasthead>
      </Layout>
    );
  }

  const readyCount = service.requirements.filter((r) => Boolean(checkedItems[r])).length;
  const totalReqs = service.requirements.length;
  const readinessPct = totalReqs > 0 ? Math.round((readyCount / totalReqs) * 100) : 0;

  const handleCopyChecklist = async () => {
    const lines = [
      `${service.title} — BetterAlcala Service Checklist`,
      `Office: ${service.office}`,
      `Address: ${service.officeAddress}`,
      `Hours: ${service.officeHours}`,
      `Phone: ${service.officePhones.join(' / ')}`,
      `Processing Time: ${service.processingTime}`,
      `Fees: ${service.fees}`,
      '',
      'Eligibility:',
      ...service.eligibility.map((e) => `- ${e}`),
      '',
      `Documentary Requirements (${readyCount}/${totalReqs} ready):`,
      ...service.requirements.map((r) => `${checkedItems[r] ? '[x]' : '[ ]'} ${r}`),
      '',
      'Steps:',
      ...service.steps.map((s) => `${s.step}. ${s.title}: ${s.description}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const hasReviewItems =
    service.citation.verificationStatus !== 'Verified' ||
    service.feesStatus !== 'Verified' ||
    service.processingTimeStatus !== 'Verified';

  return (
    <Layout
      breadcrumbs={[
        { label: t('nav-services'), to: '/services' },
        { label: service.category, to: `/services/${service.categoryId}` },
        { label: service.title },
      ]}
    >
      <PageMasthead title={service.title} lede={service.description}>
        <div className="flex flex-wrap items-center gap-3 no-print">
          <Button type="button" size="sm" onClick={handleCopyChecklist}>
            {copied ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
            <span>{copied ? t('service-copied') : t('service-copy-checklist')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
            <PrinterIcon size={14} />
            <span>{t('service-print-checklist')}</span>
          </Button>
        </div>
      </PageMasthead>

      <section className="py-12 max-md:py-8">
        <Container>
          {/* Key Facts Strip */}
          <div className="mb-10 grid grid-cols-4 border border-ed-rule bg-white max-lg:grid-cols-2 max-sm:grid-cols-1">
            <div className="border-r border-ed-rule p-5 max-lg:border-b max-sm:border-r-0">
              <Eyebrow>{t('service-office')}</Eyebrow>
              <p className="mt-2 font-serif-ed text-base font-semibold text-ed-ink">{service.office}</p>
            </div>
            <div className="border-r border-ed-rule p-5 max-lg:border-b max-lg:border-r-0">
              <Eyebrow>{t('service-processing')}</Eyebrow>
              <p className="mt-2 mb-2 font-serif-ed text-base font-semibold text-ed-ink">{service.processingTime}</p>
              <VerificationBadge status={service.processingTimeStatus} />
            </div>
            <div className="border-r border-ed-rule p-5 max-sm:border-b max-sm:border-r-0">
              <Eyebrow>{t('service-fees')}</Eyebrow>
              <p className="mt-2 mb-2 font-serif-ed text-base font-semibold text-ed-ink">{service.fees}</p>
              <VerificationBadge status={service.feesStatus} />
            </div>
            <div className="p-5">
              <Eyebrow>{t('service-verified')}</Eyebrow>
              <p className="mt-2 mb-2 font-mono-ed text-sm font-semibold text-ed-ink tabular-nums">
                {service.citation.lastVerified}
              </p>
              <VerificationBadge status={service.citation.verificationStatus} />
            </div>
          </div>

          {/* Eligibility & Requirements Checklist */}
          <div className="mb-12 grid grid-cols-2 gap-8 max-lg:grid-cols-1">
            <div className="border border-ed-rule bg-white p-6">
              <Eyebrow tone="navy">Prerequisites</Eyebrow>
              <h2 className="mt-2 mb-4 font-serif-ed text-xl font-semibold text-ed-ink">
                {t('service-eligibility')}
              </h2>
              <ul className="divide-y divide-ed-rule border-t border-ed-rule">
                {service.eligibility.map((item) => (
                  <li key={item} className="py-3 font-sans-ed text-[15px] text-ed-ink-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-ed-rule bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Eyebrow tone="navy">Checklist</Eyebrow>
                <div className="flex items-center gap-3 font-mono-ed text-xs no-print">
                  <span className="font-medium text-ed-navy tabular-nums">
                    {readyCount}/{totalReqs} ready
                  </span>
                  {readyCount > 0 && (
                    <button
                      type="button"
                      onClick={resetChecklist}
                      className="cursor-pointer border-0 bg-transparent text-ed-ink-3 underline hover:text-ed-red"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <h2 className="mt-2 mb-3 font-serif-ed text-xl font-semibold text-ed-ink">
                {t('service-requirements')}
              </h2>

              <div className="mb-4 no-print">
                <div className="h-1.5 w-full bg-ed-paper-3" aria-hidden="true">
                  <div className="h-full bg-ed-navy transition-all" style={{ width: `${readinessPct}%` }} />
                </div>
              </div>

              <ul className="space-y-1.5">
                {service.requirements.map((req) => {
                  const isChecked = Boolean(checkedItems[req]);
                  return (
                    <li key={req}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => toggleRequirement(req)}
                        className={`checklist-item-btn ${isChecked ? 'is-checked' : ''}`}
                      >
                        <i
                          className={`bi ${
                            isChecked ? 'bi-check-square-fill text-success-700' : 'bi-square text-ed-ink-4'
                          } mt-0.5 shrink-0`}
                          aria-hidden="true"
                        />
                        <span className="checklist-item-text">{req}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Procedure */}
          <div className="mb-12">
            <SectionHeader label={t('service-steps')} meta={`${service.steps.length} steps`} />
            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
              {service.steps.map((s) => (
                <div key={s.step} className="border border-ed-rule bg-white p-6">
                  <div className="font-mono-ed text-[11px] font-medium uppercase tracking-[0.14em] text-ed-navy">
                    Step {String(s.step).padStart(2, '0')}
                  </div>
                  <h3 className="mt-2 font-serif-ed text-lg font-semibold text-ed-ink">{s.title}</h3>
                  <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">{s.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Office Contact & Forms */}
          <div className="mb-8 grid grid-cols-2 gap-8 max-lg:grid-cols-1">
            <div className="border border-ed-rule bg-ed-paper-2 p-6">
              <Eyebrow>{t('service-contact')}</Eyebrow>
              <dl className="mt-4 space-y-2.5 font-sans-ed text-sm text-ed-ink-2">
                <div>
                  <dt className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Office</dt>
                  <dd className="font-medium text-ed-ink">{service.office}</dd>
                </div>
                <div>
                  <dt className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Address</dt>
                  <dd>{service.officeAddress}</dd>
                </div>
                <div>
                  <dt className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Hours</dt>
                  <dd>{service.officeHours}</dd>
                </div>
                <div>
                  <dt className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Telephone</dt>
                  <dd className="font-mono-ed">
                    {service.officePhones.map((ph, i) => (
                      <span key={ph}>
                        {i > 0 && ' · '}
                        <a href={`tel:${ph.replace(/[^+\d]/g, '')}`} className="text-ed-navy no-underline hover:underline">
                          {ph}
                        </a>
                      </span>
                    ))}
                  </dd>
                </div>
                {service.officeEmail && (
                  <div>
                    <dt className="font-mono-ed text-[10px] uppercase tracking-[0.12em] text-ed-ink-3">Email</dt>
                    <dd>
                      <a href={`mailto:${service.officeEmail}`} className="text-ed-navy underline underline-offset-2">
                        {service.officeEmail}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="border border-ed-rule bg-white p-6">
              <Eyebrow>{t('service-forms')}</Eyebrow>
              <div className="mt-4">
                {service.downloadableForms.length > 0 ? (
                  <ul className="divide-y divide-ed-rule">
                    {service.downloadableForms.map((f) => (
                      <li key={f.label} className="flex flex-wrap items-center justify-between gap-2 py-3">
                        <div>
                          <span className="font-medium text-ed-ink">{f.label}</span>
                          {f.note && <div className="text-xs text-ed-ink-3">{f.note}</div>}
                        </div>
                        <VerificationBadge status={f.status} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                    No digital PDF forms are currently published online for this service. Forms are issued in person at {service.office}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <SourceCitationBox citation={service.citation} />

          {hasReviewItems && (
            <Notice tag="Community Verification" title="Help confirm local fees or forms" className="mt-6 no-print">
              <p className="mt-2 font-sans-ed text-sm text-ed-ink-2">
                Have an updated LGU Alcala Citizen’s Charter fee schedule or official form for <strong>{service.title}</strong>?
              </p>
              <div className="mt-4">
                <Button
                  as={Link}
                  to={`/contact?topic=${encodeURIComponent("Citizen's Charter Inquiry")}&service=${encodeURIComponent(service.title)}#feedback`}
                  variant="ghost"
                  size="sm"
                >
                  {t('service-help-verify')}
                </Button>
              </div>
            </Notice>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 no-print">
            <Button as={Link} to="/services" variant="ghost" size="sm">
              ← {t('services-back')}
            </Button>
            <Button as={Link} to="/contact" size="sm">
              {t('services-all-contacts')}
            </Button>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
