import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import { SourceCitationBox } from '../components/VerificationBadge';
import { OFFICIALS_DATA } from '../data/municipalInfo';

interface OfficialEntry {
  name: string;
  role: string;
  email: string | null;
  contactNo: string | null;
}

interface OfficialsGroup {
  barangay: string;
  heading: string;
  subtitle: string;
  badge: string;
  officials: OfficialEntry[];
}

interface BarangayOfficialsPayload {
  source: string;
  municipality: string;
  province: string;
  region: string;
  lastUpdated: string;
  barangays: { barangay: string; officials: OfficialEntry[] }[];
}

const ROLE_FILTERS = [
  'All Roles',
  'Municipal Mayor',
  'Municipal Vice Mayor',
  'Sangguniang Bayan Member',
  'Punong Barangay',
  'Sangguniang Barangay Member',
  'SK Chairperson',
  'Barangay Secretary',
] as const;

function isPrimaryRole(role: string): boolean {
  return (
    role === 'Punong Barangay' ||
    role === 'Municipal Mayor' ||
    role === 'Municipal Vice Mayor'
  );
}

function getRoleBadgeClass(role: string): string {
  if (isPrimaryRole(role)) {
    return 'bg-[#0032a0] text-white';
  }
  if (role === 'SK Chairperson') {
    return 'bg-[#2E8B57]/12 text-[#2E8B57] border border-[#2E8B57]/25';
  }
  if (role === 'Barangay Secretary' || role === 'Ex-Officio Sangguniang Bayan Members') {
    return 'bg-amber-100 text-amber-900 border border-amber-300/60';
  }
  return 'bg-slate-100 text-[#0f2342] border border-black/10';
}

