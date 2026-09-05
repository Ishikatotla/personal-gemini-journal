import { Sparkles, Sun, Moon, LogOut, BookOpen, PlusCircle, ShieldCheck, Users } from 'lucide-react';
import { UserProfile, ViewMode } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSignOut: () => void;
  onSwitchUser?: (name: string, email: string) => void;
}

export default function Header({
  user,
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  onSignOut,
  onSwitchUser,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 text-left group transition"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100">
                Personal Gemini Journal
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                Ideathon
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              Secure Reflection & Brainstorming Powered by Gemini
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <>
              {/* Navigation CTAs */}
              <button
                id="header-nav-dashboard"
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                  currentView === 'dashboard'
                    ? 'bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Journals</span>
              </button>

              <button
                id="header-nav-new"
                onClick={() => onNavigate('new_chat')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Journal</span>
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button
            id="header-theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 transition"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          {/* Authenticated User Menu */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2" title={`Signed in as ${user.displayName} (${user.email})`}>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600/20 text-amber-700 dark:text-amber-300 font-medium text-xs flex items-center justify-center border border-amber-600/30">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium text-stone-800 dark:text-stone-200 leading-tight truncate max-w-[120px]">
                    {user.displayName}
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Demo user switcher tool to verify isolation */}
              {onSwitchUser && (
                <button
                  onClick={() => {
                    const isUser1 = user.email?.includes('alex') || false;
                    if (isUser1) {
                      onSwitchUser('Priya Sharma', 'priya.sharma@apac-ideathon.dev');
                    } else {
                      onSwitchUser('Alex Chen', 'alex.chen@apac-ideathon.dev');
                    }
                  }}
                  title="Switch test user to verify strict per-user data isolation"
                  className="hidden sm:flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                >
                  <Users className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>Switch User</span>
                </button>
              )}

              {/* Sign out */}
              <button
                id="header-signout-btn"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
