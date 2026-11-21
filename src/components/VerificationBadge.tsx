import React from 'react';
import { SourceCitation, VerificationStatus } from '../types/civic';

interface BadgeProps {
  status: VerificationStatus;
}

export const VerificationBadge: React.FC<BadgeProps> = ({ status }) => {
  if (status === 'Verified') {
    return null;
  }

  const config: Record<Exclude<VerificationStatus, 'Verified'>, { cls: string; icon: string }> = {
    'Needs Review': { cls: 'verify-tag--review', icon: 'bi-exclamation-circle-fill' },
    Outdated: { cls: 'verify-tag--outdated', icon: 'bi-clock-history' },
    Unavailable: { cls: 'verify-tag--unavailable', icon: 'bi-slash-circle-fill' },
  };

  const { cls, icon } = config[status];

  return (
    <span className={`verify-tag ${cls}`} title={`Verification status: ${status}`}>
      <i className={`bi ${icon}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};

interface CitationBoxProps {
  citation: SourceCitation;
  compact?: boolean;
}

export const SourceCitationBox: React.FC<CitationBoxProps> = ({ citation, compact = false }) => {
  return (
    <div className="source-citation-box">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong>Source:</strong>{' '}
          <a href={citation.sourceUrl} target="_blank" rel="noopener noreferrer">
            {citation.sourceTitle} <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          </a>
        </div>
        <VerificationBadge status={citation.verificationStatus} />
      </div>
      {!compact && (
        <div className="source-citation-meta">
          <span>
            <strong>Agency:</strong> {citation.issuingAgency}
          </span>
          <span>
            <strong>Published:</strong> {citation.publicationDate}
          </span>
          <span>
            <strong>Last Verified:</strong> {citation.lastVerified}
          </span>
        </div>
      )}
      {citation.notes && <p className="mt-2 mb-0 text-xs text-slate-600">{citation.notes}</p>}
    </div>
  );
};