export default function OfficialsPage() {
  const [payload, setPayload] = useState<BarangayOfficialsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('All Roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBarangays, setExpandedBarangays] = useState<Record<string, boolean>>({});

  const toggleBarangay = (name: string) => {
    setExpandedBarangays((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  useEffect(() => {
    let active = true;
    fetch('/data/barangay-officials.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BarangayOfficialsPayload | null) => {
        if (active && data) {
          setPayload(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const allGroups = useMemo<OfficialsGroup[]>(() => {
    const municipalGroup: OfficialsGroup = {
      barangay: 'Municipal Officials',
      heading: 'Municipality of Alcala (Municipal Officials)',
      subtitle: `Alcala, Pangasinan · 2025–2028 Term · ${OFFICIALS_DATA.length} officials listed`,
      badge: 'COMELEC / LGU',
      officials: OFFICIALS_DATA.map((o) => ({
        name: o.name,
        role: o.title,
        email: o.email ?? null,
        contactNo: o.phone ?? null,
      })),
    };

    const barangayGroups: OfficialsGroup[] = (payload?.barangays || []).map((b) => ({
      barangay: b.barangay,
      heading: `Barangay ${b.barangay}`,
      subtitle: `Alcala, Pangasinan · ${b.officials.length} official${b.officials.length === 1 ? '' : 's'} listed`,
      badge: 'DILG Directory',
      officials: b.officials,
    }));

    return [municipalGroup, ...barangayGroups];
  }, [payload]);

  const barangayNames = useMemo(
    () => (payload?.barangays || []).map((b) => b.barangay),
    [payload]
  );

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allGroups
      .filter((group) => selectedBarangay === 'all' || group.barangay === selectedBarangay)
      .map((group) => {
        const officials = group.officials.filter((off) => {
          if (selectedRole !== 'All Roles' && off.role !== selectedRole) return false;
          if (!q) return true;
          return (
            off.name.toLowerCase().includes(q) ||
            off.role.toLowerCase().includes(q) ||
            group.heading.toLowerCase().includes(q) ||
            (off.email || '').toLowerCase().includes(q) ||
            (off.contactNo || '').toLowerCase().includes(q)
          );
        });
        return { ...group, officials };
      })
      .filter((group) => group.officials.length > 0);
  }, [allGroups, selectedBarangay, selectedRole, searchQuery]);

  const totalMatchingOfficials = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.officials.length, 0),
    [filteredGroups]
  );

  return (
    <Layout
      breadcrumbs={[{ label: 'Barangay Officials' }]}
      pageTitle="Barangay Officials Directory"
      pageDescription="Complete directory of Punong Barangays, Sangguniang Barangay Members, SK Chairpersons, and Barangay Secretaries across all 21 barangays of Alcala, Pangasinan."
    >
      <section className="page-header">
        <div className="container">
          <div className="page-header-content">
            <span className="page-header-badge">
              <i className="bi bi-people-fill" aria-hidden="true" />{' '}
              <span>Municipal &amp; 21 Barangays</span>
            </span>
            <h1>Alcala Officials Directory</h1>
            <p className="page-header-desc">
              Municipal Mayor, Vice Mayor, Sangguniang Bayan Members, Punong Barangays, Sangguniang
              Barangay Members, SK Chairpersons, and Barangay Secretaries of Alcala, Pangasinan.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filter Bar */}
          <div className="bg-white border border-black/10 rounded-2xl p-4 sm:p-5 shadow-xs mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-7 relative">
                <i
                  className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search official name, barangay, email, or contact number..."
                  aria-label="Search barangay officials"
                  className="w-full rounded-xl border border-black/15 bg-[#FAF7F2] pl-10 pr-4 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:border-[#0032a0] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-5">
                <select
                  value={selectedBarangay}
                  onChange={(e) => setSelectedBarangay(e.target.value)}
                  aria-label="Filter by jurisdiction or barangay"
                  className="w-full rounded-xl border border-black/15 bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#0f2342] focus:border-[#0032a0] focus:bg-white focus:outline-none"
                >
                  <option value="all">All (Municipal &amp; 21 Barangays)</option>
                  <option value="Municipal Officials">Municipality of Alcala (Municipal Officials)</option>
                  {barangayNames.map((name) => (
                    <option key={name} value={name}>
                      Barangay {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between gap-3">
              <div className="md:hidden">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  aria-label="Filter by role"
                  className="w-full rounded-xl border border-black/15 bg-[#FAF7F2] px-3.5 py-2.5 text-sm font-medium text-[#0f2342] focus:border-[#0032a0] focus:bg-white focus:outline-none"
                >
                  {ROLE_FILTERS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden md:flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
                {ROLE_FILTERS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      selectedRole === role
                        ? 'bg-[#0032a0] text-white'
                        : 'bg-[#FAF7F2] text-[#0f2342] border border-black/10 hover:border-[#0032a0]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <span className="font-mono-data text-xs font-semibold text-slate-500">
                Showing {totalMatchingOfficials} official{totalMatchingOfficials === 1 ? '' : 's'} across{' '}
                {filteredGroups.length} group{filteredGroups.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-black/10 rounded-2xl p-10 text-center text-sm text-slate-500">
              Loading barangay officials directory...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-2xl p-10 text-center">
              <p className="text-sm text-slate-600 mb-3">
                No barangay officials matched your current search or filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBarangay('all');
                  setSelectedRole('All Roles');
                }}
                className="btn btn-outline btn-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredGroups.map((group) => {
                const hasPrimary = group.officials.some((o) => isPrimaryRole(o.role));
                const otherCount = group.officials.filter((o) => !isPrimaryRole(o.role)).length;
                const autoExpandForFilter =
                  Boolean(searchQuery.trim()) || selectedRole !== 'All Roles' || !hasPrimary;
                const isMobileExpanded =
                  autoExpandForFilter || Boolean(expandedBarangays[group.barangay]);

                return (
                  <article
                    key={group.barangay}
                    className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 bg-[#FAF7F2] border-b border-black/10">
                      <div>
                        <h2 className="text-lg font-bold text-[#0f2342] m-0">
                          {group.heading}
                        </h2>
                        <p className="text-xs text-slate-500 m-0">
                          {group.subtitle}
                        </p>
                      </div>
                      <span className="font-mono-data text-xs font-bold text-[#0032a0] bg-[#0032a0]/10 px-3 py-1 rounded-full">
                        {group.badge}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 sm:p-5">
                      {group.officials.map((off, idx) => {
                        const hasValidEmail =
                          Boolean(off.email) && off.email!.toLowerCase() !== 'none@gmail.com';
                        const cleanTel = off.contactNo ? off.contactNo.replace(/[^\d+]/g, '') : '';
                        const isHiddenOnMobile =
                          !isPrimaryRole(off.role) && !isMobileExpanded;

                        return (
                          <div
                            key={`${group.barangay}-${off.role}-${off.name}-${idx}`}
                            className={`rounded-xl border p-4 flex-col justify-between gap-2.5 ${
                              isHiddenOnMobile ? 'hidden md:flex' : 'flex'
                            } ${
                              isPrimaryRole(off.role)
                                ? 'border-[#0032a0]/25 bg-[#0032a0]/[0.03]'
                                : 'border-black/10 bg-white'
                            }`}
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-[#0f2342] m-0">
                                {off.name}
                              </h3>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold shrink-0 ${getRoleBadgeClass(
                                  off.role
                                )}`}
                              >
                                {off.role}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <i className="bi bi-envelope text-[#0032a0]" aria-hidden="true" />
                                {hasValidEmail ? (
                                  <a
                                    href={`mailto:${off.email}`}
                                    className="text-[#0032a0] hover:underline truncate"
                                  >
                                    {off.email}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">No email listed</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <i className="bi bi-telephone text-[#0032a0]" aria-hidden="true" />
                                {off.contactNo ? (
                                  <a
                                    href={`tel:${cleanTel}`}
                                    className="font-mono-data font-semibold text-[#0f2342] hover:text-[#0032a0] hover:underline"
                                  >
                                    {off.contactNo}
                                  </a>
                                ) : (
                                  <span className="text-slate-400">No contact listed</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!autoExpandForFilter && otherCount > 0 && (
                      <div className="md:hidden px-4 pb-4">
                        <button
                          type="button"
                          onClick={() => toggleBarangay(group.barangay)}
                          aria-expanded={isMobileExpanded}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-[#0032a0] hover:border-[#0032a0] transition-colors cursor-pointer"
                        >
                          <span>
                            {isMobileExpanded
                              ? 'Hide other officials'
                              : `Show ${otherCount} more official${otherCount === 1 ? '' : 's'}`}
                          </span>
                          <i
                            className={`bi ${
                              isMobileExpanded ? 'bi-chevron-up' : 'bi-chevron-down'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-8">
            <SourceCitationBox
              citation={{
                sourceTitle: 'DILG Barangay Officials Directory — Alcala, Pangasinan',
                sourceUrl: 'https://dilg.gov.ph/barangay-officials-directory',
                issuingAgency: 'Department of the Interior and Local Government (DILG)',
                publicationDate: payload?.lastUpdated || '2026-11-26',
                lastVerified: payload?.lastUpdated || '2026-11-26',
                verificationStatus: 'Verified',
              }}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
