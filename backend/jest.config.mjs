import { config } from '../jest.default.config.js';

export default {
  ...config,
  collectCoverageFrom: ['src/**/*.js', '!src/**/index.js'],
};
