'use client';

import { ArrowUpDown, BookOpen, Clock3, ExternalLink, Filter, Grid3x3, Layers, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import { createSupabaseBrowserClient } from '@/lib/auth/supabase-browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface StudyMaterialItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  priority: number;
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

type SortKey = 'title' | 'priority' | 'type' | 'access' | 'provider' | 'topic' | 'level' | 'time';
type SortDirection = 'asc' | 'desc';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'type', label: 'Type' },
  { value: 'access', label: 'Access' },
  { value: 'provider', label: 'Provider' },
  { value: 'topic', label: 'Topic' },
  { value: 'level', label: 'Level' },
  { value: 'time', label: 'Time' },
];

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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const sortedMaterials = useMemo(() => {
    const cloned = [...materials];
    const directionMultiplier = sortDirection === 'asc' ? 1 : -1;

    return cloned.sort((a, b) => {
      switch (sortKey) {
      case 'priority': {
        return (a.priority - b.priority) * directionMultiplier;
      }
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
    <section className='space-y-5 pb-8 animate-rise-in'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h2 className='text-3xl font-semibold text-foreground'>Study Materials</h2>
          <p className='mt-1 text-sm text-muted-foreground'>Curated resources, ranked by priority and optimized for your prep.</p>
        </div>
        <div className='flex items-center gap-3'>
          <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>
            <BookOpen className='mr-1 h-3.5 w-3.5' />
            {sortedMaterials.length} resources
          </Badge>
          <div className='flex gap-1 rounded-lg border border-border/70 bg-card/70 p-1'>
            <Button
              type='button'
              size='sm'
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              className={cn(
                viewMode === 'cards'
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={() => setViewMode('cards')}
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              type='button'
              size='sm'
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              className={cn(
                viewMode === 'table'
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={() => setViewMode('table')}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      <Card className='border-border/70 bg-card/70'>
        <CardHeader className='pb-4'>
          <CardTitle className='flex items-center gap-2 text-foreground'>
            <Filter className='h-4 w-4 text-cyan-700 dark:text-cyan-300' />
            Filters & Sorting
          </CardTitle>
          <CardDescription className='text-muted-foreground'>Tune the list to match your current focus.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-5'>
            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Type</p>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as (typeof TYPE_OPTIONS)[number]['value'])}>
                <SelectTrigger className='bg-background/70 text-foreground'>
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Access</p>
              <Select value={priceFilter} onValueChange={(value) => setPriceFilter(value as (typeof PRICE_OPTIONS)[number]['value'])}>
                <SelectTrigger className='bg-background/70 text-foreground'>
                  <SelectValue placeholder='Free + Paid' />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Sort By</p>
              <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                <SelectTrigger className='bg-background/70 text-foreground'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Direction</p>
              <Button
                type='button'
                variant='outline'
                className='w-full justify-start border-border bg-background/70 text-foreground hover:bg-muted'
                onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
              >
                <ArrowUpDown className='h-4 w-4' />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>

            <div className='space-y-2 md:col-span-2 xl:col-span-1'>
              <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>Search</p>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder='Try: VPC, Well-Architected'
                className='h-10 w-full rounded-md border border-input bg-background/70 px-3 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring'
              />
            </div>
          </div>

          <div className='mt-4 flex flex-wrap gap-2'>
            <Button type='button' onClick={() => { void loadMaterials(); }} disabled={isLoading} className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
            <Button
              type='button'
              variant='ghost'
              className='text-muted-foreground hover:bg-muted hover:text-foreground'
              onClick={() => {
                setTypeFilter('all');
                setPriceFilter('all');
                setSortKey('title');
                setSortDirection('asc');
                setSearch('');
              }}
            >
              Reset Controls
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <p className='rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>{error}</p> : null}

      {!isLoading && sortedMaterials.length === 0 ? (
        <Card className='border-border/70 bg-card/70'>
          <CardContent className='py-10 text-center text-muted-foreground'>No materials found for the selected filters.</CardContent>
        </Card>
      ) : null}

      {viewMode === 'cards' ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          {sortedMaterials.map((material) => (
            <Card key={material.id} className='border-border/70 bg-card/70 transition-colors hover:border-cyan-400/35'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-3'>
                  <CardTitle className='text-lg text-foreground'>{material.title}</CardTitle>
                  <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>P{material.priority}</Badge>
                </div>
                <CardDescription className='line-clamp-2 text-muted-foreground'>
                  {material.description ?? 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>{material.type}</Badge>
                  <Badge variant='secondary'>{material.isFree ? 'Free' : 'Paid'}</Badge>
                  <Badge variant='secondary'>{material.level ?? 'mixed'}</Badge>
                  <Badge variant='secondary'>
                    <Layers className='mr-1 h-3.5 w-3.5' />
                    {material.topicTitle ?? 'General'}
                  </Badge>
                  {material.estimatedMinutes ? (
                    <Badge variant='secondary'>
                      <Clock3 className='mr-1 h-3.5 w-3.5' />
                      {material.estimatedMinutes} min
                    </Badge>
                  ) : null}
                </div>

                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <p className='text-xs text-muted-foreground'>Provider: {material.provider ?? 'Unknown'}</p>
                  <Button asChild className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
                    <a href={material.url} target='_blank' rel='noreferrer'>
                      Open Resource
                      <ExternalLink className='h-4 w-4' />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='overflow-hidden border-border/70 bg-card/70'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-border/70 bg-card/90'>
                  <TableHeader
                    label='Title'
                    sortKey='title'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Priority'
                    sortKey='priority'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Type'
                    sortKey='type'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Access'
                    sortKey='access'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Provider'
                    sortKey='provider'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Topic'
                    sortKey='topic'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Level'
                    sortKey='level'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <TableHeader
                    label='Time'
                    sortKey='time'
                    currentSortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={setSortKey}
                  />
                  <th className='px-4 py-3 text-left font-semibold text-foreground'>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedMaterials.map((material) => (
                  <tr
                    key={material.id}
                    className='border-b border-border/50 transition-colors hover:bg-muted/60'
                  >
                    <td className='max-w-sm truncate px-4 py-3 text-foreground'>{material.title}</td>
                    <td className='px-4 py-3'>
                      <Badge className='bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'>P{material.priority}</Badge>
                    </td>
                    <td className='px-4 py-3'>
                      <Badge variant='secondary'>{material.type}</Badge>
                    </td>
                    <td className='px-4 py-3'>
                      <Badge variant='secondary'>
                        {material.isFree ? 'Free' : 'Paid'}
                      </Badge>
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>{material.provider ?? 'Unknown'}</td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>{material.topicTitle ?? 'General'}</td>
                    <td className='px-4 py-3'>
                      <Badge variant='secondary'>
                        {material.level ?? 'mixed'}
                      </Badge>
                    </td>
                    <td className='px-4 py-3 text-xs text-muted-foreground'>
                      {material.estimatedMinutes ? `${material.estimatedMinutes}m` : '–'}
                    </td>
                    <td className='px-4 py-3'>
                      <Button asChild size='sm' className='bg-cyan-400 text-slate-950 hover:bg-cyan-300'>
                        <a href={material.url} target='_blank' rel='noreferrer'>
                          <ExternalLink className='h-3.5 w-3.5' />
                        </a>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}

interface TableHeaderProps {
  label: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}

function TableHeader({
  label,
  sortKey,
  currentSortKey,
  sortDirection,
  onSort,
}: TableHeaderProps) {
  const isActive = currentSortKey === sortKey;

  return (
    <th className='px-4 py-3 text-left'>
      <button
        type='button'
        className='flex items-center gap-1 font-semibold text-foreground transition-colors hover:text-cyan-500'
        onClick={() => onSort(sortKey)}
      >
        {label}
        {isActive && (
          <ArrowUpDown
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              sortDirection === 'desc' && 'rotate-180',
            )}
          />
        )}
      </button>
    </th>
  );
}
