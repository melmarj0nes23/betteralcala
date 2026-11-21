import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  const [version, setVersion] = useState('1.0.0');

  useEffect(() => {
    fetch('/version.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.version) setVersion(data.version);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main-new">
          <div className="footer-brand">
            <Link to="/" aria-label="BetterAlcala Home" className="brand-lockup brand-lockup--footer mb-4">
              <img
                src="/assets/images/logo/alcala-seal.png"
                alt="BetterAlcala logo"
                className="footer-logo !mb-0"
                width={52}
                height={52}
              />
              <span className="brand-text-group">
                <span className="brand-wordmark">
                  <span className="brand-better">Better</span>
                  <span className="brand-alcala">Alcala</span>
                </span>
                <span className="brand-subtitle">Alcala, Pangasinan · BetterLGU</span>
              </span>
            </Link>
            <p className="footer-tagline">{t('footer-tagline')}</p>
            <div className="footer-social-new">
              <a
                href="https://facebook.com/melmarj0nes23/"
                className="footer-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LGU Alcala Official Facebook Page"
              >
                <i className="bi bi-facebook" aria-hidden="true" />
              </a>
              <a
                href="https://bettergov.ph/"
                className="footer-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BetterGov.ph Initiative"
              >
                <i className="bi bi-globe2" aria-hidden="true" />
              </a>
              <a
                href="https://github.com/melmarj0nes23/betteralcala"
                className="footer-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BetterAlcala GitHub Repository"
              >
                <i className="bi bi-github" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>{t('footer-quick-links')}</h4>
            <ul className="footer-links-new">
              <li>
                <Link to="/services">Municipal Services Directory</Link>
              </li>
              <li>
                <Link to="/news">News &amp; Announcements</Link>
              </li>
              <li>
                <Link to="/sitemap">Sitemap</Link>
              </li>
              <li>
                <Link to="/terms">Terms of Use</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/accessibility">Accessibility</Link>
              </li>
              <li>
                <Link to="/faq">Frequently Asked Questions</Link>
              </li>
              <li>
                <Link to="/admin">Admin Data Sync</Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>{t('footer-resources')}</h4>
            <ul className="footer-links-new">
              <li>
                <a href="https://data.gov.ph" target="_blank" rel="noopener noreferrer">
                  Open Data Philippines
                </a>
              </li>
              <li>
                <a href="https://www.foi.gov.ph/" target="_blank" rel="noopener noreferrer">
                  Freedom of Information (FOI)
                </a>
              </li>
              <li>
                <a href="https://www.pangasinan.gov.ph/" target="_blank" rel="noopener noreferrer">
                  Province of Pangasinan
                </a>
              </li>
              <li>
                <a href="https://psa.gov.ph/" target="_blank" rel="noopener noreferrer">
                  Philippine Statistics Authority (PSA)
                </a>
              </li>
              <li>
                <a href="https://blgf.gov.ph/" target="_blank" rel="noopener noreferrer">
                  Bureau of Local Gov’t Finance (BLGF)
                </a>
              </li>
              <li>
                <a href="https://www.coa.gov.ph/" target="_blank" rel="noopener noreferrer">
                  Commission on Audit (COA)
                </a>
              </li>
              <li>
                <a href="https://www.dpwh.gov.ph/" target="_blank" rel="noopener noreferrer">
                  DPWH Infrastructure Portal
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Community &amp; Transparency</h4>
            <ul className="footer-links-new">
              <li
                className="text-white/85 text-sm"
                aria-label="Cost to the People of Alcala: Zero Pesos"
              >
                {t('footer-cost')} <strong className="text-white">₱0</strong>
              </li>
              <li>
                <Link to="/contact#feedback">{t('footer-volunteer')}</Link>
              </li>
              <li>
                <a href="https://bettergov.ph/" target="_blank" rel="noopener noreferrer">
                  {t('footer-contribute')}
                </a>
              </li>
            </ul>
            <div className="footer-partners mt-4">
              <a
                href="https://bettergov.ph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="BetterGov.ph"
              >
                <img
                  src="/assets/images/logo/bettergov-footer.svg"
                  alt="BetterGov.ph"
                  className="footer-partner-logo"
                  width={120}
                  height={28}
                  loading="lazy"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-new">
          <div className="footer-copyright">
            <span className="footer-copyright-text">
              &copy; {currentYear} {t('footer-copyright-text')}
            </span>
            <span className="footer-copyright-license">MIT | CC BY 4.0</span>
            <span className="footer-copyright-disclaimer">{t('footer-copyright-disclaimer')}</span>
            <span className="footer-version">
              <i className="bi bi-boxes" aria-hidden="true" /> {version ? `Ver. ${version}` : ''}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
