import { useState, useMemo } from 'react';
import { Sparkles, Plus, Search, Calendar, Trash2, Tag, Compass, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { UserProfile, JournalEntry } from '../types';

interface JournalDashboardProps {
  user: UserProfile;
  journals: JournalEntry[];
  loading: boolean;
  onSelectJournal: (journal: JournalEntry) => void;
  onNewJournal: () => void;
  onDeleteJournal: (journalId: string) => void;
}

export default function JournalDashboard({
  user,
  journals,
  loading,
  onSelectJournal,
  onNewJournal,
  onDeleteJournal,
}: JournalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique moods for filter chips
  const availableMoods = useMemo(() => {
    const set = new Set<string>();
    journals.forEach((j) => {
      if (j.mood) set.add(j.mood);
    });
    return Array.from(set);
  }, [journals]);

  // Filtered journals
  const filteredJournals = useMemo(() => {
    return journals.filter((j) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.themes?.some((t) => t.toLowerCase().includes(q));

      const matchesMood =
        selectedMoodFilter === 'all' || j.mood?.toLowerCase() === selectedMoodFilter.toLowerCase();

      return matchesSearch && matchesMood;
    });
  }, [journals, searchQuery, selectedMoodFilter]);

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Isolated Private Space: users/{user.uid.substring(0, 10)}...</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Welcome, {user.displayName || 'Journaler'}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Have a reflective multi-turn conversation with Gemini. Each conversation is automatically summarized and analyzed for mood and growth themes.
          </p>
        </div>

        <button
          id="dashboard-new-journal-btn"
          onClick={onNewJournal}
          className="h-12 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-medium text-sm transition flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Start New Journal</span>
        </button>
      </div>

      {/* Controls Bar: Search & Mood Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="dashboard-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, themes, or summary..."
            className="w-full h-10 pl-9 pr-4 rounded-xl text-xs sm:text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
          />
        </div>

        {/* Mood Filter Chips */}
        {availableMoods.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-xs text-stone-400 dark:text-stone-500 mr-1 shrink-0">Mood:</span>
            <button
              onClick={() => setSelectedMoodFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                selectedMoodFilter === 'all'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              All ({journals.length})
            </button>
            {availableMoods.map((mood) => (
              <button
                key={mood}
                onClick={() => setSelectedMoodFilter(mood)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition shrink-0 ${
                  selectedMoodFilter === mood
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Journal Cards List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 dark:text-stone-400 text-sm">
          <Sparkles className="w-6 h-6 mx-auto mb-2 text-amber-500 animate-spin" />
          <span>Loading your journal archive...</span>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-200">
              {searchQuery || selectedMoodFilter !== 'all'
                ? 'No matching journals found'
                : 'Your journal is empty'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              {searchQuery || selectedMoodFilter !== 'all'
                ? 'Try clearing your search query or mood filter to see all your entries.'
                : 'Start your first reflective conversation with Gemini. When saved, your summary and insights will appear here.'}
            </p>
          </div>
          <button
            onClick={onNewJournal}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write First Journal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJournals.map((journal) => (
            <div
              key={journal.id}
              className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all hover:shadow-md flex flex-col justify-between relative cursor-pointer"
              onClick={() => onSelectJournal(journal)}
            >
              <div className="space-y-3">
                {/* Header: Date & Mood */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 text-stone-400 dark:text-stone-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(journal.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {journal.mood && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5" />
                      <span>{journal.mood}</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {journal.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                  {journal.summary}
                </p>

                {/* Themes */}
                {journal.themes && journal.themes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {journal.themes.slice(0, 3).map((theme, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-stone-400" />
                        <span>{theme}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(journal.id);
                  }}
                  title="Delete Journal"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-xl space-y-4">
            <div className="space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">Delete this journal?</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                This will permanently delete the conversation and generated insights from your private collection.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="flex-1 h-9 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteJournal(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 h-9 rounded-xl text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
