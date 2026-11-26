import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import { MUNICIPAL_PROFILE } from '../data/municipalInfo';

export function PrivacyPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Privacy Policy' }]}>
      <PageMasthead
        title="Privacy Policy"
        lede="How BetterAlcala handles visitor data under the Data Privacy Act of 2012 (RA 10173)"
      />

      <section className="py-12 max-md:py-8">
        <Container narrow>
          <article className="space-y-8 font-sans-ed text-[17px] leading-relaxed text-ed-ink-2">
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">1. Independent Civic Platform</h2>
              <p className="mt-3">
                BetterAlcala is an independent civic information platform built under the BetterGov.ph BetterLGU initiative for residents of Alcala, Pangasinan. We do not require user accounts, logins, or personal document uploads to browse public services, budgets, or ordinances.
              </p>
            </section>
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">2. Local Browser Storage &amp; Offline Caching</h2>
              <p className="mt-3">
                BetterAlcala stores minimal non-personal preferences locally in your browser (such as your EN/FIL/ILO language choice and temporary Open-Meteo weather forecast cache) and uses a Service Worker for offline PWA availability. No personally identifiable information is sold or shared with third parties.
              </p>
            </section>
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">3. External Government &amp; Public Links</h2>
              <p className="mt-3">
                Links to PSA, PSGC, BLGF, COA, DPWH, PhilGEPS, and LGU Alcala social/agency pages are governed by the privacy policies of those respective institutions.
              </p>
            </section>
            <section>
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">4. Contact &amp; Data Privacy Inquiries</h2>
              <p className="mt-3">
                For official LGU data requests under Republic Act No. 10173, contact the Municipality of Alcala at{' '}
                <a href={`mailto:${MUNICIPAL_PROFILE.hallEmail}`} className="text-ed-navy underline underline-offset-2 hover:text-ed-red">
                  {MUNICIPAL_PROFILE.hallEmail}
                </a>{' '}
                or{' '}
                <a href="tel:+63756325938" className="text-ed-navy underline underline-offset-2 hover:text-ed-red">
                  (075) 632-5938
                </a>.
              </p>
            </section>
          </article>
        </Container>
      </section>
    </Layout>
  );
}

export function TermsPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Terms of Use' }]}>
      <PageMasthead
        title="Terms of Use &amp; Attribution"
        lede="Public civic data usage guidelines and independence disclaimer"
      />

      <section className="py-12 max-md:py-8">
        <Container narrow>
          <article className="space-y-8 font-sans-ed text-[17px] leading-relaxed text-ed-ink-2">
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">1. Non-Official Status Disclaimer</h2>
              <p className="mt-3">
                BetterAlcala is an independent civic technology project developed in collaboration with BetterGov.ph under the BetterLGU initiative. It is <strong>not</strong> the official website of the Municipality of Alcala, Pangasinan.
              </p>
            </section>
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">2. Verification Labels &amp; Accuracy</h2>
              <p className="mt-3">
                Every public record carries a verification status (<em>Verified</em>, <em>Needs Review</em>, <em>Outdated</em>, or <em>Unavailable</em>) along with its issuing agency and verification date. Residents should confirm time-sensitive local fees or requirements directly with the Municipal Hall at{' '}
                <a href="tel:+63756325938" className="text-ed-navy underline underline-offset-2 hover:text-ed-red">
                  (075) 632-5938
                </a>.
              </p>
            </section>
            <section>
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">3. Open Source &amp; Open Data Licensing</h2>
              <p className="mt-3">
                Platform source code follows the MIT License and compiled civic datasets are shared under Creative Commons Attribution 4.0 (CC BY 4.0), preserving attribution to originating Philippine government agencies (PSA, BLGF, COA, DPWH, Sangguniang Panlalawigan of Pangasinan, and LGU Alcala).
              </p>
            </section>
          </article>
        </Container>
      </section>
    </Layout>
  );
}

export function AccessibilityPage() {
  return (
    <Layout breadcrumbs={[{ label: 'Accessibility' }]}>
      <PageMasthead
        title="Accessibility Statement"
        lede="Our commitment to WCAG 2.1 Level AA civic accessibility for all residents of Alcala"
      />

      <section className="py-12 max-md:py-8">
        <Container narrow>
          <article className="space-y-8 font-sans-ed text-[17px] leading-relaxed text-ed-ink-2">
            <section className="border-b border-ed-rule pb-6">
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">1. Accessibility Standards</h2>
              <p className="mt-3">
                BetterAlcala aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA so residents using screen readers, keyboard navigation, or mobile devices on low-bandwidth connections can access municipal information easily.
              </p>
            </section>
            <section>
              <h2 className="font-serif-ed text-2xl font-semibold text-ed-ink">2. Implemented Features</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px]">
                <li>Skip-to-main-content keyboard navigation link on every page</li>
                <li>High-contrast text and verification badges paired with explicit text &amp; icons</li>
                <li>Clickable <code className="font-mono-ed text-xs">tel:</code> emergency hotlines and <code className="font-mono-ed text-xs">mailto:</code> links</li>
                <li>Multi-language switching between English, Filipino, and Ilocano</li>
                <li>Responsive mobile layout and offline PWA fallback support</li>
              </ul>
            </section>
          </article>
        </Container>
      </section>
    </Layout>
  );
}
