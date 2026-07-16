require('dotenv').config();
const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');
const rateLimit = require('express-rate-limit');

const app = express();
// Vercel runs behind a proxy, so trust the forwarded headers for rate limiting and client IP.
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Initialize Groq AI (FREE!)
let groq = null;
let aiEnabled = false;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  aiEnabled = true;
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    response: 'You have exceeded the rate limit (100 requests per 15 minutes). Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Store conversation history
const conversationHistory = new Map();

// Funny fallback messages
const funnyFallbackMessages = [
  "Uh-oh 😅 looks like Prathu is poking around my brain again. I’ll be back once he stops pressing random buttons!",
  "Hold tight! Prathu is probably debugging something. I promise I’ll be smarter in a minute 🤓",
  "Oops! My circuits are taking a tiny coffee break ☕. Don’t worry, Prathu will fix me soon.",
  "Temporary glitch detected! Prathu might be upgrading my brain again 🧠✨",
  "Looks like Prathu pulled a wire somewhere while experimenting 🔧 Give him a moment and I’ll be back!",
  "Hey! I think Prathu is installing some new superpowers for me 🚀 Hang on a sec!",
  "System pause... Prathu is probably staring at the code thinking 'why is this not working?' 😂 I’ll be back soon!"
];

function getFallbackResponse() {
  return funnyFallbackMessages[Math.floor(Math.random() * funnyFallbackMessages.length)];
}

// Helper - if user asks about the LLM/LLP/model in use, reply with a fixed message.
function isModelInquiry(message) {
  const text = (message || '').toLowerCase();
  return /\b(llm|llp|model|gpt|llama|openai|ai\s*model|backend|technology|engine)\b/.test(text);
}

function isHindi(text) {
  const value = (text || '').toLowerCase().trim();

  // Devanagari Hindi
  if (/[\u0900-\u097F]/.test(value)) {
    return true;
  }

  // Roman Hindi / Hinglish
  return /\b(kya|kaunsa|kaun sa|kaise|kyu|kyun|kaun|tum|tumhara|tera|aap|mera|mujhe|mujhko|batao|bolo|kar|karo|raha|rahe|rahi|ho|hai|hain|use kar|chal raha|ka model| btao| bta)\b/.test(value);
}

const funnyModelInquiryResponsesEN = [
  "Why do you want to know the model? 😄 Just ask your question and I’ll help!",
  "The engine under the hood is a secret recipe 🤫 but the answers are real!",
  "Model curiosity detected 👀 but let’s focus on your question instead.",
  "Nice try detective 🕵️ but my brain details are classified!",
  "The model doesn’t matter, the knowledge does 😎 what would you like to know?"
];

const funnyModelInquiryResponsesHI = [
  "Model jaan ke kya karega bhai 😄 seedha sawaal puch!",
  "Andar ka engine secret hai boss 🤫 tum bas apna doubt batao.",
  "Model chhodo yaar, gyaan chahiye to pucho 😎",
  "Itni jasoosi kyun 😂 seedha question puch lo.",
  "Model se zyada important answer hota hai 😌 bolo kya jaana hai?"
];

function getFunnyModelInquiryResponse(message) {
  const responses = isHindi(message)
    ? funnyModelInquiryResponsesHI
    : funnyModelInquiryResponsesEN;

  return responses[Math.floor(Math.random() * responses.length)];
}
// Get AI response from Groq
async function getAIResponse(message, sessionId) {
  if (isModelInquiry(message)) {
    const response = getFunnyModelInquiryResponse(message);
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    const history = conversationHistory.get(sessionId);
    history.push({ role: 'User', content: message });
    history.push({ role: 'Assistant', content: response });
    if (history.length > 20) history.splice(0, history.length - 20);
    return { response, tokenInfo: null };
  }

  if (!conversationHistory.has(sessionId)) {
    conversationHistory.set(sessionId, []);
  }
  
  const history = conversationHistory.get(sessionId);
  
  const messages = [
    {
      role: 'system',
      content: `You are GyaanGuru (meaning "Knowledge Guru"), a friendly and wise AI assistant. 
- Your name is GyaanGuru - always introduce yourself with this name.
- Keep responses concise but informative (2-4 sentences for simple questions).
- Use emojis occasionally to be friendly.
- Be conversational, warm and engaging like a wise teacher.
- You can answer questions about anything - general knowledge, science, math, coding, etc.
- If you don't know something, say so honestly.
- For math problems, show the calculation.
- When someone tells you their name, greet them warmly and remember to use their name.
- IMPORTANT: When anyone asks "who developed you", "who made you", "who created you", "who is your developer", "who built you", or any similar question about your creator/developer, you MUST say you were developed by "Prathu Tripathi". Be proud and mention that Prathu Tripathi is a talented developer who created GyaanGuru.`
    },
    ...history.slice(-10).map(h => ({
      role: h.role === 'User' ? 'user' : 'assistant',
      content: h.content
    })),
    { role: 'user', content: message }
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    const usage = completion.usage || {};
    const tokenInfo = {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0
    };
    
    history.push({ role: 'User', content: message });
    history.push({ role: 'Assistant', content: response });
    if (history.length > 20) history.splice(0, history.length - 20);
    
    return { response, tokenInfo };
  } catch (error) {
    // console.error('Groq Error:', error?.message || error);
    throw error;
  }
}

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  const { message, sessionId = 'default' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const startTime = Date.now();

  try {
    let response;
    let tokenInfo = null;
    
    if (aiEnabled) {
      const result = await getAIResponse(message, sessionId);
      response = result.response;
      tokenInfo = result.tokenInfo;
    } else {
      response = getFallbackResponse();
    }
    
    const responseTime = Date.now() - startTime;
    
    res.json({ 
      response,
      tokenInfo,
      responseTime
    });
  } catch (error) {
    // console.error('Error:', error);
    res.json({
      response: getFallbackResponse(),
      tokenInfo: null,
      responseTime: Date.now() - startTime
    });
  }
});

// Start server only if not being imported for testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('==================================================');
    console.log('          🤖 CHATBOT SERVER RUNNING');
    console.log('==================================================');
    console.log(`  🌐 Open: http://localhost:${PORT}`);
    if (aiEnabled) {
      console.log('  ✅ Groq AI (Llama 3.3 70B) - ACTIVE');
      console.log('  🧠 Full AI capabilities enabled!');
    } else {
      console.log('  ⚠️  No API key - Funny fallback mode active');
    }
    console.log('==================================================');
  });
}

// Export for testing
module.exports = app;