import { useQuery, useMutation, useQueryClient } from 'react-query';
import type { UseQueryResult, UseMutationResult } from 'react-query';
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

  const {
    data: entries = [],
    isLoading,
    error,
  }: UseQueryResult<DiaryEntry[], unknown> = useQuery('entries', fetchEntries, {
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch entries:', error);
    },
  });

  const createMutation: UseMutationResult<
    DiaryEntry,
    unknown,
    Omit<DiaryEntry, 'id'>
  > = useMutation(createEntry, {
    onSuccess: () => {
      queryClient.invalidateQueries('entries');
    },
    onError: (error) => {
      console.error('Failed to create entry:', error);
    },
  });

  const updateMutation: UseMutationResult<
    DiaryEntry,
    unknown,
    { id: string; entry: Partial<Omit<DiaryEntry, 'id'>> }
  > = useMutation(
    ({ id, entry }) => updateEntry(id, entry),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('entries');
      },
      onError: (error) => {
        console.error('Failed to update entry:', error);
      },
    }
  );

  const deleteMutation: UseMutationResult<void, unknown, string> = useMutation(
    deleteEntry,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('entries');
      },
      onError: (error) => {
        console.error('Failed to delete entry:', error);
      },
    }
  );

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