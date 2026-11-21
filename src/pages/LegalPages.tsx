import Layout from '../components/layout/Layout';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';

export function PrivacyPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Privacy Policy' }]}>
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero-content">
            <span className="legal-hero-badge">
              <i className="bi bi-shield-lock" aria-hidden="true" /> <span>Privacy</span>
            </span>
            <h1>Privacy Policy</h1>
            <p>How BetterAlcala handles visitor data under the Data Privacy Act of 2012 (RA 10173)</p>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <div className="container max-w-4xl">
          <article className="legal-article space-y-6">
            <section className="legal-section">
              <h2>1. Independent Civic Platform</h2>
              <p>
                BetterAlcala is an independent civic information platform built under the
                BetterGov.ph BetterLGU initiative for residents of Alcala, Pangasinan. We do not
                require user accounts, logins, or personal document uploads to browse public
                services, budgets, or ordinances.
              </p>
            </section>
            <section className="legal-section">
              <h2>2. Local Browser Storage &amp; Offline Caching</h2>
              <p>
                BetterAlcala stores minimal non-personal preferences locally in your browser
                (such as your EN/FIL/ILO language choice and temporary Open-Meteo weather forecast
                cache) and uses a Service Worker for offline PWA availability. No personally
                identifiable information is sold or shared with third parties.
              </p>
            </section>
            <section className="legal-section">
              <h2>3. External Government &amp; Public Links</h2>
              <p>
                Links to PSA, PSGC, BLGF, COA, DPWH, PhilGEPS, and LGU Alcala social/agency pages
                are governed by the privacy policies of those respective institutions.
              </p>
            </section>
            <section className="legal-section">
              <h2>4. Contact &amp; Data Privacy Inquiries</h2>
              <p>
                For official LGU data requests under Republic Act No. 10173, contact the
                Municipality of Alcala at{' '}
                <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`}>{MUNICIPAL_PROFILE.hallEmail}</a>{' '}
                or <a href="tel:+63756325938">(075) 632-5938</a>.
              </p>
            </section>
          </article>
        </div>
      </section>
    </Layout>
  );
}

export function TermsPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Terms of Use' }]}>
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero-content">
            <span className="legal-hero-badge">
              <i className="bi bi-file-earmark-check" aria-hidden="true" /> <span>Terms</span>
            </span>
            <h1>Terms of Use &amp; Attribution</h1>
            <p>Public civic data usage guidelines and independence disclaimer</p>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <div className="container max-w-4xl">
          <article className="legal-article space-y-6">
            <section className="legal-section">
              <h2>1. Non-Official Status Disclaimer</h2>
              <p>
                BetterAlcala is an independent civic technology project developed in
                collaboration with BetterGov.ph under the BetterLGU initiative. It is{' '}
                <strong>not</strong> the official website of the Municipality of Alcala, Pangasinan.
              </p>
            </section>
            <section className="legal-section">
              <h2>2. Verification Labels &amp; Accuracy</h2>
              <p>
                Every public record carries a verification status (<em>Verified</em>,{' '}
                <em>Needs Review</em>, <em>Outdated</em>, or <em>Unavailable</em>) along with its
                issuing agency and verification date. Residents should confirm time-sensitive local
                fees or requirements directly with the Municipal Hall at{' '}
                <a href="tel:+63756325938">(075) 632-5938</a>.
              </p>
            </section>
            <section className="legal-section">
              <h2>3. Open Source &amp; Open Data Licensing</h2>
              <p>
                Platform source code follows the MIT License and compiled civic datasets are shared
                under Creative Commons Attribution 4.0 (CC BY 4.0), preserving attribution to
                originating Philippine government agencies (PSA, BLGF, COA, DPWH, Sangguniang
                Panlalawigan of Pangasinan, and LGU Alcala).
              </p>
            </section>
          </article>
        </div>
      </section>
    </Layout>
  );
}

export function AccessibilityPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Accessibility' }]}>
      <section className="legal-hero">
        <div className="container">
          <div className="legal-hero-content">
            <span className="legal-hero-badge">
              <i className="bi bi-universal-access" aria-hidden="true" /> <span>Accessibility</span>
            </span>
            <h1>Accessibility Statement</h1>
            <p>Our commitment to WCAG 2.1 Level AA civic accessibility for all residents of Alcala</p>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <div className="container max-w-4xl">
          <article className="legal-article space-y-6">
            <section className="legal-section">
              <h2>1. Accessibility Standards</h2>
              <p>
                BetterAlcala aims to conform to the Web Content Accessibility Guidelines (WCAG)
                2.1 Level AA so residents using screen readers, keyboard navigation, or mobile
                devices on low-bandwidth connections can access municipal information easily.
              </p>
            </section>
            <section className="legal-section">
              <h2>2. Implemented Features</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                <li>Skip-to-main-content keyboard navigation link on every page</li>
                <li>High-contrast text and verification badges paired with explicit text &amp; icons</li>
                <li>Clickable <code>tel:</code> emergency hotlines and <code>mailto:</code> links</li>
                <li>Multi-language switching between English, Filipino, and Ilocano</li>
                <li>Responsive mobile layout and offline PWA fallback support</li>
              </ul>
            </section>
          </article>
        </div>
      </section>
    </Layout>
  );
}
