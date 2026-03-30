// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');
const historyView = document.getElementById('historyView');
const historyList = document.getElementById('historyList');
const historyBtn = document.getElementById('historyBtn');
const backToChat = document.getElementById('backToChat');
const newChatBtn = document.getElementById('newChatBtn');
const chatInputContainer = document.querySelector('.chat-input-container');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const themeToggle = document.getElementById('themeToggle');
const voiceOutputToggle = document.getElementById('voiceOutputToggle');
const summaryBtn = document.getElementById('summaryBtn');
const summaryModal = document.getElementById('summaryModal');
const closeSummaryBtn = document.getElementById('closeSummaryBtn');
const summaryContent = document.getElementById('summaryContent');
const exportSummaryBtn = document.getElementById('exportSummaryBtn');
const copySummaryBtn = document.getElementById('copySummaryBtn');
const summaryModalFooter = document.querySelector('.summary-modal-footer');
const statusIndicator = document.getElementById('statusIndicator');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeInfoBtn = document.getElementById('closeInfoBtn');

// Voice output state
let autoVoiceOutput = localStorage.getItem('autoVoiceOutput') === 'true';
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;

// Theme handling
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const sunIcon = themeToggle.querySelector('.sun-icon');
  const moonIcon = themeToggle.querySelector('.moon-icon');
  if (theme === 'dark') {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  } else {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  }
}

// Initialize theme on load
initTheme();

// Set initial message time to real device time
const initialTimeEl = document.getElementById('initialMessageTime');
if (initialTimeEl) {
  const now = new Date();
  initialTimeEl.textContent = now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Generate unique session ID for conversation context
let sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
let currentMessages = [];
let isFromHistory = false;

// Format time
function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Add message to chat
function addMessage(content, isUser = false, tokenInfo = null, responseTime = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  
  // Build token tracker HTML if available
  let tokenTrackerHtml = '';
  if (!isUser && tokenInfo && responseTime !== null) {
    tokenTrackerHtml = `
      <div class="token-tracker">
        <span class="token-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          ${responseTime}ms
        </span>
        <span class="token-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          ${tokenInfo.totalTokens} tokens
        </span>
      </div>
    `;
  }
  
  if (isUser) {
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      <span class="message-time">${formatTime()}</span>
      <button class="edit-message-btn" onclick="editLastMessage()" title="Edit message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    `;
  } else {
    messageDiv.innerHTML = `
      <div class="message-content">${content}</div>
      ${tokenTrackerHtml}
      <span class="message-time">${formatTime()}</span>
      <div class="bot-message-actions">
        <button class="speak-message-btn" onclick="speakMessage(this)" title="Listen to response">
          <svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 010 7.07"/>
          </svg>
          <svg class="stop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
        </button>
        <button class="copy-message-btn" onclick="copyResponse(this)" title="Copy response">
          <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </button>
      </div>
    `;
    
    // Auto speak if enabled
    if (autoVoiceOutput) {
      setTimeout(() => speakText(content), 100);
    }
  }
  
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
  
  // Save to current messages
  currentMessages.push({ content, isUser, time: formatTime() });
  
  // Update edit button visibility
  updateEditButtonVisibility();
}

// Copy bot response to clipboard
function copyResponse(button) {
  const messageContent = button.closest('.bot-message').querySelector('.message-content').textContent;
  navigator.clipboard.writeText(messageContent).then(() => {
    // Show check icon
    const copyIcon = button.querySelector('.copy-icon');
    const checkIcon = button.querySelector('.check-icon');
    copyIcon.style.display = 'none';
    checkIcon.style.display = 'block';
    
    // Revert after 2 seconds
    setTimeout(() => {
      copyIcon.style.display = 'block';
      checkIcon.style.display = 'none';
    }, 2000);
  }).catch(err => {
    // console.error('Failed to copy:', err);
  });
}

// Speak message using Text-to-Speech
function speakMessage(button) {
  const messageContent = button.closest('.bot-message').querySelector('.message-content').textContent;
  const speakerIcon = button.querySelector('.speaker-icon');
  const stopIcon = button.querySelector('.stop-icon');
  
  // If already speaking this message, stop it
  if (currentUtterance && button.classList.contains('speaking')) {
    speechSynthesis.cancel();
    button.classList.remove('speaking');
    speakerIcon.style.display = 'block';
    stopIcon.style.display = 'none';
    currentUtterance = null;
    return;
  }
  
  // Stop any ongoing speech
  speechSynthesis.cancel();
  resetAllSpeakButtons();
  
  // Speak the message
  speakText(messageContent, button);
}

// Speak text using Web Speech API
function speakText(text, button = null) {
  if (!speechSynthesis) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;
  
  // Try to use a good English voice
  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) 
    || voices.find(v => v.lang.startsWith('en'));
  if (preferredVoice) utterance.voice = preferredVoice;
  
  if (button) {
    const speakerIcon = button.querySelector('.speaker-icon');
    const stopIcon = button.querySelector('.stop-icon');
    
    button.classList.add('speaking');
    speakerIcon.style.display = 'none';
    stopIcon.style.display = 'block';
    
    utterance.onend = () => {
      button.classList.remove('speaking');
      speakerIcon.style.display = 'block';
      stopIcon.style.display = 'none';
      currentUtterance = null;
    };
  }
  
  currentUtterance = utterance;
  speechSynthesis.speak(utterance);
}

