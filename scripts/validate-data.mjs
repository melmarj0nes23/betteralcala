import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'public/data');

const VALID_STATUSES = new Set(['Verified', 'Needs Review', 'Outdated', 'Unavailable']);

// Only allow official government, LGU, utility, or authoritative Philippine statistical sources
const ALLOWED_SOURCE_DOMAINS = [
  'gov.ph',
  'psgc.cloud',
  'cenpelco.com',
  'pangasinan.gov.ph',
  'dpwh.gov.ph',
  'psa.gov.ph',
  'blgf.gov.ph',
  'coa.gov.ph',
  'dilg.gov.ph',
  'dti.gov.ph',
  'foi.gov.ph',
  'ndrrmc.gov.ph',
  'pagibigfund.gov.ph',
  'sss.gov.ph',
  'philhealth.gov.ph',
  'philgeps.gov.ph',
  'comelec.gov.ph',
];

function isAllowedSourceUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function assertCitation(citation, contextLabel, errors) {
  if (!citation || typeof citation !== 'object') {
    errors.push(`${contextLabel}: missing citation object`);
    return;
  }
  if (!citation.sourceTitle || typeof citation.sourceTitle !== 'string') {
    errors.push(`${contextLabel}: missing citation.sourceTitle`);
  }
  if (!isAllowedSourceUrl(citation.sourceUrl)) {
    errors.push(`${contextLabel}: citation.sourceUrl "${citation.sourceUrl}" is not an allowlisted HTTPS official domain`);
  }
  if (!VALID_STATUSES.has(citation.verificationStatus)) {
    errors.push(`${contextLabel}: invalid citation.verificationStatus "${citation.verificationStatus}"`);
  }
  if (!citation.lastVerified || !/^\d{4}-\d{2}-\d{2}$/.test(citation.lastVerified)) {
    errors.push(`${contextLabel}: citation.lastVerified must be YYYY-MM-DD`);
  }
}

const DATASET_VALIDATORS = {
  'fiscal_transparency.json': {
    rootKey: 'fiscal_years',
    validateItem(item, idx, errors) {
      const ctx = `fiscal_transparency.json[${idx}]`;
      if (typeof item.fiscalYear !== 'number' || item.fiscalYear < 2000 || item.fiscalYear > 2100) {
        errors.push(`${ctx}: invalid fiscalYear`);
      }
      if (typeof item.approvedBudget !== 'number' || item.approvedBudget <= 0) {
        errors.push(`${ctx}: approvedBudget must be a positive number`);
      }
      if (!item.spResolution || !item.appropriationOrdinance) {
        errors.push(`${ctx}: missing spResolution or appropriationOrdinance`);
      }
      const hasMissingExecution =
        item.obligations === null || item.disbursements === null || item.actualExpenditures === null;
      if (hasMissingExecution && item.sreStatus === 'Verified') {
        errors.push(`${ctx}: sreStatus cannot be "Verified" while execution figures are null (anti-hallucination rule)`);
      }
      assertCitation(item.citation, ctx, errors);
    },
  },
  'ordinances.json': {
    rootKey: 'ordinances',
    validateItem(item, idx, errors) {
      const ctx = `ordinances.json[${idx}]`;
      if (!item.ordinanceNo || !item.title || !item.summary) {
        errors.push(`${ctx}: missing ordinanceNo, title, or summary`);
      }
      assertCitation(item.citation, ctx, errors);
    },
  },
  'resolutions.json': {
    rootKey: 'resolutions',
    validateItem(item, idx, errors) {
      const ctx = `resolutions.json[${idx}]`;
      if (!item.resolutionNo || !item.title || !item.issuingBody) {
        errors.push(`${ctx}: missing resolutionNo, title, or issuingBody`);
      }
      assertCitation(item.citation, ctx, errors);
    },
  },
  'dpwh-projects.json': {
    rootKey: 'projects',
    validateItem(item, idx, errors) {
      const ctx = `dpwh-projects.json[${idx}]`;
      if (!item.id || !item.name || !item.barangay) {
        errors.push(`${ctx}: missing id, name, or barangay`);
      }
      assertCitation(item.citation, ctx, errors);
    },
  },
  'news.json': {
    rootKey: 'news',
    validateItem(item, idx, errors) {
      const ctx = `news.json[${idx}]`;
      if (!item.id || !item.title || !item.date || !item.summary) {
        errors.push(`${ctx}: missing id, title, date, or summary`);
      }
      assertCitation(item.citation, ctx, errors);
    },
  },
};

function runValidation() {
  const errors = [];
  let checkedFiles = 0;

  for (const [fileName, spec] of Object.entries(DATASET_VALIDATORS)) {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      errors.push(`Missing dataset file: public/data/${fileName}`);
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      errors.push(`${fileName}: invalid JSON (${err.message})`);
      continue;
    }

    const list = parsed?.[spec.rootKey];
    if (!Array.isArray(list) || list.length === 0) {
      errors.push(`${fileName}: missing non-empty "${spec.rootKey}" array`);
      continue;
    }

    list.forEach((item, idx) => spec.validateItem(item, idx, errors));
    checkedFiles += 1;
  }

  if (errors.length > 0) {
    console.error(`Civic data validation FAILED (${errors.length} issue(s)):`);
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log(`Civic data validation passed (${checkedFiles} datasets verified against schema & official source allowlist).`);
}

runValidation();
