/**
 * Jest Configuration for GyaanGuru Tests
 */

module.exports = {
  // Use different environments for different test files
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/server.test.js'],
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/frontend.test.js'],
    },
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'server.js',
    'public/**/*.js',
    '!**/node_modules/**',
  ],
  
  // Verbose output
  verbose: true,
};
