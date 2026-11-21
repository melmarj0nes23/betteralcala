import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { useAuth } from '../contexts/AuthContext';
import { ORDINANCES_DATA } from '../data/transparencyData';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  FirestoreCivicRecord,
  isValidCitation,
  useCivicDataset,
  usePublishedFirestoreRecords,
} from '../hooks/useCivicDataset';
import { OrdinanceRecord } from '../types/civic';

function isValidOrdinance(item: unknown): item is OrdinanceRecord {
  if (!item || typeof item !== 'object') return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.ordinanceNo === 'string' &&
    typeof o.title === 'string' &&
    typeof o.category === 'string' &&
    typeof o.summary === 'string' &&
    isValidCitation(o.citation)
  );
}

export default function OrdinanceFrameworkPage() {
  const [searchParams] = useSearchParams();
  const { user, isAdmin } = useAuth();
  const ordinances = useCivicDataset(
    'ordinances.json',
    'ordinances',
    ORDINANCES_DATA,
    isValidOrdinance
  );
  const liveOrdinanceRecords = usePublishedFirestoreRecords('ordinances', isAdmin);
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [busyRecordId, setBusyRecordId] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const liveRecordByOrdNo = useMemo(() => {
    const map = new Map<string, FirestoreCivicRecord>();
    for (const rec of liveOrdinanceRecords) {
      const key = (rec.referenceNo || rec.id).toLowerCase();
      map.set(key, rec);
    }
    return map;
  }, [liveOrdinanceRecords]);

  const handleUnpublishLive = async (rec: FirestoreCivicRecord) => {
    if (!user || !isAdmin) return;
    setBusyRecordId(rec.id);
    setAdminNotice(null);
    try {
      await updateDoc(doc(db, 'civicRecords', rec.id), {
        published: false,
        publishedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setAdminNotice(`Unpublished Ord. ${rec.referenceNo || rec.id} from the public page.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `civicRecords/${rec.id}`);
    } finally {
      setBusyRecordId(null);
    }
  };

  const handleDeleteLive = async (rec: FirestoreCivicRecord) => {
    if (!user || !isAdmin) return;
    setBusyRecordId(rec.id);
    setAdminNotice(null);
    try {
      await deleteDoc(doc(db, 'civicRecords', rec.id));
      setAdminNotice(`Deleted Ord. ${rec.referenceNo || rec.id} from Firestore.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `civicRecords/${rec.id}`);
    } finally {
      setBusyRecordId(null);
    }
  };

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) setQuery(qParam);
  }, [searchParams]);

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(ordinances.map((o) => o.category)))],
    [ordinances]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ordinances.filter((o) => {
      if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        o.ordinanceNo.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
      );
    });
  }, [ordinances, query, selectedCategory]);

  return (
    <Layout
      breadcrumbs={[
        { label: 'Legislative', to: '/legislative' },
        { label: 'Ordinance Framework' },
      ]}
    >
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-journal-text" aria-hidden="true" /> <span>Legislative</span>
            </span>
            <h1>Ordinance Framework</h1>
            <p className="page-header-desc">
              Verified Municipal Ordinances enacted by the Sangguniang Bayan of Alcala, Pangasinan
              and reviewed by the Sangguniang Panlalawigan
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="bg-slate-50 border border-black/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 justify-between mb-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search ordinances by number (e.g., 2025-04), title, or topic..."
                aria-label="Search municipal ordinances"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm focus:border-[#0032a0] focus:outline-none"
              />
              <span className="text-sm text-slate-600 self-center tabular-nums">
                {filtered.length} ordinances
              </span>
            </div>
            <div className="mobile-filter-select-wrap">
              <label htmlFor="ordinance-category-select" className="mobile-filter-select-label">
                Category
              </label>
              <select
                id="ordinance-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mobile-filter-select"
                aria-label="Filter ordinances by category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-tab-bar filter-tab-bar--collapsible mb-0">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCategory(c)}
                  className={`filter-tab-btn ${selectedCategory === c ? 'active' : ''}`}
                >
                  {c === 'all' ? 'All Categories' : c}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (liveOrdinanceRecords.length > 0 || adminNotice) && (
            <div className="mb-4 rounded-xl border border-[#0032a0]/20 bg-blue-50/70 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800">
              <span>
                {adminNotice ? (
                  <strong className="text-emerald-800">{adminNotice}</strong>
                ) : (
                  <>
                    <strong>Admin Controls Active:</strong> {liveOrdinanceRecords.length}{' '}
                    live Firestore ordinance(s) can be unpublished or deleted directly in the table
                    below or managed in Admin Data Sync.
                  </>
                )}
              </span>
              <Link to="/admin" className="font-semibold text-[#0032a0] whitespace-nowrap">
                Open Admin Data Sync
              </Link>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-xl p-8 text-center">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No municipal ordinances match your filter.
              </p>
              <p className="text-xs text-slate-600 mb-4">
                Try clearing the search query or selecting All Categories.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                }}
              >
                Show All Ordinances
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table ordinance-table">
                <thead>
                  <tr>
                    <th scope="col">Ordinance No.</th>
                    <th scope="col">Title &amp; Summary</th>
                    <th scope="col">Category</th>
                    <th scope="col">Date / Review</th>
                    <th scope="col">Status &amp; Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ord) => {
                    const liveRec = isAdmin
                      ? liveRecordByOrdNo.get(ord.ordinanceNo.toLowerCase())
                      : undefined;
                    return (
                      <tr key={ord.ordinanceNo}>
                        <td
                          data-label="Ordinance No."
                          className="font-bold text-[#0032a0] whitespace-nowrap tabular-nums"
                        >
                          Ord. {ord.ordinanceNo}
                        </td>
                        <td data-label="Title & Summary">
                          <div className="font-semibold text-slate-900">{ord.title}</div>
                          <div className="text-xs text-slate-600 mt-1">{ord.summary}</div>
                        </td>
                        <td data-label="Category" className="whitespace-nowrap text-xs font-medium">
                          {ord.category}
                        </td>
                        <td data-label="Date / Review" className="whitespace-nowrap text-xs tabular-nums">
                          {ord.sessionDate}
                          {ord.spResolutionRef && (
                            <div className="text-slate-500">{ord.spResolutionRef}</div>
                          )}
                        </td>
                        <td data-label="Status & Source">
                          <div className="flex flex-col items-start gap-1">
                            <VerificationBadge status={ord.citation.verificationStatus} />
                            {ord.documentUrl && (
                              <a
                                href={ord.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium"
                              >
                                SP Archive <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                              </a>
                            )}
                            {liveRec && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                <button
                                  type="button"
                                  disabled={busyRecordId === liveRec.id}
                                  onClick={() => handleUnpublishLive(liveRec)}
                                  className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Unpublish
                                </button>
                                <button
                                  type="button"
                                  disabled={busyRecordId === liveRec.id}
                                  onClick={() => handleDeleteLive(liveRec)}
                                  className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                                >
                                  {busyRecordId === liveRec.id ? 'Removing...' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
