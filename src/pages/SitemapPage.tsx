import Layout from '../components/layout/Layout';
import PageMasthead from '../components/v2/layout/PageMasthead';
import Container from '../components/v2/ui/Container';
import SectionHeader from '../components/v2/ui/SectionHeader';
import ArrowLink from '../components/v2/ui/ArrowLink';
import { useLanguage } from '../contexts/LanguageContext';
import { SERVICE_CATEGORIES, SERVICES_DATA } from '../data/servicesData';

const MAIN_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services Directory', to: '/services' },
  { label: 'Government & 21 Barangays', to: '/government' },
  { label: 'Elected & Barangay Officials', to: '/officials' },
  { label: 'Municipal Statistics', to: '/statistics' },
  { label: 'Legislative Hub', to: '/legislative' },
  { label: 'Ordinance Framework', to: '/legislative/ordinance-framework' },
  { label: 'Resolution Framework', to: '/legislative/resolution-framework' },
  { label: 'News & Announcements', to: '/news' },
  { label: 'Weather & River Watch', to: '/weather' },
  { label: 'Contact & Emergency Hotlines', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Accessibility', to: '/accessibility' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Use', to: '/terms' },
];

export default function SitemapPage() {
  const { t } = useLanguage();
  return (
    <Layout breadcrumbs={[{ label: t('sitemap-title') }]}>
      <PageMasthead title={t('sitemap-title')} lede={t('sitemap-desc')} />

      <section className="py-12 max-md:py-8">
        <Container className="space-y-12">
          <div>
            <SectionHeader label="Main Navigation" meta={`${MAIN_LINKS.length} pages`} />
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 border-y border-ed-rule py-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {MAIN_LINKS.map((item) => (
                <div key={item.to}>
                  <ArrowLink to={item.to}>{item.label}</ArrowLink>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader label="Service Categories" meta={`${SERVICE_CATEGORIES.length} categories`} />
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 border-y border-ed-rule py-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {SERVICE_CATEGORIES.map((cat) => (
                <div key={cat.id}>
                  <ArrowLink to={`/services/${cat.id}`}>{cat.title}</ArrowLink>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader label="Individual Service Guides" meta={`${SERVICES_DATA.length} guides`} />
            <div className="grid grid-cols-3 gap-x-8 gap-y-3 border-y border-ed-rule py-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {SERVICES_DATA.map((srv) => (
                <div key={srv.id}>
                  <ArrowLink to={`/service-details/${srv.id}`}>{srv.title}</ArrowLink>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
