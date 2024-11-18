import { useState } from 'react';
import { PenLine, Search, Loader2, AlertCircle } from 'lucide-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { DiaryEntry } from './components/DiaryEntry';
import { DiaryForm } from './components/DiaryForm';
import { useEntries } from './hooks/useEntries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function DiaryApp() {
  const [isWriting, setIsWriting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const {
    entries,
    isLoading,
    error,
    createEntry,
    deleteEntry,
    isCreating,
    isDeleting,
  } = useEntries();

  const handleNewEntry = (entry: {
    title?: string;
    content: string;
    mood?: string;
  }) => {
    createEntry({
      ...entry,
      date: new Date(),
    });
    setIsWriting(false);
  };

  const filteredEntries = entries?.filter(
    (entry) =>
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) 
  ) ?? [];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg max-w-md w-full flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Configuration Error</h3>
            <p className="text-sm">
              Please make sure you have set up your Notion API credentials in the .env file.
              Check the README for setup instructions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My 独り言日記</h1>
            <button
              onClick={() => setIsWriting(!isWriting)}
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 size={20} className="mr-2 animate-spin" />
              ) : (
                <PenLine size={20} className="mr-2" />
              )}
              新規投稿
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {isWriting && (
          <div className="mb-8">
            <DiaryForm onSubmit={handleNewEntry} />
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="投稿を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

  <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 size={24} className="animate-spin mx-auto text-blue-600" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">さあ、独り言を書いてみよう！</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <DiaryEntry
                key={entry.id}
                {...entry}
                onEdit={() => {}}
                onDelete={() => deleteEntry(entry.id)}
                isDeleting={isDeleting}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DiaryApp />
    </QueryClientProvider>
  );
}

export default App;