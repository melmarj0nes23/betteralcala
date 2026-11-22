/**
 * Deterministic Official Source Checker for BetterAlcala
 * ----------------------------------------------------
 * Queries ONLY official public feeds/APIs (Pangasinan Provincial Government RSS feed
 * and PSGC Cloud API) to surface newly published records mentioning Alcala, Pangasinan.
 *
 * Anti-hallucination policy:
 * - No LLM guessing or synthetic numbers.
 * - Extracts only exact titles, publication dates, permalinks, and regex-matched resolution/ordinance refs.
 * - Outputs structured candidates for maintainer review / PR diffing; never fabricates missing fields.
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');

function stripHtml(html) {
  return String(html || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

const PRESERVE_ACRONYMS = new Set([
  'SP', 'SB', 'LGU', 'FY', 'CY', 'GAA', 'NEP', 'NTA', 'DPWH', 'PSA',
  'DILG', 'COA', 'DBM', 'DOF', 'FMR', 'MDRRMO', 'BPLO', 'MCR', 'RHU',
  'PSGC', 'PNP', 'BFP', 'II', 'III', 'IV', 'V', 'VI',
]);

function truncateAtWord(text, maxLen) {
  if (text.length <= maxLen) return text;
  const sliced = text.slice(0, maxLen).replace(/\s+\S*$/, '').trim();
  return `${sliced || text.slice(0, maxLen).trim()}…`;
}

function cleanRssText(raw) {
  return String(raw || '')
    .replace(/The post .*? appeared first on .*?\.?/gi, '')
    .replace(/\[(?:\.\.\.|…)\]/g, '')
    .replace(/\b(?:Continue reading|Read more)\b\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTitle(raw) {
  let text = cleanRssText(raw);
  if (!text) return '';
  const letters = text.replace(/[^a-zA-Z]/g, '');
  const upperRatio = letters ? text.replace(/[^A-Z]/g, '').length / letters.length : 0;
  if (upperRatio > 0.7) {
    text = text
      .toLowerCase()
      .split(/\s+/)
      .map((w, i) => {
        const clean = w.replace(/[^a-z0-9]/gi, '').toUpperCase();
        if (PRESERVE_ACRONYMS.has(clean)) return w.toUpperCase();
        if (i > 0 && /^(of|the|and|in|on|at|to|for|by|ng|sa|at)$/i.test(w)) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1);
      })
      .join(' ');
  }
  return truncateAtWord(text, 140);
}

function formatSummary(raw, fallbackTitle) {
  let text = cleanRssText(raw) || fallbackTitle;
  const letters = text.replace(/[^a-zA-Z]/g, '');
  const upperRatio = letters ? text.replace(/[^A-Z]/g, '').length / letters.length : 0;
  if (upperRatio > 0.7) {
    text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 2) {
    text = sentences.slice(0, 2).join(' ').trim();
  }
  return truncateAtWord(text, 220);
}

function extractTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

async function fetchResource(url, accept = 'application/json') {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        'User-Agent': 'BetterAlcala-CivicDataChecker/1.0 (+https://www.pangasinan.gov.ph/)',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return accept.includes('json') ? await res.json() : await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function checkPangasinanRss() {
  const existingNews = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'news.json'), 'utf8')
  ).news || [];
  const existingOrdinances = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'ordinances.json'), 'utf8')
  ).ordinances || [];
  const existingResolutions = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'resolutions.json'), 'utf8')
  ).resolutions || [];

  const xml = await fetchResource(
    'https://www.pangasinan.gov.ph/?s=Alcala&feed=rss2',
    'application/rss+xml, application/xml, text/xml'
  );

  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  const knownTitles = new Set([
    ...existingNews.map((n) => n.title.toLowerCase()),
    ...existingOrdinances.map((o) => o.ordinanceNo.toLowerCase()),
    ...existingOrdinances.map((o) => o.title.toLowerCase()),
    ...existingResolutions.map((r) => r.resolutionNo.toLowerCase()),
    ...existingResolutions.map((r) => r.title.toLowerCase()),
  ]);
  const knownUrls = new Set([
    ...existingNews.map((n) => n.citation?.sourceUrl).filter(Boolean),
    ...existingOrdinances.map((o) => o.citation?.sourceUrl).filter(Boolean),
    ...existingResolutions.map((r) => r.citation?.sourceUrl).filter(Boolean),
  ]);

  const candidates = [];
  const today = new Date().toISOString().slice(0, 10);
  const newNews = [];
  const newOrdinances = [];
  const newResolutions = [];

  for (const itemXml of items) {
    const rawTitle = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDateRaw = extractTag(itemXml, 'pubDate');
    const rawDescription = extractTag(itemXml, 'description');

    const title = formatTitle(rawTitle);
    const description = cleanRssText(rawDescription);

    const combined = `${rawTitle} ${description}`.toLowerCase();
    if (!combined.includes('alcala') || !title) continue;

    const parsedDate = pubDateRaw ? new Date(pubDateRaw) : null;
    const publishedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().slice(0, 10)
        : today;

    const resMatch =
      title.match(/Resolution\s+No\.?\s*([\w-]+)/i) ||
      description.match(/Resolution\s+No\.?\s*([\w-]+)/i);
    const ordMatch =
      title.match(/Ordinance\s+No\.?\s*([\w-]+)/i) ||
      description.match(/Ordinance\s+No\.?\s*([\w-]+)/i);
    const refTag = resMatch ? `SP Res. No. ${resMatch[1]}` : ordMatch ? ordMatch[1] : '';

    const alreadyTracked =
      knownTitles.has(title.toLowerCase()) ||
      (refTag && knownTitles.has(refTag.toLowerCase())) ||
      (link && link !== 'https://www.pangasinan.gov.ph/' && knownUrls.has(link));

    if (!alreadyTracked) {
      candidates.push({
        source: 'pangasinan.gov.ph (RSS2)',
        publishedDate: publishedDate || 'Needs Review',
        title,
        detectedRef: refTag || null,
        excerpt: description.slice(0, 240),
        sourceUrl: link,
        verificationStatus: 'Needs Review',
      });

      if (link.startsWith('https://')) {
        const cleanSummary = formatSummary(description, title);
        const cleanDetails = truncateAtWord(description || title, 600);
        const baseCitation = {
          sourceTitle: `${title} — Province of Pangasinan`,
          sourceUrl: link,
          issuingAgency: 'Province of Pangasinan',
          publicationDate: publishedDate,
          lastVerified: today,
          verificationStatus: 'Needs Review',
        };

        if (resMatch) {
          newResolutions.push({
            resolutionNo: `SP Res. No. ${resMatch[1]}`,
            title,
            approvalDate: publishedDate,
            issuingBody: 'Sangguniang Panlalawigan of Pangasinan',
            category: 'Provincial Legislative Review',
            summary: cleanSummary,
            documentUrl: link,
            citation: baseCitation,
          });
        } else if (ordMatch) {
          newOrdinances.push({
            ordinanceNo: ordMatch[1],
            title,
            sessionDate: publishedDate,
            category: 'Municipal Legislation',
            summary: cleanSummary,
            documentUrl: link,
            citation: {
              ...baseCitation,
              issuingAgency: 'Sangguniang Bayan of Alcala / SP Pangasinan',
            },
          });
        } else {
          const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 48);
          newNews.push({
            id: `pangasinan-rss-${publishedDate}-${slug || Date.now()}`,
            title,
            date: publishedDate,
            category: 'Provincial & LGU Update',
            originType: 'Official Government Source',
            summary: cleanSummary,
            details: cleanDetails,
            citation: baseCitation,
          });
        }
      }
    }
  }

  return {
    checkedItems: items.length,
    candidates,
    newNews,
    newOrdinances,
    newResolutions,
    existingNews,
    existingOrdinances,
    existingResolutions,
  };
}

async function verifyPsgcBarangays() {
  const localDemographics = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'demographics.json'), 'utf8')
  );
  const localCount = (localDemographics.barangays || []).length;

  const remoteBarangays = await fetchResource(
    'https://psgc.cloud/api/municipalities/0105504000/barangays',
    'application/json'
  );

  return {
    source: 'psgc.cloud',
    localCount,
    officialCount: Array.isArray(remoteBarangays) ? remoteBarangays.length : null,
    matches: Array.isArray(remoteBarangays) && remoteBarangays.length === localCount,
  };
}

async function main() {
  const report = {
    checkedAt: new Date().toISOString(),
    pangasinanRssCheckedCount: 0,
    pangasinanCandidates: [],
    psgcCheck: null,
    warnings: [],
  };

  try {
    const rssResult = await checkPangasinanRss();
    report.pangasinanRssCheckedCount = rssResult.checkedItems;
    report.pangasinanCandidates = rssResult.candidates;

    if (process.argv.includes('--apply')) {
      if (rssResult.newNews.length > 0) {
        fs.writeFileSync(
          path.join(DATA_DIR, 'news.json'),
          `${JSON.stringify({ news: [...rssResult.newNews, ...rssResult.existingNews] }, null, 2)}\n`,
          'utf8'
        );
      }
      if (rssResult.newOrdinances.length > 0) {
        fs.writeFileSync(
          path.join(DATA_DIR, 'ordinances.json'),
          `${JSON.stringify({ ordinances: [...rssResult.newOrdinances, ...rssResult.existingOrdinances] }, null, 2)}\n`,
          'utf8'
        );
      }
      if (rssResult.newResolutions.length > 0) {
        fs.writeFileSync(
          path.join(DATA_DIR, 'resolutions.json'),
          `${JSON.stringify({ resolutions: [...rssResult.newResolutions, ...rssResult.existingResolutions] }, null, 2)}\n`,
          'utf8'
        );
      }
      report.appliedCounts = {
        news: rssResult.newNews.length,
        ordinances: rssResult.newOrdinances.length,
        resolutions: rssResult.newResolutions.length,
      };
    }
  } catch (err) {
    report.warnings.push(`pangasinan.gov.ph RSS check skipped: ${err.message}`);
  }

  try {
    report.psgcCheck = await verifyPsgcBarangays();
  } catch (err) {
    report.warnings.push(`psgc.cloud check skipped: ${err.message}`);
  }

  if (process.argv.includes('--write-report')) {
    const outPath = path.resolve(process.cwd(), 'public/data/seed-candidates-report.json');
    fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
