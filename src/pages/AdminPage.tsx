import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import Layout from '../components/layout/Layout';
import { VerificationBadge } from '../components/VerificationBadge';
import { useAuth } from '../contexts/AuthContext';
import { db, handleFirestoreError, OperationType, PRIMARY_ADMIN_EMAIL } from '../firebase';
import { FirestoreCivicRecord } from '../hooks/useCivicDataset';
import { VerificationStatus } from '../types/civic';
import { smartSentenceCase, smartTitleCase } from '../utils/civicText';

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
  suggestedStatus: VerificationStatus;
  fiscalYear?: string;
  approvedBudget?: string;
  spResolutionRef?: string;
  ntaShareNote?: string;
}

interface SyncResponse {
  checkedAt: string;
  sourcesChecked: string[];
  candidates: SyncCandidate[];
  psgcCheck: {
    source: string;
    officialCount: number | null;
    localCount: number;
    matches: boolean;
  };
  warnings: string[];
}

interface SyncRunRecord {
  id: string;
  checkedByUid: string;
  sourcesChecked: string[];
  candidatesFound: number;
  psgcVerified: boolean;
  checkedAt?: { toDate?: () => Date } | null;
}

function buildSafeDocId(raw: string): string {
  return (
    raw
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || `rec-${Date.now()}`
  );
}