// Reset all speak buttons to default state
function resetAllSpeakButtons() {
  document.querySelectorAll('.speak-message-btn').forEach(btn => {
    btn.classList.remove('speaking');
    const speakerIcon = btn.querySelector('.speaker-icon');
    const stopIcon = btn.querySelector('.stop-icon');
    if (speakerIcon) speakerIcon.style.display = 'block';
    if (stopIcon) stopIcon.style.display = 'none';
  });
}

// Toggle auto voice output
function toggleVoiceOutput() {
  autoVoiceOutput = !autoVoiceOutput;
  localStorage.setItem('autoVoiceOutput', autoVoiceOutput);
  updateVoiceOutputIcon();
  
  // Stop any ongoing speech when disabling
  if (!autoVoiceOutput) {
    speechSynthesis.cancel();
    resetAllSpeakButtons();
  }
}

// Update voice output icon
function updateVoiceOutputIcon() {
  const speakerOnIcon = voiceOutputToggle.querySelector('.speaker-on-icon');
  const speakerOffIcon = voiceOutputToggle.querySelector('.speaker-off-icon');
  if (autoVoiceOutput) {
    speakerOnIcon.style.display = 'block';
    speakerOffIcon.style.display = 'none';
    voiceOutputToggle.classList.add('active');
  } else {
    speakerOnIcon.style.display = 'none';
    speakerOffIcon.style.display = 'block';
    voiceOutputToggle.classList.remove('active');
  }
}

// Initialize voice output state
function initVoiceOutput() {
  updateVoiceOutputIcon();
  // Load voices (needed for some browsers)
  speechSynthesis.getVoices();
}

// Update edit button visibility - only show on last user message
function updateEditButtonVisibility() {
  const userMessages = document.querySelectorAll('.user-message');
  userMessages.forEach((msg, index) => {
    const editBtn = msg.querySelector('.edit-message-btn');
    if (editBtn) {
      editBtn.style.display = (index === userMessages.length - 1) ? 'flex' : 'none';
    }
  });
}

// Edit last message
function editLastMessage() {
  // Find the last user message
  const userMessages = document.querySelectorAll('.user-message');
  if (userMessages.length === 0) return;
  
  const lastUserMessage = userMessages[userMessages.length - 1];
  const messageContent = lastUserMessage.querySelector('.message-content').textContent;
  
  // Put the message in the input field
  messageInput.value = messageContent;
  messageInput.focus();
  
  // Remove the last user message from DOM
  lastUserMessage.remove();
  
  // Remove from currentMessages array
  const lastUserIndex = currentMessages.map(m => m.isUser).lastIndexOf(true);
  if (lastUserIndex !== -1) {
    // Remove user message and all bot messages after it
    currentMessages.splice(lastUserIndex);
  }
  
  // Remove the bot response if it exists (the message after the user message)
  const allMessages = document.querySelectorAll('.message');
  if (allMessages.length > 0) {
    const lastMessage = allMessages[allMessages.length - 1];
    if (lastMessage.classList.contains('bot-message')) {
      lastMessage.remove();
    }
  }
  
  // Update edit button visibility
  updateEditButtonVisibility();
  
  // Save the updated chat
  saveCurrentChat();
}

