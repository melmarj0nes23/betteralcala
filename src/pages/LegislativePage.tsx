import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';

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

  return (
    <Layout breadcrumbs={[{ label: 'Legislative' }]}>
      <section className="leg-hero">
        <div className="container">
          <div className="leg-hero-content">
            <span className="leg-hero-badge">
              <i className="bi bi-bank2" aria-hidden="true" />{' '}
              <span>Sangguniang Bayan ng Alcala</span>
            </span>
            <h1>Legislative Documents</h1>
            <p>
              Municipal ordinances, budget appropriations, and provincial review resolutions for
              Alcala, Pangasinan
            </p>
          </div>
        </div>
      </section>

      <section className="leg-categories">
        <div className="container">
          <div className="leg-categories-grid">
            <Link to="/legislative/ordinance-framework" className="leg-category-card">
              <div className="leg-category-icon">
                <i className="bi bi-journal-bookmark-fill" aria-hidden="true" />
              </div>
              <div className="leg-category-content">
                <h2>Ordinance Framework</h2>
                <p>
                  Municipal ordinances enacted by the Sangguniang Bayan — local laws governing
                  safety, business compliance, employment priority, and appropriations.
                </p>
                <span className="leg-category-link">
                  <i className="bi bi-arrow-right" aria-hidden="true" />{' '}
                  <span>Browse Alcala Ordinances</span>
                </span>
              </div>
            </Link>

            <Link to="/legislative/resolution-framework" className="leg-category-card">
              <div className="leg-category-icon">
                <i className="bi bi-file-earmark-ruled-fill" aria-hidden="true" />
              </div>
              <div className="leg-category-content">
                <h2>Resolution Framework</h2>
                <p>
                  Provincial review resolutions from Sangguniang Panlalawigan of Pangasinan and
                  Sangguniang Bayan legislative policy records.
                </p>
                <span className="leg-category-link">
                  <span>Browse Resolutions</span>{' '}
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Legislative Process Flowchart */}
      <section className="leg-process">
        <div className="container">
          <div className="leg-process-header">
            <span className="leg-info-tag">
              <i className="bi bi-diagram-3-fill" aria-hidden="true" /> <span>Process Flow</span>
            </span>
            <h2>How Local Legislation Works</h2>
            <p>Standard Local Government Code legislative workflow for ordinances and resolutions</p>
          </div>

          <div className="leg-process-tabs">
            <button
              type="button"
              onClick={() => setActiveTab('ordinances')}
              className={`leg-tab-btn ${activeTab === 'ordinances' ? 'active' : ''}`}
            >
              <i className="bi bi-journal-bookmark-fill" aria-hidden="true" />{' '}
              <span>For Ordinances</span>
              <small>{ORDINANCE_STEPS.length} Stages</small>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resolutions')}
              className={`leg-tab-btn ${activeTab === 'resolutions' ? 'active' : ''}`}
            >
              <i className="bi bi-file-earmark-ruled-fill" aria-hidden="true" />{' '}
              <span>For Resolutions</span>
              <small>{RESOLUTION_STEPS.length} Stages</small>
            </button>
          </div>

          <div className="grid grid-3 mt-6" style={{ gap: 'var(--spacing-md)' }}>
            {(activeTab === 'ordinances' ? ORDINANCE_STEPS : RESOLUTION_STEPS).map((step) => (
              <div key={step.num} className="leg-flow-card">
                <div className="leg-flow-number">{step.num}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
