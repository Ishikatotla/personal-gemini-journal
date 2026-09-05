import { useState, useEffect, useCallback } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { UserProfile, JournalEntry, ViewMode } from './types';
import {
  subscribeToAuth,
  logoutUser,
  loginAsCustomUser,
  fetchUserJournals,
  deleteUserJournal,
} from './lib/firebase';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import JournalDashboard from './components/JournalDashboard';
import JournalChat from './components/JournalChat';
import JournalDetail from './components/JournalDetail';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('pgj_theme');
      return saved === 'dark' || saved === 'light' ? saved : 'light';
    } catch {
      return 'light';
    }
  });

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('pgj_theme', theme);
    } catch (e) {
      console.warn('Could not save theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth subscription
  useEffect(() => {
    const unsubscribe = subscribeToAuth((activeUser) => {
      setUser(activeUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch journals whenever active user changes
  const loadJournals = useCallback(async (uid: string) => {
    setLoadingJournals(true);
    try {
      const data = await fetchUserJournals(uid);
      setJournals(data);
    } catch (err) {
      console.error('Failed to load journals:', err);
    } finally {
      setLoadingJournals(false);
    }
  }, []);

  useEffect(() => {
    if (user?.uid) {
      loadJournals(user.uid);
    } else {
      setJournals([]);
      setSelectedJournal(null);
      setViewMode('dashboard');
    }
  }, [user?.uid, loadJournals]);

  // Actions
  const handleSelectJournal = (journal: JournalEntry) => {
    setSelectedJournal(journal);
    setViewMode('detail');
  };

  const handleNewJournal = () => {
    setSelectedJournal(null);
    setViewMode('new_chat');
  };

  const handleJournalSaved = (saved: JournalEntry) => {
    setSelectedJournal(saved);
    if (user?.uid) {
      loadJournals(user.uid);
    }
    setViewMode('detail');
  };

  const handleDeleteJournal = async (journalId: string) => {
    if (!user?.uid) return;
    try {
      await deleteUserJournal(user.uid, journalId);
      if (selectedJournal?.id === journalId) {
        setSelectedJournal(null);
        setViewMode('dashboard');
      }
      loadJournals(user.uid);
    } catch (err) {
      console.error('Failed to delete journal:', err);
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setSelectedJournal(null);
    setViewMode('dashboard');
  };

  const handleSwitchUser = async (name: string, email: string) => {
    await loginAsCustomUser(name, email);
    setSelectedJournal(null);
    setViewMode('dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium tracking-wide text-stone-500 dark:text-stone-400">
            Loading Personal Gemini Journal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Header
        user={user}
        currentView={viewMode}
        onNavigate={(view) => {
          if (view === 'dashboard') setSelectedJournal(null);
          setViewMode(view);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
        onSwitchUser={handleSwitchUser}
      />

      <main className="flex-1 flex flex-col">
        {!user ? (
          <AuthScreen onSuccess={() => setViewMode('dashboard')} />
        ) : (
          <>
            {viewMode === 'dashboard' && (
              <JournalDashboard
                user={user}
                journals={journals}
                loading={loadingJournals}
                onSelectJournal={handleSelectJournal}
                onNewJournal={handleNewJournal}
                onDeleteJournal={handleDeleteJournal}
              />
            )}

            {viewMode === 'new_chat' && (
              <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6">
                <JournalChat
                  user={user}
                  onCancel={() => setViewMode('dashboard')}
                  onJournalSaved={handleJournalSaved}
                />
              </div>
            )}

            {viewMode === 'detail' && selectedJournal && (
              <JournalDetail
                journal={selectedJournal}
                user={user}
                onBack={() => {
                  setSelectedJournal(null);
                  setViewMode('dashboard');
                }}
                onDelete={handleDeleteJournal}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800/80 py-4 px-6 text-center text-xs text-stone-500 dark:text-stone-400 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Strict per-user data isolation under users/{`{uid}`}/journals & protected server-side secrets</span>
          </div>
          <div className="text-stone-400 dark:text-stone-500">
            Gen AI Academy APAC Ideathon
          </div>
        </div>
      </footer>
    </div>
  );
}
