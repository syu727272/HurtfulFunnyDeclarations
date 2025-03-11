/**
 * 環境設定のユニットテスト
 */

const mockProcess = {
  env: {
    PORT: '4000',
    NODE_ENV: 'test',
    XAI_API_KEY: 'test-api-key',
    DEBUG_MODE: 'true',
    LOG_LEVEL: 'debug',
    ENABLE_CACHE: 'true',
    CACHE_DURATION: '1800'
  }
};

// processをモック化
jest.mock('process', () => mockProcess);

// dotenvをモック化
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('環境設定', () => {
  let env;

  beforeEach(() => {
    jest.resetModules();
    // テスト環境用の値で環境変数を設定
    process.env = { ...mockProcess.env };
    env = require('../../src/config/env');
  });

  test('環境変数が正しく設定されていること', () => {
    expect(env.port).toBe(4000);
    expect(env.nodeEnv).toBe('test');
    expect(env.xaiApiKey).toBe('test-api-key');
    expect(env.debugMode).toBe(true);
    expect(env.logLevel).toBe('debug');
    expect(env.enableCache).toBe(true);
    expect(env.cacheDuration).toBe(1800);
  });

  test('環境変数が未設定の場合にデフォルト値が使用されること', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    delete process.env.CACHE_DURATION;
    
    jest.resetModules();
    env = require('../../src/config/env');
    
    expect(env.port).toBe(3000);
    expect(env.nodeEnv).toBe('development');
    expect(env.logLevel).toBe('info');
    expect(env.cacheDuration).toBe(3600);
  });

  test('真偽値の環境変数が正しく変換されること', () => {
    process.env.DEBUG_MODE = 'false';
    process.env.ENABLE_CACHE = 'false';
    
    jest.resetModules();
    env = require('../../src/config/env');
    
    expect(env.debugMode).toBe(false);
    expect(env.enableCache).toBe(false);
  });
});