// Scroll to bottom of chat
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
  typingIndicator.classList.add('active');
  scrollToBottom();
}

// Hide typing indicator
function hideTyping() {
  typingIndicator.classList.remove('active');
}

// Send message to server
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  // Add user message
  addMessage(message, true);
  messageInput.value = '';
  
  // Show typing
  showTyping();
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message,
        sessionId 
      })
    });
    
    const data = await response.json();
    hideTyping();
    
    if (data.response) {
      addMessage(data.response, false, data.tokenInfo, data.responseTime);
      saveCurrentChat();
    } else {
      addMessage('Sorry, I couldn\'t process that. Please try again.', false);
    }
  } catch (error) {
    hideTyping();
    // console.error('Error:', error);
    addMessage('Connection error. Please try again.', false);
  }
}

// Save current chat to history
function saveCurrentChat() {
  if (currentMessages.length === 0) return;
  
  let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  
  // Check if this sessionId already exists
  const existingIndex = history.findIndex(h => h.sessionId === sessionId);
  
  const chatData = {
    sessionId,
    messages: [...currentMessages],
    timestamp: Date.now(),
    title: currentMessages[0]?.content?.substring(0, 30) || 'Chat',
    preview: currentMessages[currentMessages.length - 1]?.content?.substring(0, 50) || ''
  };
  
  if (existingIndex !== -1) {
    // Update existing
    history[existingIndex] = chatData;
  } else {
    // Add new
    history.unshift(chatData);
  }
  
  // Keep only last 10
  history = history.slice(0, 10);
  localStorage.setItem('chatHistory', JSON.stringify(history));
}

// Load history list
function loadHistoryList() {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">No chat history yet</p>';
    return;
  }
  
  historyList.innerHTML = history.map((chat, index) => {
    const title = chat.title || 'Chat';
    const preview = chat.preview || '';
    return `
      <div class="history-item">
        <div class="history-item-content" onclick="loadChat(${index})">
          <div class="history-item-title">${escapeHtml(title)}${title.length >= 30 ? '...' : ''}</div>
          <div class="history-item-time">${formatTimestamp(chat.timestamp)}</div>
          <div class="history-item-preview">${escapeHtml(preview)}${preview.length >= 50 ? '...' : ''}</div>
        </div>
        <div class="history-item-actions">
          <button class="history-action-btn export-btn" onclick="exportChat(${index}, event)" title="Export Chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
          </button>
          <button class="history-action-btn delete-btn" onclick="deleteChat(${index}, event)" title="Delete Chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Delete specific chat from history
function deleteChat(index, event) {
  event.stopPropagation();
  if (confirm('Delete this chat?')) {
    let history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    history.splice(index, 1);
    localStorage.setItem('chatHistory', JSON.stringify(history));
    loadHistoryList();
  }
}

// Export specific chat
function exportChat(index, event) {
  event.stopPropagation();
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  const chat = history[index];
  if (!chat) return;
  
  let exportText = `GyaanGuru Chat Export\n`;
  exportText += `Date: ${new Date(chat.timestamp).toLocaleString()}\n`;
  exportText += `${'='.repeat(40)}\n\n`;
  
  chat.messages.forEach(msg => {
    const sender = msg.isUser ? 'You' : 'GyaanGuru';
    exportText += `[${msg.time}] ${sender}:\n${msg.content}\n\n`;
  });
  
  const blob = new Blob([exportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gyaanguru-chat-${new Date(chat.timestamp).toISOString().slice(0,10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Load a chat from history
function loadChat(index) {
  const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  const chat = history[index];
  if (!chat) return;
  
  // Clear current chat
  chatMessages.innerHTML = '';
  currentMessages = [];
  sessionId = chat.sessionId;
  isFromHistory = true;
  
  // Load messages
  chat.messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.isUser ? 'user-message' : 'bot-message'}`;
    if (msg.isUser) {
      messageDiv.innerHTML = `
        <div class="message-content">${msg.content}</div>
        <span class="message-time">${msg.time}</span>
        <button class="edit-message-btn" onclick="editLastMessage()" title="Edit message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">${msg.content}</div>
        <span class="message-time">${msg.time}</span>
        <div class="bot-message-actions">
          <button class="speak-message-btn" onclick="speakMessage(this)" title="Listen to response">
            <svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 010 7.07"/>
            </svg>
            <svg class="stop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
          <button class="copy-message-btn" onclick="copyResponse(this)" title="Copy response">
            <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </button>
        </div>
      `;
    }
    chatMessages.appendChild(messageDiv);
    currentMessages.push(msg);
  });
  
  // Update edit button visibility for loaded chat
  updateEditButtonVisibility();
  
  scrollToBottom();
  hideHistoryView();
}

