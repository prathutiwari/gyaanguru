# 🧠 GyaanGuru - AI Chatbot

A full-stack AI-powered chatbot web application built with Node.js and Express, featuring real-time conversations powered by Groq's Llama 3.3 70B model. Includes voice input/output, chat history, chat summaries, theme switching, and many more features!

![GyaanGuru](https://img.shields.io/badge/GyaanGuru-AI%20Chatbot-667eea?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3-orange?style=flat-square)

---

## 🎯 What This Project Does

GyaanGuru is an intelligent AI chatbot that:
- **Answers questions** on any topic using advanced AI (Llama 3.3 70B model)
- **Remembers context** within a conversation for natural follow-up discussions
- **Supports voice input** - speak instead of typing, with auto-send feature
- **AI voice output** - listen to responses with text-to-speech
- **Saves chat history** so you can revisit past conversations
- **Generates chat summaries** - one-click summary with export option
- **Works offline-ready** - stores data locally in your browser
- **Looks beautiful** with a modern gradient purple theme and smooth animations

---

## ✨ Features Overview

### 🤖 AI & Chat Features

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **AI-Powered Responses** | Get intelligent answers using Groq's Llama 3.3 70B model | Messages sent to Groq API, AI processes and responds |
| **Token Usage Tracker** | Shows tokens used and response time for each message | Displays below bot responses (e.g., "342 tokens • 410ms") |
| **Session Context** | Bot remembers your conversation history | Each chat session maintains context for coherent follow-ups |
| **Typing Indicator** | Animated dots show when bot is thinking | Visual feedback while waiting for AI response |
| **Copy Response** | Copy bot's response to clipboard with one click | Copy button appears on hover, shows checkmark when copied |
| **Personalized Greeting** | Welcomes with "Namaste!" and asks your name | Custom system prompt creates friendly experience |
| **Developer Attribution** | Ask "Who developed you?" for creator info | System prompt includes Prathu Tripathi as developer |

### 🎤 Voice Input Feature

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Voice to Text** | Speak instead of typing | Uses Web Speech API for speech recognition |
| **Auto-Detect Language** | Automatically detects spoken words | Speech recognition with interim results |
| **Auto-Send** | Message automatically sends after speaking | 500ms delay after final transcript, then sends |
| **Visual Feedback** | Animated waves and pulsing button while listening | CSS animations on the mic button |
| **Click to Toggle** | Click mic to start/stop listening | Single button controls voice input |

### 🔊 Voice Output Feature

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Text-to-Speech** | AI reads responses aloud | Uses Web Speech Synthesis API |
| **Per-Message Speak** | Click speaker icon on any bot message | Button appears on hover, click to play/stop |
| **Auto Voice Mode** | Enable to auto-speak all AI responses | Toggle in header (speaker icon) |
| **Stop Playback** | Click again to stop speaking | Button changes to stop icon while playing |
| **Voice Persistence** | Remembers auto-voice preference | Saved to localStorage |

### ✏️ Message Editing

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Edit Last Message** | Modify your last sent message | Pencil icon appears on hover of last user message |
| **Auto-Remove Response** | Original response deleted when editing | Clears both user message and bot reply |
| **Resend Edited** | Edit in input field and send again | Message populates input, ready to modify |

### 💬 Chat History Management

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Save History** | Automatically saves up to 10 recent chats | Stored in browser's localStorage |
| **View History** | Click history icon to see past conversations | In-place view replaces chat area |
| **Load Chat** | Click any history item to continue that conversation | Restores messages and session context |
| **Export Chat** | Download chat as a text file | Creates .txt file with timestamps and messages |
| **Delete Chat** | Remove individual chats from history | Hover on history item → click trash icon |
| **Clear All** | Delete all chat history at once | Confirmation dialog before clearing |

### 📋 Chat Summary Feature

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Generate Summary** | One-click summary of current conversation | Click document icon in header |
| **View Stats** | See message counts and conversation metrics | Shows total, user, and bot message counts |
| **Topics Extracted** | Auto-extracts discussion topics | Lists topics from your messages |
| **Conversation Preview** | See full chat in compact view | Scrollable preview of all messages |
| **Export Summary** | Download summary as text file | Creates .txt with stats, topics, full conversation |
| **Copy Summary** | Copy summary to clipboard | Copies concise summary with stats and topics |

### 🌓 Theme & UI Features

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Light/Dark Mode** | Toggle between light and dark themes | CSS variables switch on button click |
| **Theme Persistence** | Remembers your theme preference | Saved to localStorage, applied on page load |
| **Online/Offline Status** | Shows user activity status | Green "Online" when typing, red "Offline" after 1 min idle |
| **Real-Time Timestamps** | Shows actual device time on messages | JavaScript Date API formats local time |
| **Responsive Design** | Works on desktop and mobile | Flexible CSS with media queries |
| **GG Branding** | Custom logo and gradient purple theme | Styled header with bot avatar |
| **Smooth Animations** | Typing indicator, button hovers, transitions | CSS keyframes and transitions |

### 🔒 Security Features

| Feature | Description | How It Works |
|---------|-------------|--------------|
| **Rate Limiting** | Protects API from abuse | 100 requests per 15 minutes per IP |
| **Error Handling** | Graceful error responses | Returns friendly messages on failures |
| **Environment Variables** | Secure API key storage | Keys stored in .env (not in git) |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Server runtime environment |
| **Express.js** | Web server framework |
| **Groq SDK** | AI model integration (Llama 3.3 70B) |
| **HTML5** | Page structure |
| **CSS3** | Styling, animations, theming |
| **Vanilla JavaScript** | Frontend logic, API calls |
| **Web Speech API** | Voice recognition (input) |
| **Speech Synthesis API** | Text-to-speech (output) |
| **localStorage** | Client-side data persistence |
| **dotenv** | Environment variable management |
| **express-rate-limit** | API rate limiting protection |

---

## 📁 Project Structure

```
gyaanguru-chatbot/
├── server.js          # Express server + Groq AI integration
├── package.json       # Project dependencies & scripts
├── .env               # API key configuration (not in git)
├── .gitignore         # Excludes node_modules, .env
├── README.md          # Project documentation
└── public/
    ├── index.html     # Chat UI structure
    ├── styles.css     # Styling, themes & animations
    └── app.js         # Frontend logic, voice, history
```

### File Details

| File | Description |
|------|-------------|
| `server.js` | Express server, Groq AI setup, system prompt, API endpoint |
| `index.html` | Chat container, header, history view, input area, footer |
| `styles.css` | CSS variables, themes, animations, responsive styles |
| `app.js` | Message handling, voice recognition, history, themes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** installed ([download](https://nodejs.org))
- **Groq API key** (free at [console.groq.com](https://console.groq.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/gyaanguru-chatbot.git
cd gyaanguru-chatbot

# 2. Install dependencies
npm install

# 3. Create .env file with your API key
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# 4. Start the server
npm start

# 5. Open in browser
# http://localhost:3000
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=gsk_your_api_key_here
PORT=3000
```

### Getting a Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into your `.env` file

> **Note:** Groq's free tier is generous and doesn't require a credit card!

---

## 🎮 How to Use

### Basic Chat
1. Type your message in the input field
2. Press Enter or click the send button
3. Wait for GyaanGuru's response

### Copy Bot Response
1. Hover over any bot message
2. Click the copy icon 📋 (appears on right)
3. Response copied to clipboard
4. Checkmark ✓ confirms successful copy

### Voice Input
1. Click the microphone button 🎤
2. Speak your message clearly
3. Message automatically appears in input
4. Auto-sends after you stop speaking
5. Click mic again to cancel

### Voice Output (AI Speaking)
1. **Per-message:** Hover over a bot response → click speaker 🔊 icon
2. **Auto-speak all:** Click speaker icon in header to enable
3. When enabled, all new AI responses are read aloud
4. Click speaker again on message to stop playback
5. Your preference is saved automatically

### Edit Last Message
1. Hover over your last sent message
2. Click the pencil icon ✏️ (appears on left)
3. Edit the text in the input field
4. Press Enter to send the updated message

### Chat History
1. Click the history icon 🕐 in header
2. View your past conversations
3. Click any chat to load it
4. Hover for export/delete options
5. Click "Back" to return to chat

### Chat Summary
1. Click the document icon 📋 in header
2. View conversation statistics (message counts)
3. See extracted topics from your messages
4. Browse the full conversation preview
5. Click "Export Summary" to download as text file
6. Click "Copy Summary" to copy to clipboard
7. Click X or outside modal to close

### Theme Toggle
1. Click the sun/moon icon ☀️/🌙
2. Theme switches between light and dark
3. Your preference is saved automatically

---

## 🔑 API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves the chat interface |
| `/api/chat` | POST | Sends message, returns AI response |

### POST /api/chat

**Request:**
```json
{
  "message": "What is the capital of France?",
  "sessionId": "session_abc123xyz"
}
```

**Response:**
```json
{
  "response": "The capital of France is Paris! 🗼 It's known as the City of Light..."
}
```

---

## 🧪 Testing

### Test Commands

```bash
# Run all tests
npm test

# Run only server/API tests
npm run test:server

# Run only frontend tests
npm run test:frontend

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

| Category | Tests | Description |
|----------|-------|-------------|
| **API Endpoint** | 5 | Basic request/response, validation |
| **Session Management** | 4 | Session IDs, context retention |
| **Token Info** | 1 | Token usage tracking |
| **Static Files** | 3 | HTML, CSS, JS serving |
| **Error Handling** | 3 | Malformed input, 404s, long messages |
| **Rate Limiting** | 2 | Headers, request limits |
| **Content Types** | 2 | JSON handling |
| **Special Characters** | 3 | Emojis, Unicode, HTML entities |
| **Developer Attribution** | 1 | Creator info response |
| **LocalStorage** | 5 | Theme, history, preferences |
| **Theme Handling** | 3 | Light/dark mode |
| **Message Handling** | 3 | Message objects, timestamps |
| **Session IDs** | 2 | Generation, uniqueness |
| **Chat History** | 4 | CRUD operations |
| **Chat Summary** | 6 | Stats calculation |
| **HTML Escaping** | 4 | XSS prevention |
| **Online/Offline** | 4 | Status tracking, timeouts |
| **Voice Output** | 3 | Preferences, toggle |
| **Export** | 3 | Text formatting, filenames |
| **Clipboard** | 2 | Copy functionality |
| **Input Validation** | 3 | Trim, empty check |

**Total: 66 tests**

---

## 🌐 Deployment

### Deploy to Render (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variable: `GROQ_API_KEY`
7. Click "Deploy"

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add `GROQ_API_KEY` in the Variables tab
5. Railway auto-deploys on every push

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Add `GROQ_API_KEY` in Vercel dashboard
4. Deploy!

---

## 🎯 How It Works (Technical Flow)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Frontend  │────▶│   Backend   │
│  (Browser)  │     │  (app.js)   │     │ (server.js) │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │  1. Type/Speak    │                    │
      │  message          │                    │
      │                   │  2. POST /api/chat │
      │                   │───────────────────▶│
      │                   │                    │  3. Send to
      │                   │                    │     Groq API
      │                   │                    │        │
      │                   │                    │◀───────┘
      │                   │  4. Return response│  AI Response
      │                   │◀───────────────────│
      │  5. Display       │                    │
      │     message       │                    │
      │◀──────────────────│                    │
      │                   │                    │
      │  6. Save to       │                    │
      │     localStorage  │                    │
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/awesome-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add awesome feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/awesome-feature
   ```
5. **Open** a Pull Request

### Ideas for Contributions
- [ ] Add more languages for voice recognition
- [ ] Implement text-to-speech for bot responses
- [ ] Add emoji picker
- [ ] Create mobile app version
- [ ] Add code syntax highlighting in responses

---

## 📄 License

This project is licensed under the **MIT License** - free to use, modify, and distribute.

---

## 👨‍💻 Developer

**Prathu Tripathi**

Built with ❤️ and lots of ☕

---

## ⭐ Support

If you found this project helpful:
- Give it a ⭐ star on GitHub
- Share it with others
- Report bugs or suggest features

---

*Made with passion by Prathu Tripathi* 💻
