require('dotenv').config();
const express = require('express');
const path = require('path');
const Groq = require('groq-sdk');
const rateLimit = require('express-rate-limit');

const app = express();
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
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Store conversation history
const conversationHistory = new Map();

// Get AI response from Groq
async function getAIResponse(message, sessionId) {
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
    
    // Extract token usage
    const usage = completion.usage || {};
    const tokenInfo = {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0
    };
    
    // Save to history
    history.push({ role: 'User', content: message });
    history.push({ role: 'Assistant', content: response });
    if (history.length > 20) history.splice(0, history.length - 20);
    
    return { response, tokenInfo };
  } catch (error) {
    console.error('Groq Error:', error.message);
    throw error;
  }
}

// Fallback response when no API key
function getFallbackResponse(message) {
  return "I need an AI API key to answer this! Get your FREE Groq API key at: https://console.groq.com (no credit card needed!)";
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
      response = getFallbackResponse(message);
    }
    
    const responseTime = Date.now() - startTime;
    
    res.json({ 
      response,
      tokenInfo,
      responseTime
    });
  } catch (error) {
    console.error('Error:', error);
    res.json({ response: "Sorry, something went wrong. Please try again!" });
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
      console.log('  ⚠️  No API key - Add GROQ_API_KEY to .env');
      console.log('  💡 Get FREE key: https://console.groq.com');
    }
    console.log('==================================================');
  });
}

// Export for testing
module.exports = app;