// Show history view
function showHistoryView() {
  loadHistoryList();
  historyView.classList.add('active');
  chatMessages.style.display = 'none';
  typingIndicator.style.display = 'none';
  chatInputContainer.style.display = 'none';
}

// Hide history view
function hideHistoryView() {
  historyView.classList.remove('active');
  chatMessages.style.display = 'flex';
  chatInputContainer.style.display = 'flex';
}

// Format timestamp
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' hr ago';
  return date.toLocaleDateString();
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start new chat
function startNewChat() {
  saveCurrentChat();
  sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
  currentMessages = [];
  isFromHistory = false;
  chatMessages.innerHTML = `
    <div class="message bot-message">
      <div class="message-content">Namaste! 🙏 I'm GyaanGuru, your knowledge companion. What's your name? 😊</div>
      <span class="message-time">${formatTime()}</span>
    </div>
  `;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);

// Online/Offline status based on input focus
let offlineTimeout = null;

// Set initial status to Online and start 30s countdown
function initStatus() {
  statusIndicator.textContent = '● Online';
  statusIndicator.classList.add('online');
  statusIndicator.classList.remove('offline');
  
  // Auto offline after 30 seconds if no interaction
  offlineTimeout = setTimeout(() => {
    statusIndicator.textContent = '● Offline';
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
  }, 30000); // 30 seconds
}

// Call on page load
initStatus();

messageInput.addEventListener('focus', () => {
  // Clear any pending offline timeout
  if (offlineTimeout) {
    clearTimeout(offlineTimeout);
    offlineTimeout = null;
  }
  statusIndicator.textContent = '● Online';
  statusIndicator.classList.add('online');
  statusIndicator.classList.remove('offline');
});

