import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please set it in AI Studio Secrets.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Multi-turn Gemini Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userMessage } = req.body;

    if (!userMessage && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'User message or conversation history is required.' });
    }

    const ai = getAiClient();

    // Construct conversation contents
    const contents: any[] = [];

    // System instruction for personal journaling & brainstorming
    const systemInstruction = `You are a thoughtful, empathetic, and insightful journaling companion and brainstorming partner named Gemini Journal Companion.
Your purpose:
1. Help the user reflect deeply, unpack emotions, clarify priorities, brainstorm creative ideas, and explore life experiences.
2. Ask one gentle, thought-provoking question to deepen their reflection where appropriate.
3. Validate their feelings with genuine compassion while maintaining a calm, encouraging, and supportive presence.
4. Keep your responses concise (2 to 4 paragraphs maximum), clean, and conversational. Avoid clinical, medical, or diagnostic language.`;

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (msg.role === 'user') {
          contents.push({
            role: 'user',
            parts: [{ text: String(msg.content) }],
          });
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          contents.push({
            role: 'model',
            parts: [{ text: String(msg.content) }],
          });
        }
      }
    }

    if (userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: String(userMessage) }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const replyText = response.text || 'I am here listening and reflecting with you. Please continue sharing your thoughts.';

    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    const isMissingKey = error?.message?.includes('GEMINI_API_KEY');
    return res.status(500).json({
      error: isMissingKey
        ? 'Gemini API key is not configured in Secrets. Please add GEMINI_API_KEY.'
        : 'Failed to generate response from Gemini. Please try again.',
    });
  }
});

// Automatic Conversation Summarization & Mood/Reflection Insights Endpoint
app.post('/api/summarize-and-insights', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Conversation messages are required for summarization.' });
    }

    const ai = getAiClient();

    // Prepare conversation text for analysis
    const transcript = messages
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Gemini'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Analyze this personal journaling conversation between a User and their journaling companion:

--- TRANSCRIPT START ---
${transcript}
--- TRANSCRIPT END ---

Generate a JSON object containing:
1. "title": A meaningful, evocative title for this journal entry (3 to 6 words).
2. "summary": A concise executive summary of the conversation capturing the core insights, feelings, or ideas explored (2 to 3 sentences).
3. "mood": The overall emotional tone or mood (e.g., "Reflective & Grounded", "Creative Spark", "Introspective", "Calm & Centered", "Hopeful & Determined", "Pensive", "Re-energized").
4. "themes": An array of 2 to 3 key themes/tags (e.g. ["Career Focus", "Mindfulness", "Creativity"]).
5. "reflectionQuestion": One deep, open-ended question for the user to reflect on as they close this session.
6. "nextStep": One gentle, practical, actionable next step or micro-habit they can take today.

CRITICAL: Return ONLY raw JSON without markdown code blocks, formatting, or commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    let jsonText = response.text?.trim() || '{}';
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    return res.json({
      title: parsed.title || 'Personal Journal Entry',
      summary: parsed.summary || 'A reflective conversation exploring thoughts, priorities, and creative ideas.',
      mood: parsed.mood || 'Reflective & Thoughtful',
      themes: Array.isArray(parsed.themes) ? parsed.themes : ['Journaling', 'Reflection'],
      reflectionQuestion: parsed.reflectionQuestion || 'What is one thing you learned about yourself today?',
      nextStep: parsed.nextStep || 'Take five minutes to breathe and appreciate your progress.',
    });
  } catch (error: any) {
    console.error('Error in /api/summarize-and-insights:', error?.message || error);
    // Provide a safe, helpful fallback summary if Gemini API is temporarily unavailable
    return res.json({
      title: 'Reflective Journal Entry',
      summary: 'A session dedicated to personal reflections, exploring key thoughts and perspectives.',
      mood: 'Thoughtful',
      themes: ['Reflection', 'Personal Growth'],
      reflectionQuestion: 'How can you apply the insights from this conversation to tomorrow?',
      nextStep: 'Acknowledge your progress and write down any additional thoughts.',
    });
  }
});

// Setup Vite or Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Personal Gemini Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
