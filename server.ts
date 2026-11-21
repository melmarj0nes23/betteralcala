import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_ADMIN_EMAIL = 'melmarjvelasco@gmail.com';
const DATA_DIR = path.resolve(process.cwd(), 'public/data');
const FIREBASE_CONFIG_PATH = path.resolve(process.cwd(), 'firebase-applet-config.json');

interface FirebaseConfigFile {
  apiKey?: string;
  projectId?: string;
}

interface VerifiedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

function getAllowedAdmins(): Set<string> {
  const list = [PRIMARY_ADMIN_EMAIL];
  const extra = process.env.ADMIN_EMAILS || '';
  for (const entry of extra.split(',')) {
    const trimmed = entry.trim().toLowerCase();
    if (trimmed) list.push(trimmed);
  }
  return new Set(list.map((e) => e.toLowerCase()));
}

function readFirebaseApiKey(): string | null {
  try {
    const raw = fs.readFileSync(FIREBASE_CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(raw) as FirebaseConfigFile;
    return typeof parsed.apiKey === 'string' ? parsed.apiKey : null;
  } catch {
    return null;
  }
}

async function verifyAdminBearerToken(req: Request): Promise<VerifiedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const idToken = authHeader.slice('Bearer '.length).trim();
  if (!idToken || idToken.length > 4096) {
    return null;
  }

  const apiKey = readFirebaseApiKey();
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      }
    );
    if (!verifyRes.ok) {
      return null;
    }
    const payload = (await verifyRes.json()) as {
      users?: Array<{ localId?: string; email?: string; emailVerified?: boolean }>;
    };
    const account = payload.users?.[0];
    if (!account?.localId || !account.email || account.emailVerified !== true) {
      return null;
    }
    const allowed = getAllowedAdmins();
    if (!allowed.has(account.email.toLowerCase())) {
      return null;
    }
    return {
      uid: account.localId,
      email: account.email,
      emailVerified: true,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const LOWERCASE_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'nor',
  'of', 'on', 'or', 'per', 'the', 'to', 'under', 'upon', 'with', 'among',
]);

const UPPERCASE_ACRONYMS = new Set([
  'ABC', 'AIP', 'BFP', 'BLGF', 'BOSS', 'BPLO', 'CCTV', 'COA', 'CSC', 'CY',
  'DA', 'DBM', 'DILG', 'DOH', 'DPWH', 'DRRM', 'DSWD', 'DTI', 'FOI', 'FY',
  'GAD', 'II', 'III', 'IV', 'IX', 'JMC', 'LGU', 'MCR', 'MDRRMO', 'MOA',
  'MPS', 'MSWDO', 'NDRRMC', 'NTA', 'OMABE', 'OSCA', 'PAGASA', 'PDAO',
  'PDRRMO', 'PESO', 'PHP', 'PNP', 'PRSD', 'PSA', 'PSGC', 'PWD', 'RA',
  'RHU', 'SB', 'SP', 'SRE', 'TESDA', 'VI', 'VII', 'VIII', 'XI', 'XII',
]);

function isMostlyUppercase(text: string): boolean {
  const letters = text.match(/[A-Za-z]/g);
  if (!letters || letters.length < 10) return false;
  const upperCount = letters.filter((ch) => ch >= 'A' && ch <= 'Z').length;
  return upperCount / letters.length >= 0.7;
}

function formatCivicWord(rawWord: string, forceCapitalize: boolean): string {
  const match = rawWord.match(/^([^A-Za-z0-9]*)([A-Za-z0-9-]+)([^A-Za-z0-9]*)$/);
  if (!match) return rawWord;
  const [, prefix, core, suffix] = match;

  if (core.includes('-')) {
    const parts = core.split('-').map((p, idx) => formatCivicWord(p, forceCapitalize && idx === 0));
    return `${prefix}${parts.join('-')}${suffix}`;
  }

  const upper = core.toUpperCase();
  if (UPPERCASE_ACRONYMS.has(upper)) {
    return `${prefix}${upper}${suffix}`;
  }
  if (/^\d+(st|nd|rd|th)$/i.test(core)) {
    return `${prefix}${core.toLowerCase()}${suffix}`;
  }

  const lower = core.toLowerCase();
  if (!forceCapitalize && LOWERCASE_WORDS.has(lower)) {
    return `${prefix}${lower}${suffix}`;
  }

  return `${prefix}${lower.charAt(0).toUpperCase()}${lower.slice(1)}${suffix}`;
}

