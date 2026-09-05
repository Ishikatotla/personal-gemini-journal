import { useState } from 'react';
import { Sparkles, ShieldCheck, Lock, BrainCircuit, ArrowRight, UserCheck } from 'lucide-react';
import { loginWithGoogle, loginAsCustomUser } from '../lib/firebase';

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError('Could not complete Google Sign-In. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonaSignIn = async (name: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      await loginAsCustomUser(name, email);
      onSuccess();
    } catch (err: any) {
      console.error('Persona sign in error:', err);
      setError('Could not sign in as test persona.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Personal Gemini Journal
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            A private space for multi-turn reflective dialogue, brainstorming, and automated mood & reflection insights.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="space-y-1 text-center">
            <h2 className="text-base font-semibold text-stone-800 dark:text-stone-200">
              Welcome to Your Journal
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Sign in with your Google account to access your isolated journal space.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
              {error}
            </div>
          )}

          {/* Primary Google Sign In Button */}
          <button
            id="auth-google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-11 px-4 rounded-xl font-medium text-sm text-stone-800 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 active:bg-stone-300 transition flex items-center justify-center gap-3 border border-stone-300/80 dark:border-stone-700 disabled:opacity-50 shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          {/* Test Persona Switcher for APAC Ideathon Evaluation */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>APAC Ideathon Evaluation Personas:</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              Sign in as different users to verify strict per-user data isolation:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handlePersonaSignIn('Alex Chen', 'alex.chen@apac-ideathon.dev')}
                disabled={loading}
                className="px-2.5 py-2 text-left rounded-lg text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition group"
              >
                <div className="font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-between">
                  <span>Alex Chen</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-stone-400 truncate">Product Manager</div>
              </button>
              <button
                type="button"
                onClick={() => handlePersonaSignIn('Priya Sharma', 'priya.sharma@apac-ideathon.dev')}
                disabled={loading}
                className="px-2.5 py-2 text-left rounded-lg text-xs bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition group"
              >
                <div className="font-semibold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center justify-between">
                  <span>Priya Sharma</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-stone-400 truncate">AI Researcher</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 space-y-1">
            <Lock className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400" />
            <div className="text-[11px] font-medium text-stone-800 dark:text-stone-200">Per-User Isolated</div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">Strict path boundary</div>
          </div>
          <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 space-y-1">
            <ShieldCheck className="w-4 h-4 mx-auto text-amber-600 dark:text-amber-400" />
            <div className="text-[11px] font-medium text-stone-800 dark:text-stone-200">Protected Keys</div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">Server-side secrets only</div>
          </div>
          <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-800/80 space-y-1">
            <BrainCircuit className="w-4 h-4 mx-auto text-sky-600 dark:text-sky-400" />
            <div className="text-[11px] font-medium text-stone-800 dark:text-stone-200">Gemini 2.5 Flash</div>
            <div className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">Multi-turn reflection</div>
          </div>
        </div>
      </div>
    </div>
  );
}
