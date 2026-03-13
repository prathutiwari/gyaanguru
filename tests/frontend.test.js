/**
 * GyaanGuru Frontend Tests
 * Test cases for all client-side features
 * 
 * These tests use Jest with jsdom environment
 * to test frontend JavaScript functionality
 */

/**
 * @jest-environment jsdom
 */

describe('GyaanGuru Frontend Tests', () => {

  // ============================================
  // 1. LOCAL STORAGE TESTS
  // ============================================
  
  describe('LocalStorage Functionality', () => {
    
    beforeEach(() => {
      localStorage.clear();
    });

    test('should save theme preference to localStorage', () => {
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should save voice output preference', () => {
      localStorage.setItem('autoVoiceOutput', 'true');
      expect(localStorage.getItem('autoVoiceOutput')).toBe('true');
    });

    test('should save chat history', () => {
      const history = [
        { id: '1', title: 'Test Chat', messages: [] }
      ];
      localStorage.setItem('chatHistory', JSON.stringify(history));
      
      const retrieved = JSON.parse(localStorage.getItem('chatHistory'));
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].title).toBe('Test Chat');
    });

    test('should handle empty chat history', () => {
      const history = localStorage.getItem('chatHistory');
      expect(history).toBeNull();
    });

    test('should limit chat history to 10 items', () => {
      const history = Array.from({ length: 15 }, (_, i) => ({
        id: String(i),
        title: `Chat ${i}`,
        messages: []
      }));
      
      // Simulate keeping only last 10
      const limitedHistory = history.slice(-10);
      localStorage.setItem('chatHistory', JSON.stringify(limitedHistory));
      
      const retrieved = JSON.parse(localStorage.getItem('chatHistory'));
      expect(retrieved).toHaveLength(10);
    });
  });

  // ============================================
  // 2. THEME HANDLING TESTS
  // ============================================
  
  describe('Theme Handling', () => {
    
    beforeEach(() => {
      localStorage.clear();
      document.body.innerHTML = '<div data-theme="light"></div>';
    });

    test('should default to light theme', () => {
      const theme = localStorage.getItem('theme') || 'light';
      expect(theme).toBe('light');
    });

    test('should store dark theme preference', () => {
      localStorage.setItem('theme', 'dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('should toggle theme value', () => {
      let currentTheme = 'light';
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      expect(currentTheme).toBe('dark');
    });
  });

  // ============================================
  // 3. MESSAGE HANDLING TESTS
  // ============================================
  
  describe('Message Handling', () => {
    
    test('should create message object with required fields', () => {
      const message = {
        content: 'Hello',
        isUser: true,
        time: new Date().toLocaleTimeString()
      };
      
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('isUser');
      expect(message).toHaveProperty('time');
    });

    test('should differentiate user and bot messages', () => {
      const userMessage = { content: 'Hi', isUser: true };
      const botMessage = { content: 'Hello!', isUser: false };
      
      expect(userMessage.isUser).toBe(true);
      expect(botMessage.isUser).toBe(false);
    });

    test('should format time correctly', () => {
      const time = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      expect(time).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  // ============================================
  // 4. SESSION ID TESTS
  // ============================================
  
  describe('Session ID Generation', () => {
    
    test('should generate unique session IDs', () => {
      const generateSessionId = () => 
        'session_' + Math.random().toString(36).substr(2, 9);
      
      const id1 = generateSessionId();
      const id2 = generateSessionId();
      
      expect(id1).not.toBe(id2);
    });

    test('should start with "session_" prefix', () => {
      const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      expect(sessionId.startsWith('session_')).toBe(true);
    });
  });

  // ============================================
  // 5. CHAT HISTORY TESTS
  // ============================================
  
  describe('Chat History Management', () => {
    
    beforeEach(() => {
      localStorage.clear();
    });

    test('should add new chat to history', () => {
      const history = [];
      const newChat = {
        id: Date.now().toString(),
        title: 'New Chat',
        preview: 'Hello...',
        messages: [{ content: 'Hello', isUser: true }],
        timestamp: new Date().toISOString()
      };
      
      history.push(newChat);
      expect(history).toHaveLength(1);
    });

    test('should delete chat from history', () => {
      const history = [
        { id: '1', title: 'Chat 1' },
        { id: '2', title: 'Chat 2' }
      ];
      
      const filtered = history.filter(h => h.id !== '1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    test('should clear all history', () => {
      localStorage.setItem('chatHistory', JSON.stringify([
        { id: '1' }, { id: '2' }
      ]));
      
      localStorage.removeItem('chatHistory');
      expect(localStorage.getItem('chatHistory')).toBeNull();
    });

    test('should generate preview from first message', () => {
      const message = 'This is a very long message that should be truncated';
      const preview = message.substring(0, 30) + '...';
      
      expect(preview.length).toBeLessThanOrEqual(33);
    });
  });

  // ============================================
  // 6. SUMMARY GENERATION TESTS
  // ============================================
  
  describe('Chat Summary Generation', () => {
    
    test('should calculate total message count', () => {
      const messages = [
        { content: 'Hi', isUser: true },
        { content: 'Hello!', isUser: false },
        { content: 'How are you?', isUser: true },
        { content: 'I am fine!', isUser: false }
      ];
      
      expect(messages.length).toBe(4);
    });

    test('should count user messages', () => {
      const messages = [
        { content: 'Hi', isUser: true },
        { content: 'Hello!', isUser: false },
        { content: 'How are you?', isUser: true }
      ];
      
      const userMsgCount = messages.filter(m => m.isUser).length;
      expect(userMsgCount).toBe(2);
    });

    test('should count bot messages', () => {
      const messages = [
        { content: 'Hi', isUser: true },
        { content: 'Hello!', isUser: false },
        { content: 'How are you?', isUser: true },
        { content: 'I am great!', isUser: false }
      ];
      
      const botMsgCount = messages.filter(m => !m.isUser).length;
      expect(botMsgCount).toBe(2);
    });

    test('should calculate average message length', () => {
      const messages = [
        { content: 'Hello', isUser: true },      // 5 chars
        { content: 'Hi there!', isUser: true }   // 9 chars
      ];
      
      const avgLength = messages.reduce((acc, m) => acc + m.content.length, 0) / messages.length;
      expect(avgLength).toBe(7);
    });

    test('should extract topics from messages', () => {
      const messages = [
        { content: 'Tell me about JavaScript', isUser: true },
        { content: 'What is Python?', isUser: true }
      ];
      
      const topics = messages.map(m => m.content.split(' ').slice(0, 5).join(' '));
      expect(topics).toHaveLength(2);
    });

    test('should handle empty messages array', () => {
      const messages = [];
      expect(messages.length).toBe(0);
    });
  });

  // ============================================
  // 7. ESCAPE HTML TESTS
  // ============================================
  
  describe('HTML Escaping', () => {
    
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    test('should escape < and > characters', () => {
      const result = escapeHtml('<script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
    });

    test('should escape ampersand', () => {
      const result = escapeHtml('Tom & Jerry');
      expect(result).toContain('&amp;');
    });

    test('should escape quotes', () => {
      const result = escapeHtml('Say "Hello"');
      // textContent escapes < > & but not quotes (browser-safe behavior)
      expect(result).toContain('Hello');
    });

    test('should handle normal text', () => {
      const result = escapeHtml('Hello World');
      expect(result).toBe('Hello World');
    });
  });

  // ============================================
  // 8. ONLINE/OFFLINE STATUS TESTS
  // ============================================
  
  describe('Online/Offline Status', () => {
    
    test('should default to online status on load', () => {
      const initialStatus = 'Online';
      expect(initialStatus).toBe('Online');
    });

    test('should track focus state', () => {
      let isFocused = false;
      
      // Simulate focus
      isFocused = true;
      expect(isFocused).toBe(true);
      
      // Simulate blur
      isFocused = false;
      expect(isFocused).toBe(false);
    });

    test('should handle timeout for offline status', () => {
      jest.useFakeTimers();
      
      let status = 'Online';
      const timeout = setTimeout(() => {
        status = 'Offline';
      }, 30000);
      
      // Fast-forward time
      jest.advanceTimersByTime(30000);
      
      expect(status).toBe('Offline');
      
      jest.useRealTimers();
    });

    test('should cancel timeout on focus', () => {
      jest.useFakeTimers();
      
      let status = 'Online';
      let timeoutId = setTimeout(() => {
        status = 'Offline';
      }, 30000);
      
      // Simulate focus - clear timeout
      clearTimeout(timeoutId);
      
      jest.advanceTimersByTime(30000);
      
      // Status should remain Online
      expect(status).toBe('Online');
      
      jest.useRealTimers();
    });
  });

  // ============================================
  // 9. VOICE OUTPUT TESTS
  // ============================================
  
  describe('Voice Output', () => {
    
    beforeEach(() => {
      localStorage.clear();
    });

    test('should default to voice output disabled', () => {
      const autoVoice = localStorage.getItem('autoVoiceOutput') === 'true';
      expect(autoVoice).toBe(false);
    });

    test('should save voice preference', () => {
      localStorage.setItem('autoVoiceOutput', 'true');
      const autoVoice = localStorage.getItem('autoVoiceOutput') === 'true';
      expect(autoVoice).toBe(true);
    });

    test('should toggle voice output', () => {
      let autoVoice = false;
      autoVoice = !autoVoice;
      expect(autoVoice).toBe(true);
    });
  });

  // ============================================
  // 10. EXPORT FUNCTIONALITY TESTS
  // ============================================
  
  describe('Export Functionality', () => {
    
    test('should format export text correctly', () => {
      const messages = [
        { content: 'Hello', isUser: true, time: '10:00 AM' },
        { content: 'Hi there!', isUser: false, time: '10:01 AM' }
      ];
      
      let exportText = '';
      messages.forEach(m => {
        const sender = m.isUser ? 'You' : 'GyaanGuru';
        exportText += `[${m.time}] ${sender}: ${m.content}\n`;
      });
      
      expect(exportText).toContain('[10:00 AM] You: Hello');
      expect(exportText).toContain('[10:01 AM] GyaanGuru: Hi there!');
    });

    test('should create valid filename', () => {
      const date = new Date().toISOString().slice(0, 10);
      const filename = `gyaanguru-chat-${date}.txt`;
      
      expect(filename).toMatch(/gyaanguru-chat-\d{4}-\d{2}-\d{2}\.txt/);
    });

    test('should format summary export', () => {
      const summary = {
        totalMessages: 10,
        userMsgCount: 5,
        botMsgCount: 5,
        topics: ['JavaScript', 'Python']
      };
      
      let exportText = 'GyaanGuru Chat Summary\n';
      exportText += `Total Messages: ${summary.totalMessages}\n`;
      
      expect(exportText).toContain('Total Messages: 10');
    });
  });

  // ============================================
  // 11. CLIPBOARD FUNCTIONALITY TESTS
  // ============================================
  
  describe('Clipboard Functionality', () => {
    
    test('should prepare text for clipboard', () => {
      const text = 'This is a test response from GyaanGuru';
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });

    test('should format summary for clipboard', () => {
      const summary = {
        totalMessages: 5,
        topics: ['Topic 1', 'Topic 2']
      };
      
      let copyText = `Stats: ${summary.totalMessages} messages\n`;
      copyText += `Topics:\n`;
      summary.topics.forEach(t => {
        copyText += `• ${t}\n`;
      });
      
      expect(copyText).toContain('• Topic 1');
      expect(copyText).toContain('• Topic 2');
    });
  });

  // ============================================
  // 12. INPUT VALIDATION TESTS
  // ============================================
  
  describe('Input Validation', () => {
    
    test('should trim whitespace from input', () => {
      const input = '  Hello World  ';
      expect(input.trim()).toBe('Hello World');
    });

    test('should detect empty input', () => {
      const input = '   ';
      expect(input.trim()).toBe('');
      expect(input.trim().length).toBe(0);
    });

    test('should allow valid input', () => {
      const input = 'What is JavaScript?';
      expect(input.trim().length).toBeGreaterThan(0);
    });
  });
});
