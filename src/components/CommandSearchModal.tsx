import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SERVICES_DATA } from '../data/servicesData';
import {
  BARANGAYS_DATA,
  EMERGENCY_CONTACTS,
  MUNICIPAL_OFFICES,
  OFFICIALS_DATA,
} from '../data/municipalInfo';
import { INFRASTRUCTURE_PROJECTS, ORDINANCES_DATA } from '../data/transparencyData';
import { FAQ_ITEMS, NEWS_ITEMS } from '../data/communityData';
import { slugifyBarangay } from './BarangayEmblem';

interface SearchEntry {
  id: string;
  label: string;
  sublabel?: string;
  type:
    | 'Service'
    | 'Hotline'
    | 'Office'
    | 'Official'
    | 'Barangay'
    | 'Ordinance'
    | 'Project'
    | 'News'
    | 'FAQ';
  route: string;
  keywords: string;
}

const QUICK_JUMPS: { label: string; category: string; route: string; icon: string }[] = [
  {
    label: 'Birth Certificate (MCR)',
    category: 'Service Guide',
    route: '/service-details/birth-certificate',
    icon: 'bi-file-earmark-text',
  },
  {
    label: 'Business Permit & BPLO',
    category: 'Service Guide',
    route: '/service-details/business-permits-licensing',
    icon: 'bi-shop',
  },
  {
    label: 'FY 2026 Budget (₱260.23M) & DPWH Projects',
    category: 'Transparency',
    route: '/budget',
    icon: 'bi-pie-chart',
  },
  {
    label: 'Emergency Hotlines & 21 Barangays',
    category: 'Contacts',
    route: '/contact',
    icon: 'bi-telephone',
  },
  {
    label: 'Ordinance Framework (Sangguniang Bayan)',
    category: 'Legislation',
    route: '/legislative/ordinance-framework',
    icon: 'bi-journal-bookmark',
  },
];