function smartTitleCase(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const tokens = cleaned.split(' ');
  return tokens
    .map((token, idx) => {
      const prev = idx > 0 ? tokens[idx - 1] : '';
      const forceCap = idx === 0 || /[:—–\-(“"']$/.test(prev) || /^[(“"']/.test(token);
      return formatCivicWord(token, forceCap);
    })
    .join(' ');
}

function smartSentenceCase(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  const lower = cleaned.toLowerCase();
  let result = '';
  let capitalizeNext = true;

  for (let i = 0; i < lower.length; i += 1) {
    const ch = lower[i];
    if (capitalizeNext && ch >= 'a' && ch <= 'z') {
      result += ch.toUpperCase();
      capitalizeNext = false;
    } else {
      result += ch;
      if (ch === '.' || ch === '!' || ch === '?') {
        capitalizeNext = true;
      } else if (!/\s/.test(ch)) {
        capitalizeNext = false;
      }
    }
  }

  const properNouns = [
    'Alcala', 'Pangasinan', 'Lingayen', 'Bayambang', 'Bersamin',
    'Sangguniang Bayan', 'Sangguniang Panlalawigan', 'Province of Pangasinan',
    'Provincial Government of Pangasinan', 'Provincial Veterinary Office',
    'Municipal Agriculture Office', 'Ramon V. Guico', 'Agno River',
    'Republic Act', 'Joint Memorandum Circular', 'Memorandum of Agreement',
  ];
  for (const acronym of UPPERCASE_ACRONYMS) {
    result = result.replace(new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'g'), acronym);
  }
  for (const noun of properNouns) {
    result = result.replace(new RegExp(`\\b${noun.toLowerCase()}\\b`, 'g'), noun);
  }
  return result;
}

function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/\[\.\.\.\]|\[&#8230;\]|\[…\]/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripWordPressBoilerplate(text: string): string {
  return text
    .replace(
      /The post\s+[\s\S]*?\s+appeared first on\s+The Official Website of the Province of Pangasinan\.?/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateAtWordBoundary(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, Math.max(0, maxLen - 1));
  const lastSpace = sliced.lastIndexOf(' ');
  const base = (lastSpace > Math.floor(maxLen * 0.5) ? sliced.slice(0, lastSpace) : sliced)
    .replace(/[,;:\-–—]+$/, '')
    .trim();
  return `${base}…`;
}

function extractTag(block: string, tagName: string): string {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
  return match ? stripHtml(match[1]) : '';
}

function formatOfficialRssCandidate(opts: {
  rawTitle: string;
  rawBody: string;
  publishedDate: string;
  referenceNo: string;
}): { title: string; summary: string; details: string } {
  const { rawTitle, rawBody, publishedDate, referenceNo } = opts;
  const cleanTitleRaw = rawTitle.replace(/\s+/g, ' ').trim();
  const cleanBodyRaw = stripWordPressBoilerplate(rawBody);
  const hasDistinctBody =
    cleanBodyRaw.length > 30 &&
    cleanBodyRaw.toLowerCase() !== cleanTitleRaw.toLowerCase() &&
    !cleanTitleRaw.toLowerCase().includes(cleanBodyRaw.slice(0, 50).toLowerCase());

  // 1. Ordinance review issuance: "DECLARING MUNICIPAL ORDINANCE NO. ... ENTITLED “...” AS WITHIN THE CONFERRED POWERS..."
  const entitledMatch =
    cleanTitleRaw.match(/ENTITLED\s+[“"]([^”"]+)[”"]/i) ||
    cleanTitleRaw.match(/ENTITLED\s+[“"]([^”"]+)$/i);
  if (entitledMatch && entitledMatch[1].trim().length > 10) {
    const innerTitle = smartTitleCase(entitledMatch[1]);
    const refLabel = referenceNo ? `Municipal Ordinance No. ${referenceNo}` : 'Municipal Ordinance';
    return {
      title: truncateAtWordBoundary(innerTitle, 380),
      summary: `${refLabel} enacted by the Sangguniang Bayan of Alcala and declared valid by the Sangguniang Panlalawigan of Pangasinan (reviewed ${publishedDate}).`,
      details: truncateAtWordBoundary(smartSentenceCase(cleanTitleRaw), 1500),
    };
  }

  // 2. Provincial MOA authorization: "AUTHORIZING THE PROVINCIAL GOVERNOR ... RELATIVE TO <SUBJECT>"
  const moaMatch = cleanTitleRaw.match(
    /MEMORANDUM OF AGREEMENT\s*(?:\(MOA\))?[\s\S]*?RELATIVE TO\s+(.+)$/i
  );
  if (moaMatch && moaMatch[1].trim().length > 5) {
    const topic = smartTitleCase(moaMatch[1]);
    return {
      title: truncateAtWordBoundary(`Provincial MOA Authorization: ${topic}`, 380),
      summary: truncateAtWordBoundary(smartSentenceCase(cleanTitleRaw), 500),
      details: truncateAtWordBoundary(smartSentenceCase(cleanTitleRaw), 1500),
    };
  }

  // 3. News / advisory with full <content:encoded> or distinct <description>
  const formattedTitle = isMostlyUppercase(cleanTitleRaw)
    ? smartTitleCase(cleanTitleRaw)
    : cleanTitleRaw;

  if (hasDistinctBody) {
    const formattedBody = isMostlyUppercase(cleanBodyRaw)
      ? smartSentenceCase(cleanBodyRaw)
      : cleanBodyRaw.replace(/^([A-Z\s,]+)\s*[—–-]\s*/, (_, place) => `${smartTitleCase(place)} — `);
    // Extract concise 1-2 sentences for summary
    const sentences = formattedBody.match(/[^.!?]+[.!?]+/g);
    const conciseSummary =
      sentences && sentences.length >= 2
        ? `${sentences[0].trim()} ${sentences[1].trim()}`
        : formattedBody;

    return {
      title: truncateAtWordBoundary(formattedTitle, 380),
      summary: truncateAtWordBoundary(conciseSummary, 500),
      details: truncateAtWordBoundary(formattedBody, 1500),
    };
  }

  // 4. General issuance fallback without duplicating title as summary
  return {
    title: truncateAtWordBoundary(formattedTitle, 380),
    summary: `Official Sangguniang Panlalawigan issuance referencing Alcala, Pangasinan (published ${publishedDate}). Open the verified source link for full document details.`,
    details: truncateAtWordBoundary(smartSentenceCase(cleanTitleRaw), 1500),
  };
}

function isOfficialHttpsUrl(rawUrl: string, allowedHosts: string[]): boolean {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return allowedHosts.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function buildSafeId(prefix: string, raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${prefix}-${slug || 'record'}`;
}

function readKnownRefs(): Set<string> {
  const refs = new Set<string>();
  const files: Array<[string, string, string[]]> = [
    ['news.json', 'news', ['id', 'title']],
    ['ordinances.json', 'ordinances', ['ordinanceNo', 'title']],
    ['resolutions.json', 'resolutions', ['resolutionNo', 'title']],
    ['fiscal_transparency.json', 'fiscal_years', ['spResolution', 'appropriationOrdinance']],
  ];

  for (const [fileName, rootKey, fields] of files) {
    try {
      const fullPath = path.join(DATA_DIR, fileName);
      if (!fs.existsSync(fullPath)) continue;
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as Record<string, unknown>;
      const arr = parsed[rootKey];
      if (!Array.isArray(arr)) continue;
      for (const item of arr) {
        if (!item || typeof item !== 'object') continue;
        for (const f of fields) {
          const val = (item as Record<string, unknown>)[f];
          if (typeof val === 'string' && val.trim()) {
            refs.add(val.trim().toLowerCase());
          }
        }
      }
    } catch {
      // Ignore malformed optional static file
    }
  }
  return refs;
}

async function fetchExternalResource(url: string, accept: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: accept,
        'User-Agent': 'BetterAlcala-AdminSync/1.0 (+https://www.pangasinan.gov.ph/)',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function runOfficialSyncCheck() {
  const knownRefs = readKnownRefs();
  const sourcesChecked: string[] = [];
  const warnings: string[] = [];

  interface SyncCandidate {
    id: string;
    datasetType: 'ordinances' | 'resolutions' | 'news' | 'fiscal_years';
    title: string;
    summary: string;
    details: string;
    category: string;
    publishedDate: string;
    referenceNo: string;
    sourceTitle: string;
    sourceUrl: string;
    issuingAgency: string;
    detectedAmount: number | null;
    suggestedStatus: 'Needs Review';
  }

  const candidates: SyncCandidate[] = [];

  // 1. Official Pangasinan Provincial Government RSS2 feed (Alcala query)
  const pangasinanFeedUrl = 'https://www.pangasinan.gov.ph/?s=Alcala&feed=rss2';
  try {
    const xml = await fetchExternalResource(
      pangasinanFeedUrl,
      'application/rss+xml, application/xml, text/xml'
    );
    sourcesChecked.push('pangasinan.gov.ph (RSS2)');
    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    for (const itemXml of items) {
      const rawTitle = extractTag(itemXml, 'title');
      const link = extractTag(itemXml, 'link');
      const pubDateRaw = extractTag(itemXml, 'pubDate');
      const encodedContent = extractTag(itemXml, 'content:encoded');
      const description = extractTag(itemXml, 'description');
      const rawBody = encodedContent || description;

      if (!rawTitle || !isOfficialHttpsUrl(link, ['pangasinan.gov.ph'])) continue;
      if (!`${rawTitle} ${rawBody}`.toLowerCase().includes('alcala')) continue;

      const parsedDate = pubDateRaw ? new Date(pubDateRaw) : null;
      const publishedDate =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate.toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10);

      const ordMatch =
        rawTitle.match(/Ordinance\s+No\.?\s*([\w-]+)/i) ||
        rawBody.match(/Ordinance\s+No\.?\s*([\w-]+)/i);
      const resMatch =
        rawTitle.match(/Resolution\s+No\.?\s*([\w-]+)/i) ||
        rawBody.match(/Resolution\s+No\.?\s*([\w-]+)/i);
      const pesoMatch = `${rawTitle} ${rawBody}`.match(/(?:₱|PHP|Php)\s*([\d,]+(?:\.\d{2})?)/);
      const detectedAmount = pesoMatch ? Number(pesoMatch[1].replace(/,/g, '')) : null;

      let datasetType: SyncCandidate['datasetType'] = 'news';
      let category = 'Government Announcement';
      let referenceNo = '';

      if (ordMatch) {
        datasetType = 'ordinances';
        category = 'Municipal Legislation';
        referenceNo = ordMatch[1];
      } else if (resMatch) {
        datasetType = 'resolutions';
        category = 'Provincial Issuance';
        referenceNo = `SP Res. No. ${resMatch[1]}`;
      } else if (rawTitle.toLowerCase().includes('memorandum of agreement')) {
        datasetType = 'resolutions';
        category = 'Provincial MOA / Resolution';
      } else if (rawTitle.toLowerCase().includes('rainfall warning')) {
        datasetType = 'news';
        category = 'Emergency Notice';
      }

      const formatted = formatOfficialRssCandidate({
        rawTitle,
        rawBody,
        publishedDate,
        referenceNo,
      });

      const alreadyKnown =
        knownRefs.has(rawTitle.toLowerCase()) ||
        knownRefs.has(formatted.title.toLowerCase()) ||
        (referenceNo && knownRefs.has(referenceNo.toLowerCase()));
      if (alreadyKnown) continue;

      const idSeed = referenceNo || `${publishedDate}-${rawTitle.slice(0, 48)}`;
      candidates.push({
        id: buildSafeId('sync', idSeed),
        datasetType,
        title: formatted.title,
        summary: formatted.summary,
        details: formatted.details,
        category,
        publishedDate,
        referenceNo,
        sourceTitle: `Province of Pangasinan Issuance (${publishedDate})`,
        sourceUrl: link,
        issuingAgency: 'Province of Pangasinan / Sangguniang Panlalawigan',
        detectedAmount:
          detectedAmount && Number.isFinite(detectedAmount) && detectedAmount > 0
            ? detectedAmount
            : null,
        suggestedStatus: 'Needs Review',
      });
    }
  } catch (err) {
    warnings.push(
      `pangasinan.gov.ph feed check unavailable: ${err instanceof Error ? err.message : 'Network error'}`
    );
  }

  // 2. Official PSGC Cloud API check for Municipality of Alcala (0105504000)
  let psgcCheck: {
    source: string;
    officialCount: number | null;
    localCount: number;
    matches: boolean;
  } = {
    source: 'psgc.cloud',
    officialCount: null,
    localCount: 21,
    matches: false,
  };

  try {
    const rawPsgc = await fetchExternalResource(
      'https://psgc.cloud/api/municipalities/0105504000/barangays',
      'application/json'
    );
    sourcesChecked.push('psgc.cloud (PSGC 0105504000)');
    const barangays = JSON.parse(rawPsgc) as unknown;
    let localCount = 21;
    try {
      const demo = JSON.parse(
        fs.readFileSync(path.join(DATA_DIR, 'demographics.json'), 'utf8')
      ) as { barangays?: unknown[] };
      if (Array.isArray(demo.barangays)) {
        localCount = demo.barangays.length;
      }
    } catch {
      // keep 21 fallback
    }
    const officialCount = Array.isArray(barangays) ? barangays.length : null;
    psgcCheck = {
      source: 'psgc.cloud',
      officialCount,
      localCount,
      matches: officialCount === localCount,
    };
  } catch (err) {
    warnings.push(
      `psgc.cloud barangay check unavailable: ${err instanceof Error ? err.message : 'Network error'}`
    );
  }

  return {
    checkedAt: new Date().toISOString(),
    sourcesChecked,
    candidates,
    psgcCheck,
    warnings,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/civic-sync/check', async (req: Request, res: Response) => {
    const admin = await verifyAdminBearerToken(req);
    if (!admin) {
      res.status(401).json({
        error: 'Unauthorized: Please sign in with a verified administrator Google account.',
      });
      return;
    }

    try {
      const result = await runOfficialSyncCheck();
      res.json(result);
    } catch (err) {
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to query official government sources.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BetterAlcala server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
