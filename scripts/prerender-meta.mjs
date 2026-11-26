import fs from 'node:fs';
import path from 'node:path';

const SITE_ORIGIN = 'https://betteralcala.org';
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const BASE_HTML_PATH = path.join(DIST_DIR, 'index.html');

const ROUTES = [
  {
    path: '/budget',
    title: 'Transparency & Budget Overview | BetterAlcala',
    description:
      'FY 2026 municipal budget snapshot, funding mix, and direct access to Alcala, Pangasinan project trackers and public records.',
  },
  {
    path: '/tracker',
    title: 'Barangay Project Tracker | BetterAlcala',
    description:
      'Filter funded roads, farm-to-market roads, flood control, and multi-purpose buildings across all 21 barangays in Alcala, Pangasinan.',
  },
  {
    path: '/budgetdocs',
    title: 'Municipal Budget & Docs | BetterAlcala',
    description:
      'Approved municipal appropriations (FY 2024–2026), BLGF SRE, COA audit reports, and procurement disclosures for Alcala, Pangasinan.',
  },
  {
    path: '/contracts',
    title: 'DPWH Contracts | BetterAlcala',
    description:
      'Searchable DPWH infrastructure contracts, project budgets, contractors, and completion status in Alcala, Pangasinan.',
  },
  {
    path: '/transparency',
    title: 'Transparency Portal | BetterAlcala',
    description:
      'Compare FY 2027 NEP vs. House Bill and 2020–2026 Enacted GAA allocations for Alcala, Pangasinan, and nationwide LGUs.',
  },
  {
    path: '/services',
    title: 'Municipal Services Directory | BetterAlcala',
    description:
      'Step-by-step municipal service guides, requirements, fees, and processing offices for residents of Alcala, Pangasinan.',
  },
  {
    path: '/statistics',
    title: 'Barangay Profiles & Municipal Statistics | BetterAlcala',
    description:
      'Population, barangay profiles, PSA census figures, and municipal development indicators for all 21 barangays of Alcala, Pangasinan.',
  },
  {
    path: '/legislative',
    title: 'Legislative & Sangguniang Bayan | BetterAlcala',
    description:
      'Sangguniang Bayan legislative hub, enacted municipal ordinances, and resolutions for Alcala, Pangasinan.',
  },
  {
    path: '/legislative/ordinance-framework',
    title: 'Municipal Ordinance Framework | BetterAlcala',
    description:
      'Enacted municipal ordinances and local regulatory codes of the Sangguniang Bayan of Alcala, Pangasinan.',
  },
  {
    path: '/legislative/resolution-framework',
    title: 'Municipal Resolution Framework | BetterAlcala',
    description:
      'Sangguniang Bayan resolutions and official legislative actions of the Municipality of Alcala, Pangasinan.',
  },
  {
    path: '/government',
    title: 'Government Structure & Municipal Offices | BetterAlcala',
    description:
      'Directory of municipal department offices, services, and local government structure in Alcala, Pangasinan.',
  },
  {
    path: '/officials',
    title: 'Barangay Officials Directory | BetterAlcala',
    description:
      'Complete directory of Punong Barangays, Sangguniang Barangay Members, SK Chairpersons, and Barangay Secretaries across all 21 barangays of Alcala, Pangasinan.',
  },
  {
    path: '/news',
    title: 'News & Announcements | BetterAlcala',
    description:
      'Public advisories, civic updates, and community announcements for Alcala, Pangasinan.',
  },
  {
    path: '/weather',
    title: 'Alcala Weather & River Watch | BetterAlcala',
    description:
      'Live weather, PAGASA Heat Index tiers, 48-hour & 6-day forecast, air quality, and Agno River discharge for Alcala, Pangasinan.',
  },
  {
    path: '/contact',
    title: 'Contact & Emergency Hotlines | BetterAlcala',
    description:
      'Emergency hotlines, municipal hall contact details, and official office hours in Alcala, Pangasinan.',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | BetterAlcala',
    description:
      'Answers to common questions about BetterAlcala, data sources, municipal services, and budget transparency.',
  },
  {
    path: '/sitemap',
    title: 'Sitemap | BetterAlcala',
    description:
      'Complete directory of pages, services, barangays, and transparency tools on BetterAlcala.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | BetterAlcala',
    description: 'Privacy notice and data handling practices for BetterAlcala.',
  },
  {
    path: '/terms',
    title: 'Terms of Use | BetterAlcala',
    description: 'Terms of use and public-data disclaimer for BetterAlcala.',
  },
  {
    path: '/accessibility',
    title: 'Accessibility Statement | BetterAlcala',
    description: 'Web accessibility commitment and keyboard navigation support on BetterAlcala.',
  },
];

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (!fs.existsSync(BASE_HTML_PATH)) {
  console.error(`Missing ${BASE_HTML_PATH}. Run vite build first.`);
  process.exit(1);
}

const baseHtml = fs.readFileSync(BASE_HTML_PATH, 'utf8');

for (const route of ROUTES) {
  const canonicalUrl = `${SITE_ORIGIN}${route.path}`;
  const safeTitleHtml = escapeHtml(route.title);
  const safeTitleAttr = escapeAttr(route.title);
  const safeDescAttr = escapeAttr(route.description);

  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitleHtml}</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${safeDescAttr}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${canonicalUrl}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${safeTitleAttr}" />`
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${safeDescAttr}" />`
    )
    .replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
      `<meta name="twitter:title" content="${safeTitleAttr}" />`
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?content="[^"]*"\s*\/?>/,
      `<meta name="twitter:description" content="${safeDescAttr}" />`
    );

  const outDir = path.join(DIST_DIR, route.path.replace(/^\/+/, ''));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
}

console.log(`Generated static Open Graph / meta HTML for ${ROUTES.length} routes.`);