export default function AdminPage() {
  const { user, authReady, isAdmin, authError, signInWithGoogle, signOutAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'candidates' | 'published' | 'history'>('candidates');

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResponse | null>(null);
  const [candidates, setCandidates] = useState<SyncCandidate[]>([]);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [publishedRecords, setPublishedRecords] = useState<FirestoreCivicRecord[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRunRecord[]>([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    referenceNo: string;
    category: string;
    publishedDate: string;
    summary: string;
    verificationStatus: VerificationStatus;
    sourceUrl: string;
  } | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Manual verified entry state
  const [manualForm, setManualForm] = useState({
    datasetType: 'ordinances' as SyncCandidate['datasetType'],
    referenceNo: '',
    title: '',
    category: 'Municipal Legislation',
    publishedDate: new Date().toISOString().slice(0, 10),
    summary: '',
    sourceTitle: '',
    sourceUrl: 'https://www.pangasinan.gov.ph/',
    issuingAgency: 'Sangguniang Bayan of Alcala / SP Pangasinan',
    verificationStatus: 'Verified' as VerificationStatus,
    fiscalYear: '2026',
    approvedBudget: '',
    spResolutionRef: '',
    ntaShareNote: '',
  });

  useEffect(() => {
    if (!authReady || !isAdmin) {
      setPublishedRecords([]);
      setSyncRuns([]);
      return;
    }

    let fallbackUnsub: (() => void) | null = null;

    const mapSnapshotDocs = (docs: Array<{ id: string; data: () => unknown }>) => {
      const list = docs.map((d) => ({
        ...(d.data() as FirestoreCivicRecord),
        id: d.id,
      }));
      list.sort((a, b) => (b.publishedDate || '').localeCompare(a.publishedDate || ''));
      setPublishedRecords(list);
    };

    const unsubRecords = onSnapshot(
      collection(db, 'civicRecords'),
      (snapshot) => {
        mapSnapshotDocs(snapshot.docs);
      },
      (error) => {
        // Fallback to rule-scoped published query so admin can still manage live records
        if (!fallbackUnsub) {
          const pubQuery = query(collection(db, 'civicRecords'), where('published', '==', true));
          fallbackUnsub = onSnapshot(
            pubQuery,
            (snap) => {
              mapSnapshotDocs(snap.docs);
            },
            () => {
              // Handled below
            }
          );
        }
        try {
          handleFirestoreError(error, OperationType.LIST, 'civicRecords');
        } catch {
          // Error already logged cleanly
        }
      }
    );

    const unsubRuns = onSnapshot(
      collection(db, 'syncRuns'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SyncRunRecord, 'id'>),
        }));
        list.sort((a, b) => {
          const tA = a.checkedAt?.toDate ? a.checkedAt.toDate().getTime() : 0;
          const tB = b.checkedAt?.toDate ? b.checkedAt.toDate().getTime() : 0;
          return tB - tA;
        });
        setSyncRuns(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'syncRuns');
        } catch {
          // Error already logged cleanly
        }
      }
    );

    return () => {
      unsubRecords();
      if (fallbackUnsub) fallbackUnsub();
      unsubRuns();
    };
  }, [authReady, isAdmin]);

  const publishedIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const r of publishedRecords) {
      ids.add(r.id.toLowerCase());
      if (r.referenceNo) ids.add(r.referenceNo.toLowerCase());
      ids.add(r.title.toLowerCase());
    }
    return ids;
  }, [publishedRecords]);

  const handleSyncSources = useCallback(async () => {
    if (!user || !isAdmin) return;
    setSyncing(true);
    setActionMessage(null);

    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/civic-sync/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = (await response.json()) as SyncResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || `Sync failed with status ${response.status}`);
      }

      const freshCandidates = data.candidates
        .filter(
          (c) =>
            !publishedIdSet.has(c.id.toLowerCase()) &&
            !publishedIdSet.has(c.title.toLowerCase()) &&
            !(c.referenceNo && publishedIdSet.has(c.referenceNo.toLowerCase()))
        )
        .map((c) => ({
          ...c,
          fiscalYear: c.publishedDate.slice(0, 4),
          approvedBudget: c.detectedAmount ? String(c.detectedAmount) : '',
          spResolutionRef: c.datasetType === 'fiscal_years' ? c.referenceNo : '',
          ntaShareNote: '',
        }));

      setSyncResult(data);
      setCandidates(freshCandidates);
      setActiveTab('candidates');

      // Persist audit entry to Firestore syncRuns
      const runId = `run-${Date.now()}`;
      try {
        await setDoc(doc(db, 'syncRuns', runId), {
          checkedByUid: user.uid,
          sourcesChecked: data.sourcesChecked.length > 0 ? data.sourcesChecked : ['none'],
          candidatesFound: freshCandidates.length,
          psgcVerified: Boolean(data.psgcCheck?.matches),
          checkedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `syncRuns/${runId}`);
      }

      setActionMessage({
        type: 'success',
        text: `Official source check completed: ${freshCandidates.length} new candidate(s) ready for review.`,
      });
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Unable to sync official sources.',
      });
    } finally {
      setSyncing(false);
    }
  }, [user, isAdmin, publishedIdSet]);

  const updateCandidateField = (
    id: string,
    field: keyof SyncCandidate,
    value: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const publishCandidate = async (candidate: SyncCandidate) => {
    if (!user || !isAdmin) return;
    if (!candidate.sourceUrl.startsWith('https://')) {
      setActionMessage({
        type: 'error',
        text: 'Source URL must begin with https:// from a verified official source.',
      });
      return;
    }

    setPublishingId(candidate.id);
    setActionMessage(null);
    const docId = buildSafeDocId(candidate.id);

    const payload: Record<string, unknown> = {
      id: docId,
      datasetType: candidate.datasetType,
      title: candidate.title.trim().slice(0, 400),
      summary: candidate.summary.trim().slice(0, 2000),
      details: (candidate.details || candidate.summary).trim().slice(0, 4000),
      category: candidate.category.trim().slice(0, 120),
      originType: 'Official Government Source',
      publishedDate: candidate.publishedDate.trim().slice(0, 64),
      sourceTitle: candidate.sourceTitle.trim().slice(0, 300),
      sourceUrl: candidate.sourceUrl.trim().slice(0, 600),
      issuingAgency: candidate.issuingAgency.trim().slice(0, 200),
      verificationStatus: candidate.suggestedStatus,
      published: true,
      publishedByUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (candidate.referenceNo.trim()) {
      payload.referenceNo = candidate.referenceNo.trim().slice(0, 120);
    }
    if (candidate.spResolutionRef?.trim()) {
      payload.spResolutionRef = candidate.spResolutionRef.trim().slice(0, 200);
    }
    if (candidate.datasetType === 'fiscal_years') {
      const fy = Number(candidate.fiscalYear);
      const budget = Number(candidate.approvedBudget);
      if (!Number.isInteger(fy) || fy < 2000 || fy > 2100 || !Number.isFinite(budget) || budget <= 0) {
        setActionMessage({
          type: 'error',
          text: 'Fiscal Year records require a valid integer Fiscal Year and positive Approved Budget amount.',
        });
        setPublishingId(null);
        return;
      }
      payload.fiscalYear = fy;
      payload.approvedBudget = budget;
      if (candidate.ntaShareNote?.trim()) {
        payload.ntaShareNote = candidate.ntaShareNote.trim().slice(0, 600);
      }
    }

    try {
      await setDoc(doc(db, 'civicRecords', docId), payload);
      setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      setActionMessage({
        type: 'success',
        text: `Published "${candidate.title.slice(0, 70)}..." to live BetterAlcala datasets.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `civicRecords/${docId}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleManualPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;
    if (!manualForm.sourceUrl.startsWith('https://')) {
      setActionMessage({
        type: 'error',
        text: 'Official source URL must begin with https://',
      });
      return;
    }

    const docId = buildSafeDocId(
      `manual-${manualForm.datasetType}-${manualForm.referenceNo || manualForm.title.slice(0, 32)}-${Date.now()}`
    );

    const payload: Record<string, unknown> = {
      id: docId,
      datasetType: manualForm.datasetType,
      title: manualForm.title.trim().slice(0, 400),
      summary: manualForm.summary.trim().slice(0, 2000),
      details: manualForm.summary.trim().slice(0, 4000),
      category: manualForm.category.trim().slice(0, 120),
      originType: 'Official Government Source',
      publishedDate: manualForm.publishedDate.trim().slice(0, 64),
      sourceTitle: manualForm.sourceTitle.trim().slice(0, 300),
      sourceUrl: manualForm.sourceUrl.trim().slice(0, 600),
      issuingAgency: manualForm.issuingAgency.trim().slice(0, 200),
      verificationStatus: manualForm.verificationStatus,
      published: true,
      publishedByUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (manualForm.referenceNo.trim()) {
      payload.referenceNo = manualForm.referenceNo.trim().slice(0, 120);
    }
    if (manualForm.spResolutionRef.trim()) {
      payload.spResolutionRef = manualForm.spResolutionRef.trim().slice(0, 200);
    }
    if (manualForm.datasetType === 'fiscal_years') {
      const fy = Number(manualForm.fiscalYear);
      const budget = Number(manualForm.approvedBudget);
      if (!Number.isInteger(fy) || fy < 2000 || fy > 2100 || !Number.isFinite(budget) || budget <= 0) {
        setActionMessage({
          type: 'error',
          text: 'Fiscal Year records require a valid integer year and positive approved budget amount.',
        });
        return;
      }
      payload.fiscalYear = fy;
      payload.approvedBudget = budget;
      if (manualForm.ntaShareNote.trim()) {
        payload.ntaShareNote = manualForm.ntaShareNote.trim().slice(0, 600);
      }
    }

    try {
      await setDoc(doc(db, 'civicRecords', docId), payload);
      setShowManualForm(false);
      setManualForm((prev) => ({ ...prev, referenceNo: '', title: '', summary: '', sourceTitle: '' }));
      setActionMessage({
        type: 'success',
        text: 'Published new verified record to the live BetterAlcala portal.',
      });
      setActiveTab('published');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `civicRecords/${docId}`);
    }
  };

  const togglePublishRecord = async (record: FirestoreCivicRecord) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'civicRecords', record.id), {
        published: !record.published,
        publishedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setActionMessage({
        type: 'success',
        text: `${!record.published ? 'Published' : 'Unpublished'} "${record.title.slice(0, 60)}".`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `civicRecords/${record.id}`);
    }
  };

  const deletePublishedRecord = async (record: FirestoreCivicRecord) => {
    if (!user || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'civicRecords', record.id));
      if (editingRecordId === record.id) {
        setEditingRecordId(null);
        setEditDraft(null);
      }
      setActionMessage({
        type: 'success',
        text: `Removed "${record.title.slice(0, 60)}" from Firestore.`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `civicRecords/${record.id}`);
    }
  };

  const startEditingRecord = (rec: FirestoreCivicRecord) => {
    setEditingRecordId(rec.id);
    setEditDraft({
      title: rec.title,
      referenceNo: rec.referenceNo || '',
      category: rec.category,
      publishedDate: rec.publishedDate,
      summary: rec.summary,
      verificationStatus: rec.verificationStatus,
      sourceUrl: rec.sourceUrl,
    });
  };

  const autoFormatEditDraft = () => {
    if (!editDraft) return;
    const formattedTitle = smartTitleCase(editDraft.title);
    let formattedSummary = smartSentenceCase(editDraft.summary);
    if (formattedSummary.trim().toLowerCase() === formattedTitle.trim().toLowerCase()) {
      formattedSummary = `Official record (${editDraft.publishedDate}) reviewed for Alcala, Pangasinan. Click the verified source link for full text.`;
    }
    setEditDraft({
      ...editDraft,
      title: formattedTitle,
      summary: formattedSummary,
    });
  };

  const saveEditedRecord = async (record: FirestoreCivicRecord) => {
    if (!user || !isAdmin || !editDraft) return;
    if (editDraft.title.trim().length < 3 || editDraft.summary.trim().length < 3) {
      setActionMessage({
        type: 'error',
        text: 'Title and summary must each be at least 3 characters long.',
      });
      return;
    }
    if (!editDraft.sourceUrl.trim().startsWith('https://')) {
      setActionMessage({
        type: 'error',
        text: 'Source URL must begin with https://',
      });
      return;
    }

    setSavingEdit(true);
    setActionMessage(null);
    try {
      await updateDoc(doc(db, 'civicRecords', record.id), {
        title: editDraft.title.trim().slice(0, 400),
        referenceNo: editDraft.referenceNo.trim().slice(0, 120),
        category: editDraft.category.trim().slice(0, 120),
        publishedDate: editDraft.publishedDate.trim().slice(0, 64),
        summary: editDraft.summary.trim().slice(0, 2000),
        verificationStatus: editDraft.verificationStatus,
        sourceUrl: editDraft.sourceUrl.trim().slice(0, 600),
        publishedByUid: user.uid,
        updatedAt: serverTimestamp(),
      });
      setEditingRecordId(null);
      setEditDraft(null);
      setActionMessage({
        type: 'success',
        text: `Saved clean formatting for "${editDraft.title.trim().slice(0, 60)}".`,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `civicRecords/${record.id}`);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Layout breadcrumbs={[{ label: 'Admin Data Sync' }]}>
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-shield-lock-fill" aria-hidden="true" />{' '}
              <span>Verified Steward Console</span>
            </span>
            <h1>Civic Data Sync &amp; Publishing</h1>
            <p className="page-header-desc">
              Check official Philippine government sources for Alcala updates, verify accuracy, and
              publish directly to BetterAlcala with zero code changes
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!authReady ? (
            <div className="bg-white border border-black/10 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-600">Checking administrator session...</p>
            </div>
          ) : !user ? (
            <div className="max-w-lg mx-auto bg-white border border-black/10 rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#0032a0] mb-4">
                <i className="bi bi-google text-xl" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Sign In to Admin Data Sync
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Only authorized, email-verified BetterAlcala maintainers ({PRIMARY_ADMIN_EMAIL}) can
                check official feeds and publish civic records.
              </p>
              {authError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {authError}
                </div>
              )}
              <button
                type="button"
                onClick={signInWithGoogle}
                className="btn btn-primary"
              >
                <i className="bi bi-google" aria-hidden="true" /> Sign in with Google
              </button>
            </div>
          ) : !isAdmin ? (
            <div className="max-w-lg mx-auto bg-white border border-amber-200 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Administrator Access Required</h2>
              <p className="text-sm text-slate-600 mb-2">
                Signed in as <strong>{user.email}</strong>. This account is not currently in the
                BetterAlcala administrator allowlist.
              </p>
              <p className="text-xs text-slate-500 mb-5">
                Please sign in with the verified primary maintainer account ({PRIMARY_ADMIN_EMAIL}).
              </p>
              <button type="button" onClick={signOutAdmin} className="btn btn-outline btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Bar */}
              <div className="bg-white border border-black/10 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-1">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <i className="bi bi-patch-check-fill" aria-hidden="true" /> Verified Admin
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{user.email}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mb-0">
                    Official Government Source Monitor
                  </h2>
                  <p className="text-xs text-slate-600 mb-0">
                    Deterministically queries allowlisted <code>pangasinan.gov.ph</code> RSS2 &amp;{' '}
                    <code>psgc.cloud</code> feeds—never invents figures.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncSources}
                    disabled={syncing}
                    className="btn btn-primary"
                  >
                    <i
                      className={`bi ${syncing ? 'bi-arrow-repeat' : 'bi-cloud-arrow-down-fill'}`}
                      aria-hidden="true"
                    />{' '}
                    {syncing ? 'Checking Official Sources...' : 'Sync & Check Official Sources'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualForm((prev) => !prev)}
                    className="btn btn-outline btn-sm"
                  >
                    <i className="bi bi-plus-circle" aria-hidden="true" />{' '}
                    {showManualForm ? 'Close Manual Entry' : 'Add Verified Record'}
                  </button>
                  <button type="button" onClick={signOutAdmin} className="btn btn-outline btn-sm">
                    Sign Out
                  </button>
                </div>
              </div>

              {actionMessage && (
                <div
                  role="status"
                  className={`rounded-xl border p-4 text-sm ${
                    actionMessage.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              {/* Quick Stats Row */}
              <div className="grid grid-4" style={{ gap: 'var(--spacing-md)' }}>
                <div className="bg-white border border-black/10 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase">New Candidates</div>
                  <div className="text-2xl font-bold text-[#0032a0] tabular-nums mt-1">
                    {candidates.length}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Awaiting review before publish</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('published')}
                  className="bg-white border border-black/10 rounded-xl p-4 text-left hover:border-[#0032a0] transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-500 uppercase">Live Firestore Updates</div>
                  <div className="text-2xl font-bold text-[#0032a0] tabular-nums mt-1">
                    {publishedRecords.filter((r) => r.published).length}
                  </div>
                  <div className="text-xs text-[#0032a0] font-medium mt-1">
                    Manage, edit, unpublish, or delete →
                  </div>
                </button>
                <div className="bg-white border border-black/10 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase">PSGC Integrity</div>
                  <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                    {syncResult?.psgcCheck
                      ? `${syncResult.psgcCheck.officialCount ?? '?'}/${syncResult.psgcCheck.localCount}`
                      : '21/21'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Official Alcala barangays</div>
                </div>
                <div className="bg-white border border-black/10 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase">Logged Sync Runs</div>
                  <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                    {syncRuns.length}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {syncResult ? `Checked ${syncResult.checkedAt.slice(0, 10)}` : 'Click Sync to check'}
                  </div>
                </div>
              </div>

              {/* Optional Manual Entry Form */}
              {showManualForm && (
                <form
                  onSubmit={handleManualPublish}
                  className="bg-white border border-[#0032a0]/20 rounded-xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0032a0] mb-0">
                      Publish Verified Official Record
                    </h3>
                    <span className="text-xs text-slate-500">
                      Requires authoritative HTTPS citation URL
                    </span>
                  </div>
                  <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Section
                      </label>
                      <select
                        value={manualForm.datasetType}
                        onChange={(e) =>
                          setManualForm((p) => ({
                            ...p,
                            datasetType: e.target.value as SyncCandidate['datasetType'],
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                      >
                        <option value="ordinances">Municipal Ordinances</option>
                        <option value="resolutions">SP / SB Resolutions</option>
                        <option value="news">Announcements &amp; Advisories</option>
                        <option value="fiscal_years">Annual Budget (Fiscal Year)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reference / Ordinance No.
                      </label>
                      <input
                        type="text"
                        value={manualForm.referenceNo}
                        onChange={(e) => setManualForm((p) => ({ ...p, referenceNo: e.target.value }))}
                        placeholder="e.g., 2026-12 or SP Res. No. 580-2026"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Published / Approved Date
                      </label>
                      <input
                        type="date"
                        required
                        value={manualForm.publishedDate}
                        onChange={(e) =>
                          setManualForm((p) => ({ ...p, publishedDate: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-2" style={{ gap: 'var(--spacing-sm)' }}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={manualForm.title}
                        onChange={(e) => setManualForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        required
                        value={manualForm.category}
                        onChange={(e) => setManualForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {manualForm.datasetType === 'fiscal_years' && (
                    <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fiscal Year
                        </label>
                        <input
                          type="number"
                          required
                          min={2000}
                          max={2100}
                          value={manualForm.fiscalYear}
                          onChange={(e) =>
                            setManualForm((p) => ({ ...p, fiscalYear: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Approved Annual Budget (PHP)
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          step="0.01"
                          value={manualForm.approvedBudget}
                          onChange={(e) =>
                            setManualForm((p) => ({ ...p, approvedBudget: e.target.value }))
                          }
                          placeholder="e.g., 260232497"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          SP Resolution Ref
                        </label>
                        <input
                          type="text"
                          value={manualForm.spResolutionRef}
                          onChange={(e) =>
                            setManualForm((p) => ({ ...p, spResolutionRef: e.target.value }))
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Factual Summary
                    </label>
                    <textarea
                      required
                      minLength={3}
                      rows={3}
                      value={manualForm.summary}
                      onChange={(e) => setManualForm((p) => ({ ...p, summary: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Source Title
                      </label>
                      <input
                        type="text"
                        required
                        value={manualForm.sourceTitle}
                        onChange={(e) =>
                          setManualForm((p) => ({ ...p, sourceTitle: e.target.value }))
                        }
                        placeholder="e.g., SP Resolution No. ..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official HTTPS Source URL
                      </label>
                      <input
                        type="url"
                        required
                        pattern="https://.*"
                        value={manualForm.sourceUrl}
                        onChange={(e) =>
                          setManualForm((p) => ({ ...p, sourceUrl: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Verification Label
                      </label>
                      <select
                        value={manualForm.verificationStatus}
                        onChange={(e) =>
                          setManualForm((p) => ({
                            ...p,
                            verificationStatus: e.target.value as VerificationStatus,
                          }))
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Needs Review">Needs Review</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowManualForm(false)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Publish Record Live
                    </button>
                  </div>
                </form>
              )}

              {/* Navigation Tabs */}
              <div className="filter-tab-bar mb-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('candidates')}
                  className={`filter-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
                >
                  Review Candidates ({candidates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('published')}
                  className={`filter-tab-btn ${activeTab === 'published' ? 'active' : ''}`}
                >
                  Published Live Updates ({publishedRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`filter-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                >
                  Sync History ({syncRuns.length})
                </button>
              </div>

              {/* Tab 1: Sync Candidates */}
              {activeTab === 'candidates' && (
                <div className="space-y-4">
                  {syncResult?.warnings && syncResult.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                      {syncResult.warnings.join(' · ')}
                    </div>
                  )}

                  {candidates.length === 0 ? (
                    <div className="bg-white border border-black/10 rounded-xl p-10 text-center">
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        {syncResult
                          ? 'No new unreviewed official items pending.'
                          : 'Click "Sync & Check Official Sources" above to scan for new Alcala issuances.'}
                      </p>
                      <p className="text-xs text-slate-600 mb-0">
                        Each detected government filing is staged here with its direct official link
                        before anything appears on public pages.
                      </p>
                      {publishedRecords.length > 0 && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => setActiveTab('published')}
                            className="btn btn-outline btn-sm"
                          >
                            Manage Published Live Updates ({publishedRecords.length}) — Edit,
                            Unpublish, or Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    candidates.map((cand) => (
                      <article
                        key={cand.id}
                        className="bg-white border border-black/10 rounded-xl p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-[#0032a0]">{cand.issuingAgency}</span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{cand.publishedDate}</span>
                            {cand.referenceNo && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-semibold text-slate-800">
                                  {cand.referenceNo}
                                </span>
                              </>
                            )}
                          </div>
                          <a
                            href={cand.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#0032a0]"
                          >
                            Verify Original Source{' '}
                            <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                          </a>
                        </div>

                        <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Target Portal Section
                            </label>
                            <select
                              value={cand.datasetType}
                              onChange={(e) =>
                                updateCandidateField(cand.id, 'datasetType', e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            >
                              <option value="ordinances">Municipal Ordinances</option>
                              <option value="resolutions">SP / SB Resolutions</option>
                              <option value="news">Announcements &amp; Advisories</option>
                              <option value="fiscal_years">Annual Budget (Fiscal Year)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Reference Number
                            </label>
                            <input
                              type="text"
                              value={cand.referenceNo}
                              onChange={(e) =>
                                updateCandidateField(cand.id, 'referenceNo', e.target.value)
                              }
                              placeholder="Ordinance / Resolution No."
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Publish Status
                            </label>
                            <select
                              value={cand.suggestedStatus}
                              onChange={(e) =>
                                updateCandidateField(cand.id, 'suggestedStatus', e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm bg-white"
                            >
                              <option value="Needs Review">Needs Review</option>
                              <option value="Verified">Verified (Confirmed from source)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-2" style={{ gap: 'var(--spacing-sm)' }}>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={cand.title}
                              onChange={(e) => updateCandidateField(cand.id, 'title', e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Category
                            </label>
                            <input
                              type="text"
                              value={cand.category}
                              onChange={(e) =>
                                updateCandidateField(cand.id, 'category', e.target.value)
                              }
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                            />
                          </div>
                        </div>

                        {cand.datasetType === 'fiscal_years' && (
                          <div className="grid grid-2" style={{ gap: 'var(--spacing-sm)' }}>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Fiscal Year
                              </label>
                              <input
                                type="number"
                                value={cand.fiscalYear || ''}
                                onChange={(e) =>
                                  updateCandidateField(cand.id, 'fiscalYear', e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Approved Annual Budget (PHP)
                              </label>
                              <input
                                type="number"
                                value={cand.approvedBudget || ''}
                                onChange={(e) =>
                                  updateCandidateField(cand.id, 'approvedBudget', e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Summary
                          </label>
                          <textarea
                            rows={2}
                            value={cand.summary}
                            onChange={(e) => updateCandidateField(cand.id, 'summary', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                          />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-black/5">
                          <button
                            type="button"
                            onClick={() => {
                              const cleanTitle = smartTitleCase(cand.title);
                              let cleanSummary = smartSentenceCase(cand.summary);
                              if (cleanSummary.trim().toLowerCase() === cleanTitle.trim().toLowerCase()) {
                                cleanSummary = `Official record (${cand.publishedDate}) reviewed for Alcala, Pangasinan. Click the verified source link for full text.`;
                              }
                              setCandidates((prev) =>
                                prev.map((item) =>
                                  item.id === cand.id
                                    ? { ...item, title: cleanTitle, summary: cleanSummary }
                                    : item
                                )
                              );
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            <i className="bi bi-magic" aria-hidden="true" /> Clean Formatting
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCandidates((prev) => prev.filter((item) => item.id !== cand.id))
                            }
                            className="btn btn-outline btn-sm"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            disabled={publishingId === cand.id}
                            onClick={() => publishCandidate(cand)}
                            className="btn btn-primary btn-sm"
                          >
                            <i className="bi bi-check2-circle" aria-hidden="true" />{' '}
                            {publishingId === cand.id ? 'Publishing...' : 'Approve & Publish Live'}
                          </button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Published Records */}
              {activeTab === 'published' && (
                <div className="space-y-4">
                  {publishedRecords.length === 0 ? (
                    <div className="bg-white border border-black/10 rounded-xl p-10 text-center">
                      <p className="text-sm text-slate-600 mb-0">
                        No Firestore live overrides published yet. Baseline records from verified JSON
                        datasets are active.
                      </p>
                    </div>
                  ) : (
                    publishedRecords.map((rec) => {
                      const isEditing = editingRecordId === rec.id && editDraft !== null;
                      return (
                        <article
                          key={rec.id}
                          className="bg-white border border-black/10 rounded-xl p-5 space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-bold uppercase text-[#0032a0]">
                                  {rec.datasetType}
                                </span>
                                {rec.referenceNo && <span>· {rec.referenceNo}</span>}
                                <span className="tabular-nums">· {rec.publishedDate}</span>
                                <VerificationBadge status={rec.verificationStatus} />
                                <span
                                  className={`text-xs font-semibold ${
                                    rec.published ? 'text-emerald-700' : 'text-slate-500'
                                  }`}
                                >
                                  {rec.published ? 'Live on site' : 'Unpublished draft'}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-slate-900 mb-0 break-words">
                                {rec.title}
                              </h3>
                              <p className="text-xs text-slate-600 mb-0 break-words">{rec.summary}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-black/5">
                              <a
                                href={rec.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline btn-sm"
                              >
                                Source <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  isEditing
                                    ? (setEditingRecordId(null), setEditDraft(null))
                                    : startEditingRecord(rec)
                                }
                                className="btn btn-outline btn-sm"
                              >
                                {isEditing ? 'Cancel Edit' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => togglePublishRecord(rec)}
                                className="btn btn-outline btn-sm"
                              >
                                {rec.published ? 'Unpublish' : 'Republish'}
                              </button>
                              <button
                                type="button"
                                onClick={() => deletePublishedRecord(rec)}
                                className="btn btn-outline btn-sm text-red-700 border-red-200"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {isEditing && editDraft && (
                            <div className="border-t border-black/10 pt-4 space-y-3 bg-slate-50 rounded-lg p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#0032a0]">
                                  Edit Published Record
                                </span>
                                <button
                                  type="button"
                                  onClick={autoFormatEditDraft}
                                  className="btn btn-outline btn-sm"
                                >
                                  <i className="bi bi-magic" aria-hidden="true" /> Auto-Format Caps
                                </button>
                              </div>

                              <div className="grid grid-3" style={{ gap: 'var(--spacing-sm)' }}>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Reference No.
                                  </label>
                                  <input
                                    type="text"
                                    value={editDraft.referenceNo}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, referenceNo: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Category
                                  </label>
                                  <input
                                    type="text"
                                    value={editDraft.category}
                                    onChange={(e) =>
                                      setEditDraft({ ...editDraft, category: e.target.value })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Verification Status
                                  </label>
                                  <select
                                    value={editDraft.verificationStatus}
                                    onChange={(e) =>
                                      setEditDraft({
                                        ...editDraft,
                                        verificationStatus: e.target.value as VerificationStatus,
                                      })
                                    }
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                  >
                                    <option value="Verified">Verified</option>
                                    <option value="Needs Review">Needs Review</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={editDraft.title}
                                  onChange={(e) =>
                                    setEditDraft({ ...editDraft, title: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                  Summary
                                </label>
                                <textarea
                                  rows={2}
                                  value={editDraft.summary}
                                  onChange={(e) =>
                                    setEditDraft({ ...editDraft, summary: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm"
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingRecordId(null);
                                    setEditDraft(null);
                                  }}
                                  className="btn btn-outline btn-sm"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={savingEdit}
                                  onClick={() => saveEditedRecord(rec)}
                                  className="btn btn-primary btn-sm"
                                >
                                  {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 3: Sync Audit Log */}
              {activeTab === 'history' && (
                <div className="bg-white border border-black/10 rounded-xl overflow-hidden">
                  {syncRuns.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-600">
                      No sync runs logged yet.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th scope="col">Checked At</th>
                            <th scope="col">Official Sources Queried</th>
                            <th scope="col">New Candidates</th>
                            <th scope="col">PSGC Integrity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {syncRuns.map((run) => (
                            <tr key={run.id}>
                              <td data-label="Checked At" className="tabular-nums text-xs">
                                {run.checkedAt?.toDate
                                  ? run.checkedAt.toDate().toLocaleString('en-PH', {
                                      timeZone: 'Asia/Manila',
                                    })
                                  : run.id}
                              </td>
                              <td data-label="Official Sources Queried" className="text-xs">
                                {run.sourcesChecked.join(', ')}
                              </td>
                              <td data-label="New Candidates" className="tabular-nums text-xs font-semibold">
                                {run.candidatesFound}
                              </td>
                              <td data-label="PSGC Integrity" className="text-xs">
                                {run.psgcVerified ? (
                                  <span className="text-emerald-700 font-semibold">
                                    Verified (21 Barangays)
                                  </span>
                                ) : (
                                  <span className="text-amber-700">Check skipped / mismatch</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
