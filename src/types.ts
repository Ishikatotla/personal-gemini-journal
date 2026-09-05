export interface JournalMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface JournalInsights {
  mood?: string;
  themes?: string[];
  reflectionQuestion?: string;
  nextStep?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  summary: string;
  messages: JournalMessage[];
  createdAt: string;
  updatedAt?: string;
  ownerUid: string;
  mood?: string;
  themes?: string[];
  reflectionQuestion?: string;
  nextStep?: string;
}

export type ViewMode = 'dashboard' | 'new_chat' | 'detail';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