interface CommandSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandSearchModal({ open, onClose }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const index = useMemo<SearchEntry[]>(() => {
    const entries: SearchEntry[] = [];

    SERVICES_DATA.forEach((s) => {
      entries.push({
        id: `srv-${s.id}`,
        label: s.title,
        sublabel: `${s.office} · ${s.fees}`,
        type: 'Service',
        route: `/service-details/${s.id}`,
        keywords: `${s.title} ${s.category} ${s.description} ${s.keywords.join(' ')} ${s.office}`.toLowerCase(),
      });
    });

    EMERGENCY_CONTACTS.forEach((c) => {
      entries.push({
        id: `hotline-${c.id}`,
        label: c.office,
        sublabel: c.phones[0] || c.address,
        type: 'Hotline',
        route: `/contact?q=${encodeURIComponent(c.office)}`,
        keywords: `${c.office} ${c.category} ${c.phones.join(' ')} ${c.address}`.toLowerCase(),
      });
    });

    MUNICIPAL_OFFICES.forEach((o) => {
      entries.push({
        id: `off-${o.id}`,
        label: o.name,
        sublabel: `Head: ${o.headName}`,
        type: 'Office',
        route: `/government?office=${encodeURIComponent(o.id)}#offices`,
        keywords: `${o.name} ${o.headName} ${o.description} ${o.responsibilities.join(' ')}`.toLowerCase(),
      });
    });

    OFFICIALS_DATA.forEach((off) => {
      entries.push({
        id: `official-${off.id}`,
        label: off.name,
        sublabel: `${off.title} · Term ${off.term}`,
        type: 'Official',
        route: `/government`,
        keywords: `${off.name} ${off.title} ${off.branch}`.toLowerCase(),
      });
    });

    BARANGAYS_DATA.forEach((b) => {
      entries.push({
        id: `brgy-${b.psgcCode}`,
        label: `Brgy. ${b.name}`,
        sublabel: `PSGC ${b.psgcCode} · ${b.classification}${b.phones?.[0] ? ` · ${b.phones[0]}` : ''}`,
        type: 'Barangay',
        route: `/statistics/${slugifyBarangay(b.name)}`,
        keywords: `barangay ${b.name} ${b.psgcCode} ${b.classification} ${b.phones?.join(' ') || ''}`.toLowerCase(),
      });
    });

    ORDINANCES_DATA.forEach((ord) => {
      entries.push({
        id: `ord-${ord.ordinanceNo}`,
        label: `Ordinance No. ${ord.ordinanceNo}`,
        sublabel: ord.title,
        type: 'Ordinance',
        route: `/legislative/ordinance-framework?q=${encodeURIComponent(ord.ordinanceNo)}`,
        keywords: `ordinance ${ord.ordinanceNo} ${ord.title} ${ord.category} ${ord.summary}`.toLowerCase(),
      });
    });

    INFRASTRUCTURE_PROJECTS.forEach((proj) => {
      entries.push({
        id: `proj-${proj.id}`,
        label: `${proj.id} · ${proj.name}`,
        sublabel: `${proj.barangay} · ${proj.statusLabel}`,
        type: 'Project',
        route: `/contracts?project=${encodeURIComponent(proj.id)}`,
        keywords: `${proj.id} ${proj.name} ${proj.barangay} ${proj.contractor} ${proj.category}`.toLowerCase(),
      });
    });

    NEWS_ITEMS.forEach((n) => {
      entries.push({
        id: `news-${n.id}`,
        label: n.title,
        sublabel: `${n.category} · ${n.date}`,
        type: 'News',
        route: `/news?q=${encodeURIComponent(n.title)}`,
        keywords: `${n.title} ${n.category} ${n.summary} ${n.details}`.toLowerCase(),
      });
    });

    FAQ_ITEMS.forEach((f) => {
      entries.push({
        id: `faq-${f.id}`,
        label: f.question,
        sublabel: f.category,
        type: 'FAQ',
        route: `/faq?q=${encodeURIComponent(f.question)}`,
        keywords: `${f.question} ${f.answer} ${f.category}`.toLowerCase(),
      });
    });

    return entries;
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return index
      .filter((item) => {
        const haystack = `${item.label.toLowerCase()} ${item.sublabel?.toLowerCase() || ''} ${item.keywords}`;
        return tokens.every((tok) => haystack.includes(tok));
      })
      .sort((a, b) => {
        const aTitle = a.label.toLowerCase().includes(q) ? 0 : 1;
        const bTitle = b.label.toLowerCase().includes(q) ? 0 : 1;
        return aTitle - bTitle;
      })
      .slice(0, 10);
  }, [query, index]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const navigateTo = (route: string) => {
    onClose();
    navigate(route);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const listLength = query.trim().length >= 2 ? results.length : QUICK_JUMPS.length;
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (listLength === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim().length >= 2) {
        const target = results[activeIndex] || results[0];
        if (target) {
          navigateTo(target.route);
        } else {
          navigateTo(`/services?q=${encodeURIComponent(query.trim())}`);
        }
      } else {
        const jump = QUICK_JUMPS[activeIndex] || QUICK_JUMPS[0];
        if (jump) navigateTo(jump.route);
      }
    }
  };

  return (
    <div
      className="command-search-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Quick search across BetterAlcala"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="command-search-dialog">
        <div className="command-search-header">
          <i className="bi bi-search text-[#0032a0]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search services, 21 barangays, hotlines, ordinances, DPWH projects..."
            aria-label="Global BetterAlcala search"
            className="command-search-input"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="command-search-esc"
            aria-label="Close quick search"
          >
            Esc
          </button>
        </div>

        <div className="command-search-body">
          {query.trim().length < 2 ? (
            <div>
              <div className="command-search-section-label">Quick Shortcuts</div>
              <ul className="command-search-list" role="listbox" aria-label="Quick civic shortcuts">
                {QUICK_JUMPS.map((item, idx) => (
                  <li key={item.route}>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.route)}
                      className={`command-search-item ${
                        idx === activeIndex ? 'is-active' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <i className={`bi ${item.icon} text-[#0032a0]`} aria-hidden="true" />
                        <span className="truncate font-semibold text-slate-900">{item.label}</span>
                      </span>
                      <span className="command-search-type">{item.category}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No direct index match for “{query}”
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Search inside the full Municipal Services Directory instead.
              </p>
              <button
                type="button"
                onClick={() => navigateTo(`/services?q=${encodeURIComponent(query.trim())}`)}
                className="btn btn-primary btn-sm"
              >
                Search Services Directory
              </button>
            </div>
          ) : (
            <div>
              <div className="command-search-section-label tabular-nums">
                {results.length} Matching Records
              </div>
              <ul className="command-search-list" role="listbox" aria-label="Search results">
                {results.map((item, idx) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateTo(item.route)}
                      className={`command-search-item ${
                        idx === activeIndex ? 'is-active' : ''
                      }`}
                    >
                      <div className="min-w-0 text-left">
                        <div className="truncate font-semibold text-slate-900 text-sm">
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className="truncate text-xs text-slate-500 mt-0.5">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                      <span className="command-search-type">{item.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="command-search-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> Navigate · <kbd>Enter</kbd> Open · <kbd>Esc</kbd> Close
          </span>
          <span className="hidden sm:inline">BetterAlcala Civic Index</span>
        </div>
      </div>
    </div>
  );
}
