import { useState } from 'react';
import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import Card from '../components/v2/ui/Card';
import Eyebrow from '../components/v2/ui/Eyebrow';
import ArrowLink from '../components/v2/ui/ArrowLink';
import { cn } from '../lib/utils';

const ORDINANCE_STEPS = [
  { num: '01', title: 'File Proposed Ordinance', desc: 'Sangguniang Bayan Member or Committee submits draft ordinance to the SB Secretary.' },
  { num: '02', title: 'First Reading & Referral', desc: 'Title is read in session and referred to the appropriate Sangguniang Bayan committee.' },
  { num: '03', title: 'Committee Study & Public Hearing', desc: 'Committee conducts study and public consultation with affected Alcala stakeholders.' },
  { num: '04', title: 'Committee Report & Second Reading', desc: 'Committee submits report for floor sponsorship, debate, and period of amendments.' },
  { num: '05', title: 'Third & Final Reading', desc: 'Roll-call vote by Sangguniang Bayan members; majority vote approves enactment.' },
  { num: '06', title: 'Mayoral Review & Provincial Submission', desc: 'Forwarded to the Municipal Mayor for approval and to Sangguniang Panlalawigan of Pangasinan for statutory review.' },
];

const RESOLUTION_STEPS = [
  { num: '01', title: 'Draft Resolution', desc: 'Prepared by sponsor expressing legislative policy, authorization, or commendation.' },
  { num: '02', title: 'Calendared in Session', desc: 'Included in the Sangguniang Bayan order of business.' },
  { num: '03', title: 'Deliberation & Adoption', desc: 'Discussed and adopted by majority vote of the council in regular or special session.' },
  { num: '04', title: 'Attestation & Posting', desc: 'Attested by the Presiding Officer and SB Secretary for implementation.' },
];

export default function LegislativePage() {
  const [activeTab, setActiveTab] = useState<'ordinances' | 'resolutions'>('ordinances');
  const steps = activeTab === 'ordinances' ? ORDINANCE_STEPS : RESOLUTION_STEPS;

  return (
    <Layout breadcrumbs={[{ label: 'Legislative' }]}>
      <PageMasthead
        title="Legislative Documents"
        lede="Municipal ordinances, budget appropriations, and provincial review resolutions for Alcala, Pangasinan."
      />

      <section className="py-12 max-md:py-8">
        <Container>
          <SectionHeader label="Document Frameworks" meta="Sangguniang Bayan ng Alcala" />
          <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
            <Card to="/legislative/ordinance-framework">
              <Eyebrow tone="navy">Local Laws</Eyebrow>
              <h3 className="mt-3 font-serif-ed text-2xl font-bold text-ed-ink">
                Ordinance Framework
              </h3>
              <p className="mt-2 font-sans-ed text-[15px] leading-relaxed text-ed-ink-2">
                Municipal ordinances enacted by the Sangguniang Bayan — local laws governing safety, business compliance, employment priority, and appropriations.
              </p>
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 border-b border-ed-navy pb-0.5 font-sans-ed text-sm font-medium text-ed-navy">
                  Browse Alcala Ordinances →
                </span>
              </div>
            </Card>

            <Card to="/legislative/resolution-framework">
              <Eyebrow tone="navy">Policy &amp; Review</Eyebrow>
              <h3 className="mt-3 font-serif-ed text-2xl font-bold text-ed-ink">
                Resolution Framework
              </h3>
              <p className="mt-2 font-sans-ed text-[15px] leading-relaxed text-ed-ink-2">
                Provincial review resolutions from Sangguniang Panlalawigan of Pangasinan and Sangguniang Bayan legislative policy records.
              </p>
              <div className="mt-5">
                <span className="inline-flex items-center gap-2 border-b border-ed-navy pb-0.5 font-sans-ed text-sm font-medium text-ed-navy">
                  Browse Resolutions →
                </span>
              </div>
            </Card>
          </div>

          <div className="mt-16 border-t border-ed-rule pt-12">
            <SectionHeader
              label="How Local Legislation Works"
              meta="Standard Local Government Code workflow"
            />

            <div className="mb-8 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('ordinances')}
                className={cn(
                  'cursor-pointer border px-4 py-2.5 font-mono-ed text-[11px] uppercase tracking-[0.12em] transition-colors',
                  activeTab === 'ordinances'
                    ? 'border-ed-navy bg-ed-navy text-white'
                    : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                )}
              >
                For Ordinances ({ORDINANCE_STEPS.length} stages)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resolutions')}
                className={cn(
                  'cursor-pointer border px-4 py-2.5 font-mono-ed text-[11px] uppercase tracking-[0.12em] transition-colors',
                  activeTab === 'resolutions'
                    ? 'border-ed-navy bg-ed-navy text-white'
                    : 'border-ed-rule-strong bg-white text-ed-ink-2 hover:border-ed-navy hover:text-ed-navy'
                )}
              >
                For Resolutions ({RESOLUTION_STEPS.length} stages)
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {steps.map((step) => (
                <div key={step.num} className="border border-ed-rule bg-white p-6">
                  <div className="font-mono-ed text-[11px] font-medium uppercase tracking-[0.14em] text-ed-navy">
                    Stage {step.num}
                  </div>
                  <h4 className="mt-2 font-serif-ed text-lg font-semibold text-ed-ink">
                    {step.title}
                  </h4>
                  <p className="mt-2 font-sans-ed text-sm leading-relaxed text-ed-ink-2">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <ArrowLink to="/legislative/ordinance-framework">
                View enacted ordinances
              </ArrowLink>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
