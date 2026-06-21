import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

/**
 * Custom Jest configuration for a Next.js + TypeScript project.
 * - Uses jsdom environment for React component testing.
 * - Sets up @testing-library/jest-dom helpers.
 * - Transforms JS/TS files via babel-jest.
 * - Maps '@/...' imports to the src directory.
 */
const customJestConfig = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock style imports (CSS/SCSS) – they are not needed for logic tests.
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
  },
};

export default createJestConfig(customJestConfig);
