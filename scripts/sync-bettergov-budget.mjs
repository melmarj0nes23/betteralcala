import fs from 'node:fs';
import path from 'node:path';

const API_BASE = 'https://budget.bettergov.ph/api/v1';
const OUT_PATH = path.resolve(
  import.meta.dirname,
  '../public/data/national-budget-alcala.json'
);

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function isAlcalaPangasinan(record) {
  const title = (record.title || record.name || '').toLowerCase();
  return /alcala,?\s*pangasinan/i.test(title);
}

async function main() {
  console.log('Syncing national GAA (2024-2026) & FY2027 NEP/HGAB data exclusively for Alcala, Pangasinan...');

  const [gaa2024, gaa2025, gaa2026, dpwhRes, fmrRes, hfepRes, niaRes] = await Promise.all([
    fetchJson(`${API_BASE}/gaa/search?q=Alcala&year=2024&limit=100`),
    fetchJson(`${API_BASE}/gaa/search?q=Alcala&year=2025&limit=100`),
    fetchJson(`${API_BASE}/gaa/search?q=Alcala&year=2026&limit=100`),
    fetchJson(`${API_BASE}/hgab/2027/datasets/dpwh/projects?q=Alcala&limit=50`),
    fetchJson(`${API_BASE}/hgab/2027/datasets/fmr/projects?q=Alcala&limit=50`),
    fetchJson(`${API_BASE}/hgab/2027/datasets/hfep/projects?q=Alcala&limit=50`),
    fetchJson(`${API_BASE}/hgab/2027/datasets/nia/projects?q=Alcala&limit=50`),
  ]);

  const gaaByKey = new Map();
  for (const res of [gaa2024, gaa2025, gaa2026]) {
    for (const item of res?.data || []) {
      if (!isAlcalaPangasinan(item)) continue;
      const fy2024Php = item.years?.['2024']?.amount ?? 0;
      const fy2025Php = item.years?.['2025']?.amount ?? 0;
      const fy2026Php = item.years?.['2026']?.amount ?? 0;
      if (fy2024Php === 0 && fy2025Php === 0 && fy2026Php === 0) continue;
      gaaByKey.set(item.fam_key, {
        famKey: item.fam_key,
        name: item.name,
        department: item.department,
        fy2024Php,
        fy2025Php,
        fy2026Php,
      });
    }
  }
  const gaaProjects = Array.from(gaaByKey.values());

  const extractRows = (res) => Object.values(res?.data || {}).find(Array.isArray) || [];
  const hgabProjects = [
    ...extractRows(dpwhRes),
    ...extractRows(fmrRes),
    ...extractRows(hfepRes),
    ...extractRows(niaRes),
  ]
    .filter(isAlcalaPangasinan)
    .map((p) => ({
      id: p.id,
      dataset: p.dataset,
      title: p.title,
      program: p.program || null,
      statusLabel: p.status_label || 'Listed',
      nepPhp: typeof p.nep_php === 'number' ? p.nep_php : null,
      housePhp: typeof p.house_php === 'number' ? p.house_php : typeof p.hgab3_php === 'number' ? p.hgab3_php : null,
      deltaPhp: typeof p.delta_php === 'number' ? p.delta_php : null,
      nepPdfUrl: p.pdf_url?.nep || null,
      housePdfUrl: p.pdf_url?.hgab3 || p.pdf_url?.hgab2 || null,
      detailUrl: p.url || null,
    }));

  const payload = {
    syncedAt: new Date().toISOString(),
    sourceApi: API_BASE,
    sourceDocs: 'https://budget.bettergov.ph/docs',
    notice:
      dpwhRes?.meta?.notice ||
      'Independent and unofficial reading of published GAA/NEP/House bill documents. Figures are published allocations, not actual spending.',
    gaaProjects,
    hgab2027Projects: hgabProjects,
  };

  if (fs.existsSync(OUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
      if (
        JSON.stringify(existing.gaaProjects) === JSON.stringify(gaaProjects) &&
        JSON.stringify(existing.hgab2027Projects) === JSON.stringify(hgabProjects)
      ) {
        console.log('No new budget or project changes detected; keeping existing file untouched.');
        return;
      }
    } catch {
      // Proceed to overwrite if existing file cannot be parsed
    }
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(
    `Saved ${OUT_PATH}: ${payload.gaaProjects.length} GAA record(s), ${payload.hgab2027Projects.length} HGAB 2027 project(s).`
  );
}

main().catch((err) => {
  console.error('Failed to sync BetterGov budget data:', err);
  process.exit(1);
});
