import { config } from '../jest.default.config.js';

export default {
  ...config,
  testEnvironment: 'jsdom',
  collectCoverageFrom: ['public/src/**/*.js'],
};