messageInput.addEventListener('blur', () => {
  // Set offline after 1 minute of inactivity
  offlineTimeout = setTimeout(() => {
    statusIndicator.textContent = '● Offline';
    statusIndicator.classList.remove('online');
    statusIndicator.classList.add('offline');
  }, 60000); // 1 minute
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

historyBtn.addEventListener('click', () => {
  showHistoryView();
});

backToChat.addEventListener('click', () => {
  hideHistoryView();
});

newChatBtn.addEventListener('click', startNewChat);

themeToggle.addEventListener('click', toggleTheme);

voiceOutputToggle.addEventListener('click', toggleVoiceOutput);

// Initialize voice output on load
initVoiceOutput();

// Summary functionality
summaryBtn.addEventListener('click', showChatSummary);
closeSummaryBtn.addEventListener('click', hideSummaryModal);
exportSummaryBtn.addEventListener('click', exportSummary);
copySummaryBtn.addEventListener('click', copySummary);

// Info modal functionality
infoBtn.addEventListener('click', showInfoModal);
closeInfoBtn.addEventListener('click', hideInfoModal);

// Close modal when clicking outside
summaryModal.addEventListener('click', (e) => {
  if (e.target === summaryModal) {
    hideSummaryModal();
  }
});

infoModal.addEventListener('click', (e) => {
  if (e.target === infoModal) {
    hideInfoModal();
  }
});

// Generate chat summary
function generateSummary() {
  if (currentMessages.length === 0) {
    return null;
  }
  
  const userMessages = currentMessages.filter(m => m.isUser);
  const botMessages = currentMessages.filter(m => !m.isUser);
  
  // Get topics discussed (first words of user messages)
  const topics = userMessages.map(m => {
    const words = m.content.split(' ').slice(0, 5).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  });
  
  // Calculate stats
  const totalMessages = currentMessages.length;
  const userMsgCount = userMessages.length;
  const botMsgCount = botMessages.length;
  const avgUserMsgLength = userMessages.length > 0 
    ? Math.round(userMessages.reduce((acc, m) => acc + m.content.length, 0) / userMessages.length)
    : 0;
  const avgBotMsgLength = botMessages.length > 0
    ? Math.round(botMessages.reduce((acc, m) => acc + m.content.length, 0) / botMessages.length)
    : 0;
  
  // Get first and last message times
  const startTime = currentMessages[0]?.time || 'N/A';
  const endTime = currentMessages[currentMessages.length - 1]?.time || 'N/A';
  
  return {
    totalMessages,
    userMsgCount,
    botMsgCount,
    avgUserMsgLength,
    avgBotMsgLength,
    topics,
    startTime,
    endTime,
    messages: currentMessages
  };
}

// Show chat summary modal
function showChatSummary() {
  const summary = generateSummary();
  
  if (!summary) {
    summaryContent.innerHTML = `
      <div class="summary-empty">
        <p>No messages yet to summarize!</p>
        <p>Start a conversation first.</p>
      </div>
    `;
    summaryModalFooter.style.display = 'none';
  } else {
    summaryModalFooter.style.display = 'flex';
    summaryContent.innerHTML = `
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-value">${summary.totalMessages}</span>
          <span class="stat-label">Total Messages</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${summary.userMsgCount}</span>
          <span class="stat-label">Your Messages</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${summary.botMsgCount}</span>
          <span class="stat-label">Bot Responses</span>
        </div>
      </div>
      
      <div class="summary-section">
        <h4>⏰ Time</h4>
        <p>Started: ${summary.startTime} | Last: ${summary.endTime}</p>
      </div>
      
      <div class="summary-section">
        <h4>💬 Topics Discussed</h4>
        <ul class="topics-list">
          ${summary.topics.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
      
      <div class="summary-section">
        <h4>📊 Message Stats</h4>
        <p>Avg. your message length: ${summary.avgUserMsgLength} chars</p>
        <p>Avg. bot response length: ${summary.avgBotMsgLength} chars</p>
      </div>
      
      <div class="summary-section">
        <h4>📝 Full Conversation</h4>
        <div class="conversation-preview">
          ${summary.messages.map(m => `
            <div class="preview-message ${m.isUser ? 'preview-user' : 'preview-bot'}">
              <strong>${m.isUser ? 'You' : 'GyaanGuru'}:</strong> ${escapeHtml(m.content.substring(0, 150))}${m.content.length > 150 ? '...' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  summaryModal.classList.add('active');
}

// Hide summary modal
function hideSummaryModal() {
  summaryModal.classList.remove('active');
}

// Info modal functions
function showInfoModal() {
  infoModal.classList.add('active');
}

function hideInfoModal() {
  infoModal.classList.remove('active');
}

// Export summary as text file
function exportSummary() {
  const summary = generateSummary();
  if (!summary) {
    alert('No messages to export!');
    return;
  }
  
  let exportText = `GyaanGuru Chat Summary\n`;
  exportText += `${'='.repeat(50)}\n\n`;
  exportText += `📊 STATISTICS\n`;
  exportText += `-`.repeat(30) + `\n`;
  exportText += `Total Messages: ${summary.totalMessages}\n`;
  exportText += `Your Messages: ${summary.userMsgCount}\n`;
  exportText += `Bot Responses: ${summary.botMsgCount}\n`;
  exportText += `Started: ${summary.startTime}\n`;
  exportText += `Last Message: ${summary.endTime}\n\n`;
  
  exportText += `💬 TOPICS DISCUSSED\n`;
  exportText += `-`.repeat(30) + `\n`;
  summary.topics.forEach((t, i) => {
    exportText += `${i + 1}. ${t}\n`;
  });
  exportText += `\n`;
  
  exportText += `📝 FULL CONVERSATION\n`;
  exportText += `-`.repeat(30) + `\n`;
  summary.messages.forEach(m => {
    const sender = m.isUser ? 'You' : 'GyaanGuru';
    exportText += `[${m.time}] ${sender}:\n${m.content}\n\n`;
  });
  
  exportText += `${'='.repeat(50)}\n`;
  exportText += `Exported from GyaanGuru - Developed by Prathu Tripathi\n`;
  
  const blob = new Blob([exportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gyaanguru-summary-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Copy summary to clipboard
function copySummary() {
  const summary = generateSummary();
  if (!summary) {
    alert('No messages to copy!');
    return;
  }
  
  let copyText = `GyaanGuru Chat Summary\n\n`;
  copyText += `📊 Stats: ${summary.totalMessages} messages (${summary.userMsgCount} yours, ${summary.botMsgCount} bot)\n\n`;
  copyText += `💬 Topics:\n`;
  summary.topics.forEach((t, i) => {
    copyText += `• ${t}\n`;
  });
  copyText += `\n📝 Conversation:\n`;
  summary.messages.forEach(m => {
    const sender = m.isUser ? 'You' : 'GyaanGuru';
    copyText += `${sender}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}\n`;
  });
  
  navigator.clipboard.writeText(copyText).then(() => {
    const btn = copySummaryBtn;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
    setTimeout(() => {
      btn.innerHTML = originalText;
    }, 2000);
  });
}

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all chat history?')) {
    localStorage.removeItem('chatHistory');
    loadHistoryList();
  }
});

// Voice Recognition
const voiceButton = document.getElementById('voiceButton');
let recognition = null;
let isListening = false;

// Check for browser support
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    isListening = true;
    voiceButton.classList.add('listening');
    messageInput.placeholder = 'Listening...';
  };
  
  recognition.onend = () => {
    isListening = false;
    voiceButton.classList.remove('listening');
    messageInput.placeholder = 'Type your message...';
  };
  
  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    // Show interim results while speaking
    if (interimTranscript) {
      messageInput.value = interimTranscript;
    }
    
    // When final, set the value and optionally auto-send
    if (finalTranscript) {
      messageInput.value = finalTranscript;
      // Auto-send after voice input
      setTimeout(() => {
        if (messageInput.value.trim()) {
          sendMessage();
        }
      }, 500);
    }
  };
  
  recognition.onerror = (event) => {
    // console.error('Speech recognition error:', event.error);
    isListening = false;
    voiceButton.classList.remove('listening');
    messageInput.placeholder = 'Type your message...';
    
    if (event.error === 'not-allowed') {
      alert('Microphone access denied. Please allow microphone access to use voice input.');
    }
  };
  
  voiceButton.addEventListener('click', () => {
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
} else {
  // Browser doesn't support speech recognition
  voiceButton.style.display = 'none';
  // console.log('Speech recognition not supported in this browser');
}

// Code Protection for Desktop Users
// Detect if user is on desktop (not mobile/tablet)
function isDesktop() {
  return window.innerWidth > 768 && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Disable right-click context menu on desktop
if (isDesktop()) {
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable common dev tool shortcuts on desktop
  document.addEventListener('keydown', function(e) {
    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      alert('Developer tools are disabled for security reasons.');
      return false;
    }
  });

  // Additional protection: Disable drag and drop to prevent code inspection
  document.addEventListener('dragstart', function(e) {
    e.preventDefault();
    return false;
  });

  // Disable text selection on desktop
  document.addEventListener('selectstart', function(e) {
    e.preventDefault();
    return false;
  });
}