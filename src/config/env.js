/**
 * 環境変数の設定ファイル
 * アプリケーション全体で使用する環境変数を一元管理する
 */

const dotenv = require('dotenv');

// .envファイルを読み込む
dotenv.config();

// 環境変数をオブジェクトとしてエクスポート
module.exports = {
  // サーバー設定
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API設定
  xaiApiKey: process.env.XAI_API_KEY,
  
  // デバッグ設定
  debugMode: process.env.DEBUG_MODE === 'true',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // リリース設定
  enableCache: process.env.ENABLE_CACHE === 'true',
  cacheDuration: parseInt(process.env.CACHE_DURATION || 3600, 10)
};
