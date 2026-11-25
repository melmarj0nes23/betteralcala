import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { SERVICE_CATEGORIES, SERVICES_DATA } from '../data/servicesData';

export default function SitemapPage() {
  const { t } = useLanguage();
  return (
    <Layout breadcrumbs={[{ label: t('sitemap-title') }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-diagram-3-fill" aria-hidden="true" /> <span>{t('sitemap-badge')}</span>
            </span>
            <h1>{t('sitemap-title')}</h1>
            <p className="page-header-desc">{t('sitemap-desc')}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container space-y-10">
          <div className="sitemap-section-new">
            <div className="sitemap-section-header">
              <span className="sitemap-section-icon">
                <i className="bi bi-house-door" aria-hidden="true" />
              </span>
              <h2>Main Navigation</h2>
            </div>
            <div className="sitemap-links-grid">
              <Link to="/" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Home
              </Link>
              <Link to="/services" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Services Directory
              </Link>
              <Link to="/government" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Government &amp; 21 Barangays
              </Link>
              <Link to="/statistics" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Municipal Statistics
              </Link>
              <Link to="/legislative" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Legislative Hub
              </Link>
              <Link to="/legislative/ordinance-framework" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Ordinance Framework
              </Link>
              <Link to="/legislative/resolution-framework" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Resolution Framework
              </Link>
              <Link to="/budget" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Budget Overview Summary
              </Link>
              <Link to="/tracker" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Barangay Project Tracker
              </Link>
              <Link to="/budgetdocs" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Municipal Budget &amp; Docs
              </Link>
              <Link to="/contracts" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> DPWH Contracts
              </Link>
              <Link to="/transparency" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Transparency Portal
              </Link>
              <Link to="/news" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> News &amp; Announcements
              </Link>
              <Link to="/weather" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Weather &amp; River Watch
              </Link>
              <Link to="/contact" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Contact &amp; Emergency Hotlines
              </Link>
              <Link to="/faq" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> FAQ
              </Link>
              <Link to="/accessibility" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Accessibility
              </Link>
              <Link to="/privacy" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Privacy Policy
              </Link>
              <Link to="/terms" className="sitemap-link-item">
                <i className="bi bi-arrow-right" aria-hidden="true" /> Terms of Use
              </Link>
            </div>
          </div>

          <div className="sitemap-section-new">
            <div className="sitemap-section-header">
              <span className="sitemap-section-icon">
                <i className="bi bi-grid-fill" aria-hidden="true" />
              </span>
              <h2>Service Categories</h2>
            </div>
            <div className="sitemap-links-grid">
              {SERVICE_CATEGORIES.map((cat) => (
                <Link key={cat.id} to={`/services/${cat.id}`} className="sitemap-link-item">
                  <i className="bi bi-arrow-right" aria-hidden="true" /> {cat.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="sitemap-section-new">
            <div className="sitemap-section-header">
              <span className="sitemap-section-icon">
                <i className="bi bi-file-earmark-text" aria-hidden="true" />
              </span>
              <h2>Individual Service Guides</h2>
            </div>
            <div className="sitemap-links-grid">
              {SERVICES_DATA.map((srv) => (
                <Link key={srv.id} to={`/service-details/${srv.id}`} className="sitemap-link-item">
                  <i className="bi bi-arrow-right" aria-hidden="true" /> {srv.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
