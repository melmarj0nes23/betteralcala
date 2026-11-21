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
    ...existingResolutions.map((r) => r.resolutionNo.toLowerCase()),
  ]);

  const candidates = [];
  for (const itemXml of items) {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const pubDateRaw = extractTag(itemXml, 'pubDate');
    const description = extractTag(itemXml, 'description');

    const combined = `${title} ${description}`.toLowerCase();
    if (!combined.includes('alcala')) continue;

    const parsedDate = pubDateRaw ? new Date(pubDateRaw) : null;
    const publishedDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString().slice(0, 10)
        : '';

    const resMatch =
      title.match(/Resolution\s+No\.?\s*([\w-]+)/i) ||
      description.match(/Resolution\s+No\.?\s*([\w-]+)/i);
    const ordMatch =
      title.match(/Ordinance\s+No\.?\s*([\w-]+)/i) ||
      description.match(/Ordinance\s+No\.?\s*([\w-]+)/i);
    const refTag = resMatch ? `SP Res. No. ${resMatch[1]}` : ordMatch ? ordMatch[1] : '';

    const alreadyTracked =
      knownTitles.has(title.toLowerCase()) ||
      (refTag && knownTitles.has(refTag.toLowerCase()));

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
    }
  }

  return { checkedItems: items.length, candidates };
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
