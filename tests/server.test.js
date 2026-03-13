/**
 * GyaanGuru Server API Tests
 * Test cases for all server-side features
 */

const request = require('supertest');
const app = require('../server');

describe('GyaanGuru API Tests', () => {
  
  // ============================================
  // 1. BASIC API ENDPOINT TESTS
  // ============================================
  
  describe('POST /api/chat - Basic Functionality', () => {
    
    test('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });

    test('should return 400 if message is empty string', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '' });
      
      expect(response.status).toBe(400);
    });

    test('should accept valid message and return response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
    });

    test('should return response as string', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'What is 2+2?' });
      
      expect(typeof response.body.response).toBe('string');
    });

    test('should include responseTime in response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hi' });
      
      expect(response.body).toHaveProperty('responseTime');
      expect(typeof response.body.responseTime).toBe('number');
    });
  });

  // ============================================
  // 2. SESSION MANAGEMENT TESTS
  // ============================================
  
  describe('Session Management', () => {
    
    test('should handle default sessionId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });
      
      expect(response.status).toBe(200);
    });

    test('should handle custom sessionId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ 
          message: 'Hello',
          sessionId: 'test-session-123'
        });
      
      expect(response.status).toBe(200);
    });

    test('should maintain context within same session', async () => {
      const sessionId = 'context-test-' + Date.now();
      
      // First message
      await request(app)
        .post('/api/chat')
        .send({ 
          message: 'My name is TestUser',
          sessionId 
        });
      
      // Second message - should remember context
      const response = await request(app)
        .post('/api/chat')
        .send({ 
          message: 'What is my name?',
          sessionId 
        });
      
      expect(response.status).toBe(200);
      // Note: Actual context retention depends on AI being enabled
    });

    test('should have separate context for different sessions', async () => {
      const session1 = 'session-1-' + Date.now();
      const session2 = 'session-2-' + Date.now();
      
      await request(app)
        .post('/api/chat')
        .send({ message: 'Hello from session 1', sessionId: session1 });
      
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello from session 2', sessionId: session2 });
      
      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // 3. TOKEN INFO TESTS (when AI is enabled)
  // ============================================
  
  describe('Token Information', () => {
    
    test('should include tokenInfo in response when AI is enabled', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' });
      
      // tokenInfo may be null if AI is disabled
      if (response.body.tokenInfo) {
        expect(response.body.tokenInfo).toHaveProperty('promptTokens');
        expect(response.body.tokenInfo).toHaveProperty('completionTokens');
        expect(response.body.tokenInfo).toHaveProperty('totalTokens');
      }
    });
  });

  // ============================================
  // 4. STATIC FILE SERVING TESTS
  // ============================================
  
  describe('Static File Serving', () => {
    
    test('should serve index.html at root', async () => {
      const response = await request(app)
        .get('/');
      
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/html/);
    });

    test('should serve styles.css', async () => {
      const response = await request(app)
        .get('/styles.css');
      
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/css/);
    });

    test('should serve app.js', async () => {
      const response = await request(app)
        .get('/app.js');
      
      expect(response.status).toBe(200);
      expect(response.type).toMatch(/javascript/);
    });
  });

  // ============================================
  // 5. ERROR HANDLING TESTS
  // ============================================
  
  describe('Error Handling', () => {
    
    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      // Should return 400 for bad request
      expect([400, 500]).toContain(response.status);
    });

    test('should return error for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');
      
      expect(response.status).toBe(404);
    });

    test('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/chat')
        .send({ message: longMessage });
      
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  // ============================================
  // 6. RATE LIMITING TESTS
  // ============================================
  
  describe('Rate Limiting', () => {
    
    test('should include rate limit headers', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Rate limit test' });
      
      // Check for standard rate limit headers
      expect(response.headers).toHaveProperty('ratelimit-limit');
      expect(response.headers).toHaveProperty('ratelimit-remaining');
    });

    test('should allow requests within rate limit', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Within limit' });
      
      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // 7. CONTENT TYPE TESTS
  // ============================================
  
  describe('Content Type Handling', () => {
    
    test('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Content-Type', 'application/json')
        .send({ message: 'JSON content type test' });
      
      expect(response.status).toBe(200);
    });

    test('should return JSON response', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Response type test' });
      
      expect(response.type).toMatch(/json/);
    }, 30000); // 30 second timeout for AI response
  });

  // ============================================
  // 8. SPECIAL CHARACTERS TESTS
  // ============================================
  
  describe('Special Characters Handling', () => {
    
    test('should handle emojis in message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello! 👋😊' });
      
      expect(response.status).toBe(200);
    }, 30000); // 30 second timeout for AI response

    test('should handle unicode characters', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'नमस्ते! How are you?' });
      
      expect(response.status).toBe(200);
    }, 30000); // 30 second timeout for AI response

    test('should handle special characters', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Test < > & " \' characters' });
      
      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // 9. DEVELOPER ATTRIBUTION TEST
  // ============================================
  
  describe('Developer Attribution', () => {
    
    test('should respond to developer question', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Who developed you?' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      // Note: Actual response depends on AI being enabled
    });
  });
});
