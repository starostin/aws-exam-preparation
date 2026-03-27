'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { apiClient } from '@/lib/api/client';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';

interface StudyMaterialItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: 'docs' | 'video' | 'course' | 'practice_test' | string;
  isFree: boolean;
  provider: string | null;
  level: string | null;
  tags: string[];
  estimatedMinutes: number | null;
  topicTitle: string | null;
  domainName: string | null;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'docs', label: 'Docs' },
  { value: 'video', label: 'Video' },
  { value: 'course', label: 'Course' },
  { value: 'practice_test', label: 'Practice Test' },
] as const;

const PRICE_OPTIONS = [
  { value: 'all', label: 'Free + Paid' },
  { value: 'free', label: 'Free only' },
  { value: 'paid', label: 'Paid only' },
] as const;

type SortKey = 'title' | 'type' | 'access' | 'provider' | 'topic' | 'level' | 'time';
type SortDirection = 'asc' | 'desc';

export default function MaterialsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [materials, setMaterials] = useState<StudyMaterialItem[]>([]);
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]['value']>('all');
  const [priceFilter, setPriceFilter] = useState<(typeof PRICE_OPTIONS)[number]['value']>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedMaterials = useMemo(() => {
    const cloned = [...materials];
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    return cloned.sort((a, b) => {
      switch (sortKey) {
      case 'time': {
        const aValue = a.estimatedMinutes ?? Number.MAX_SAFE_INTEGER;
        const bValue = b.estimatedMinutes ?? Number.MAX_SAFE_INTEGER;
        return (aValue - bValue) * directionMultiplier;
      }
      case 'access': {
        const aValue = a.isFree ? 0 : 1;
        const bValue = b.isFree ? 0 : 1;
        return (aValue - bValue) * directionMultiplier;
      }
      case 'provider': {
        return (a.provider ?? '').localeCompare(b.provider ?? '') * directionMultiplier;
      }
      case 'topic': {
        return (a.topicTitle ?? '').localeCompare(b.topicTitle ?? '') * directionMultiplier;
      }
      case 'level': {
        return (a.level ?? '').localeCompare(b.level ?? '') * directionMultiplier;
      }
      case 'type': {
        return a.type.localeCompare(b.type) * directionMultiplier;
      }
      case 'title':
      default: {
        return a.title.localeCompare(b.title) * directionMultiplier;
      }
      }
    });
  }, [materials, sortDirection, sortKey]);

  function toggleSort(column: SortKey): void {
    if (sortKey === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(column);
    setSortDirection('asc');
  }

  function getSortLabel(column: SortKey): string {
    if (sortKey !== column) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  async function loadMaterials(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        throw new Error(sessionError.message);
      }

      const token = data.session?.access_token;
      if (!token) {
        throw new Error('Missing access token. Please sign in again.');
      }

      const queryParams = new URLSearchParams();

      if (typeFilter !== 'all') {
        queryParams.set('type', typeFilter);
      }

      if (priceFilter === 'free') {
        queryParams.set('isFree', 'true');
      }

      if (priceFilter === 'paid') {
        queryParams.set('isFree', 'false');
      }

      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        queryParams.set('search', trimmedSearch);
      }

      const path = `/topics/materials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const dataRows = await apiClient.get<StudyMaterialItem[]>(path, { token });
      setMaterials(dataRows);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load study materials.');
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMaterials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={styles.page}>
      <section style={styles.filtersWrap}>
        <div style={styles.filterItem}>
          <label htmlFor='type' style={styles.label}>Type</label>
          <select
            id='type'
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as (typeof TYPE_OPTIONS)[number]['value'])}
            style={styles.select}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterItem}>
          <label htmlFor='price' style={styles.label}>Access</label>
          <select
            id='price'
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value as (typeof PRICE_OPTIONS)[number]['value'])}
            style={styles.select}
          >
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ ...styles.filterItem, flex: 1 }}>
          <label htmlFor='search' style={styles.label}>Search</label>
          <input
            id='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Try: VPC, Well-Architected, Tutorials Dojo'
            style={styles.input}
          />
        </div>

        <button type='button' onClick={() => { void loadMaterials(); }} disabled={isLoading} style={styles.loadButton}>
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
      </section>

      {error ? <p style={styles.error}>{error}</p> : null}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('title')} style={styles.sortButton}>
                  Title{getSortLabel('title')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('type')} style={styles.sortButton}>
                  Type{getSortLabel('type')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('access')} style={styles.sortButton}>
                  Access{getSortLabel('access')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('provider')} style={styles.sortButton}>
                  Provider{getSortLabel('provider')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('topic')} style={styles.sortButton}>
                  Topic{getSortLabel('topic')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('level')} style={styles.sortButton}>
                  Level{getSortLabel('level')}
                </button>
              </th>
              <th style={styles.th}>
                <button type='button' onClick={() => toggleSort('time')} style={styles.sortButton}>
                  Time{getSortLabel('time')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.map((material) => (
              <tr key={material.id}>
                <td style={styles.tdTitle}>
                  <a href={material.url} target='_blank' rel='noreferrer' style={styles.link}>
                    {material.title}
                  </a>
                  {material.description ? <p style={styles.description}>{material.description}</p> : null}
                </td>
                <td style={styles.td}>{material.type}</td>
                <td style={styles.td}>{material.isFree ? 'Free' : 'Paid'}</td>
                <td style={styles.td}>{material.provider ?? 'Unknown'}</td>
                <td style={styles.td}>{material.topicTitle ?? 'General'}</td>
                <td style={styles.td}>{material.level ?? 'mixed'}</td>
                <td style={styles.td}>{material.estimatedMinutes ? `${material.estimatedMinutes} min` : '-'}</td>
              </tr>
            ))}

            {!isLoading && sortedMaterials.length === 0 ? (
              <tr>
                <td style={styles.emptyRow} colSpan={7}>
                  No materials found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100%',
  },
  filtersWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    alignItems: 'flex-end',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #ecf2fa',
  },
  filterItem: {
    display: 'grid',
    gap: '0.35rem',
    minWidth: '180px',
  },
  label: {
    fontSize: '0.85rem',
    color: '#365273',
    fontWeight: 700,
  },
  select: {
    border: '1px solid #c3d5ec',
    borderRadius: '8px',
    padding: '0.5rem 0.55rem',
    fontSize: '0.95rem',
  },
  input: {
    border: '1px solid #c3d5ec',
    borderRadius: '8px',
    padding: '0.5rem 0.55rem',
    fontSize: '0.95rem',
  },
  loadButton: {
    border: 0,
    borderRadius: '8px',
    backgroundColor: '#0f4c81',
    color: '#fff',
    padding: '0.55rem 0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    height: '38px',
  },
  error: {
    margin: '0.9rem 1.5rem 0',
    color: '#b42318',
    fontSize: '0.93rem',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    padding: '0.6rem 1rem 1rem',
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    minWidth: '980px',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    borderBottom: '1px solid #dbe6f4',
    color: '#27486f',
    background: '#f9fbff',
    fontWeight: 700,
    padding: '0.65rem 0.7rem',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  sortButton: {
    border: 0,
    background: 'transparent',
    padding: 0,
    margin: 0,
    color: 'inherit',
    font: 'inherit',
    textTransform: 'inherit',
    letterSpacing: 'inherit',
    cursor: 'pointer',
  },
  td: {
    borderBottom: '1px solid #ecf2fa',
    padding: '0.65rem 0.7rem',
    color: '#2f4a68',
    fontSize: '0.92rem',
    verticalAlign: 'top',
  },
  tdTitle: {
    borderBottom: '1px solid #ecf2fa',
    padding: '0.65rem 0.7rem',
    verticalAlign: 'top',
    minWidth: '320px',
  },
  link: {
    color: '#0a4a8e',
    fontWeight: 700,
    textDecoration: 'none',
  },
  description: {
    margin: '0.32rem 0 0',
    color: '#496585',
    fontSize: '0.87rem',
    lineHeight: 1.35,
  },
  emptyRow: {
    textAlign: 'center',
    color: '#55718f',
    padding: '1rem',
    fontStyle: 'italic',
  },
};
