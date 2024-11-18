import { useQuery, useMutation, useQueryClient } from 'react-query';
import type { UseQueryResult } from 'react-query';
import { fetchEntries, createEntry, updateEntry, deleteEntry, DiaryEntry } from '../lib/notion';

interface UseEntriesReturn {
  entries: DiaryEntry[];
  isLoading: boolean;
  error: unknown;
  createEntry: (entry: Omit<DiaryEntry, 'id'>) => void;
  updateEntry: (params: { id: string; entry: Partial<Omit<DiaryEntry, 'id'>> }) => void;
  deleteEntry: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useEntries(): UseEntriesReturn {
  const queryClient = useQueryClient();

  // --- Fetch Entries ---
  const {
    data: entries = [],
    isLoading,
    error,
  }: UseQueryResult<DiaryEntry[], unknown> = useQuery('entries', fetchEntries, {
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(5000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch entries:', error);
    },
  });

  // --- Utility Function: Cache Invalidator ---
  const invalidateEntriesCache = () => {
    queryClient.invalidateQueries('entries');
  };

  // --- Create Mutation ---
  const createMutation = useMutation(createEntry, {
    onSuccess: () => {
      invalidateEntriesCache();
    },
    onError: (error) => {
      console.error('Failed to create entry:', error);
    },
  });

  // --- Update Mutation ---
  const updateMutation = useMutation(
    ({ id, entry }: { id: string; entry: Partial<Omit<DiaryEntry, 'id'>> }) =>
      updateEntry(id, entry),
    {
      onSuccess: () => {
        invalidateEntriesCache();
      },
      onError: (error) => {
        console.error('Failed to update entry:', error);
      },
    }
  );

  // --- Delete Mutation ---
  const deleteMutation = useMutation(deleteEntry, {
    onSuccess: () => {
      invalidateEntriesCache();
    },
    onError: (error) => {
      console.error('Failed to delete entry:', error);
    },
  });

  // --- Return ---
  return {
    entries,
    isLoading,
    error,
    createEntry: createMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}