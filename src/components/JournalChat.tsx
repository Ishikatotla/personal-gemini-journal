import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Sparkles, Send, CheckCircle2, ArrowLeft, Loader2, Compass, Lightbulb, HeartHandshake } from 'lucide-react';
import { UserProfile, JournalEntry, JournalMessage } from '../types';
import { saveUserJournal } from '../lib/firebase';

interface JournalChatProps {
  user: UserProfile;
  onCancel: () => void;
  onJournalSaved: (journal: JournalEntry) => void;
}

const STARTER_PROMPTS = [
  {
    icon: Compass,
    title: 'Reflect on this week',
    text: 'I want to reflect on what went well this past week and one major challenge I navigated.',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm an APAC project',
    text: 'Let us brainstorm an innovative Gen AI idea for sustainable energy and daily human well-being.',
  },
  {
    icon: HeartHandshake,
    title: 'Unpack an emotion',
    text: 'I have been feeling torn between two major commitments and want to sort through my thoughts.',
  },
];

export default function JournalChat({ user, onCancel, onJournalSaved }: JournalChatProps) {
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isSummarizing]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending || isSummarizing) return;

    setError(null);
    const userMsg: JournalMessage = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response from Gemini.');
      }

      const data = await res.json();
      const assistantMsg: JournalMessage = {
        id: 'msg_' + Date.now() + '_assistant',
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Error communicating with Gemini. Please try again.');
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSaveAndEnd = async () => {
    if (messages.length === 0 || isSummarizing) return;

    setIsSummarizing(true);
    setError(null);

    try {
      // Step 1: Request Gemini automatic summary & mood/reflection insights
      const res = await fetch('/api/summarize-and-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const analysis = await res.json().catch(() => ({
        title: 'Personal Journal Entry',
        summary: 'A session exploring thoughts, goals, and reflections.',
        mood: 'Reflective',
        themes: ['Reflection'],
        reflectionQuestion: 'How does this conversation inform your next decision?',
        nextStep: 'Take a moment to pause and digest your learnings.',
      }));

      // Step 2: Save directly under user's isolated path: users/{uid}/journals/{journalId}
      const journalId = 'jnl_' + Date.now();
      const savedEntry = await saveUserJournal(user.uid, {
        id: journalId,
        title: analysis.title || 'Personal Journal Entry',
        summary: analysis.summary || 'Summary of journal reflection.',
        messages,
        createdAt: new Date().toISOString(),
        mood: analysis.mood,
        themes: analysis.themes,
        reflectionQuestion: analysis.reflectionQuestion,
        nextStep: analysis.nextStep,
      });

      onJournalSaved(savedEntry);
    } catch (err: any) {
      console.error('Summarization & save error:', err);
      setError('Could not complete journal save. Please try again.');
      setIsSummarizing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Top Session Bar */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Active Reflection Session</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {messages.length} {messages.length === 1 ? 'exchange' : 'exchanges'} • Context preserved
            </p>
          </div>
        </div>

        {/* End & Save Action */}
        <button
          id="journal-end-save-btn"
          onClick={handleSaveAndEnd}
          disabled={messages.length === 0 || isSummarizing || isSending}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white disabled:opacity-40 disabled:pointer-events-none transition shadow-sm"
        >
          {isSummarizing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing & Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>End & Save Journal</span>
            </>
          )}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6 py-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-200">
                What is on your mind today?
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Gemini will listen, ask gentle clarifying questions, and help you reflect. When you are finished, click "End & Save Journal" to automatically generate summaries and insights.
              </p>
            </div>

            {/* Starter Suggestions */}
            <div className="w-full space-y-2 text-left">
              <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                Suggested Starters
              </span>
              <div className="space-y-2">
                {STARTER_PROMPTS.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="w-full p-3 rounded-xl text-xs bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800/80 hover:border-amber-500/40 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition flex items-start gap-3 text-stone-700 dark:text-stone-300 text-left group"
                    >
                      <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-900 dark:text-stone-100">{prompt.title}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">{prompt.text}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-sm shadow-sm'
                      : 'bg-stone-100 dark:bg-stone-800/90 text-stone-800 dark:text-stone-100 rounded-tl-sm border border-stone-200/80 dark:border-stone-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`mt-2 text-[10px] ${
                      isUser ? 'text-amber-200 text-right' : 'text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-stone-300 dark:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-sm p-4 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1">Gemini is reflecting...</span>
            </div>
          </div>
        )}

        {isSummarizing && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600 shrink-0" />
            <div>
              <div className="font-semibold">Synthesizing Journal Summary & Mood Insights...</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Analyzing key themes, drafting reflection prompts, and isolating record under users/{user.uid}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            id="journal-chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what is on your mind... (Shift + Enter for new line)"
            rows={2}
            disabled={isSending || isSummarizing}
            className="flex-1 resize-none rounded-xl p-3 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition disabled:opacity-50"
          />

          <button
            type="submit"
            id="journal-chat-send-btn"
            disabled={!inputText.trim() || isSending || isSummarizing}
            className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 px-1">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
}
