import { useState } from 'react';
import { ArrowLeft, Calendar, Heart, Tag, HelpCircle, Footprints, MessageSquare, Trash2, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';

interface JournalDetailProps {
  journal: JournalEntry;
  user: UserProfile;
  onBack: () => void;
  onDelete: (journalId: string) => void;
}

export default function JournalDetail({
  journal,
  user,
  onBack,
  onDelete,
}: JournalDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(true);

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journals</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>users/{user.uid.substring(0, 8)}...</span>
          </div>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-xs flex items-center gap-1.5"
            title="Delete this journal"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Main Journal Card */}
      <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Title & Metadata Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(journal.createdAt).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </span>

            {journal.mood && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5">
                <Heart className="w-3 h-3" />
                <span>{journal.mood}</span>
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {journal.title}
          </h1>

          {/* Theme Badges */}
          {journal.themes && journal.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {journal.themes.map((theme, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-1.5"
                >
                  <Tag className="w-3 h-3 text-amber-500" />
                  <span>{theme}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Executive Summary Callout */}
        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Summary</span>
          </div>
          <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
            {journal.summary}
          </p>
        </div>

        {/* Original Feature: Mood & Reflection Insights */}
        {(journal.reflectionQuestion || journal.nextStep || journal.mood) && (
          <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200/70 dark:border-stone-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Mood & Reflection Insights
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    AI-generated synthesis for personal contemplation
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reflective Question */}
              {journal.reflectionQuestion && (
                <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Reflection Question</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 italic font-serif leading-relaxed">
                    "{journal.reflectionQuestion}"
                  </p>
                </div>
              )}

              {/* Actionable Next Step */}
              {journal.nextStep && (
                <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Practical Next Step</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                    {journal.nextStep}
                  </p>
                </div>
              )}
            </div>

            {/* AI Disclaimer */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-stone-400 dark:text-stone-500">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-400" />
              <span>
                These insights are AI-generated reflective prompts for personal journaling and brainstorming. They are not medical, psychological, or professional diagnoses.
              </span>
            </div>
          </div>
        )}

        {/* Conversation Transcript Section */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFullTranscript(!showFullTranscript)}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>
                Full Conversation History ({journal.messages?.length || 0} turns)
              </span>
              <span className="text-[11px] font-normal text-stone-400">
                {showFullTranscript ? '(Click to collapse)' : '(Click to expand)'}
              </span>
            </button>
          </div>

          {showFullTranscript && (
            <div className="space-y-3 pt-2">
              {journal.messages?.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-amber-500/10 dark:bg-amber-950/20 text-stone-900 dark:text-stone-100 border border-amber-500/20 ml-6'
                        : 'bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800 mr-6'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                      <span>{isUser ? user.displayName || 'You' : 'Gemini Companion'}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-xl space-y-4">
            <div className="space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-stone-900 dark:text-stone-100">Delete this journal?</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Are you sure you want to delete "{journal.title}"? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-9 rounded-xl text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(journal.id);
                  setShowDeleteConfirm(false);
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
