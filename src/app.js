/**
 * メインアプリケーションファイル
 * Expressアプリケーションの設定とルーティングを行う
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 設定とユーティリティのインポート
const env = require('./config/env');
const logger = require('./utils/logger');

// ルーターのインポート
const eventRoutes = require('./routes/eventRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Expressアプリケーションの初期化
const app = express();

// 基本的なミドルウェアの設定
app.use(cors());
app.use(helmet());
app.use(express.json());

// アクセスログミドルウェア
app.use((req, res, next) => {
  logger.access(req);
  next();
});

// アプリケーションの環境変数を設定
app.set('env', env.nodeEnv);

// ルーティングの設定
app.use('/api/events', eventRoutes);
app.use('/health', healthRoutes);

// 404エラーハンドリング
app.use((req, res, next) => {
  logger.warn(`存在しないパスへのアクセス: ${req.method} ${req.url}`);
  res.status(404).json({
    error: '要求されたリソースが見つかりません',
    path: req.url
  });
});

// グローバルエラーハンドリング
app.use((err, req, res, next) => {
  logger.error('アプリケーションエラー', err);
  res.status(err.status || 500).json({
    error: 'サーバーエラーが発生しました',
    details: env.nodeEnv === 'development' ? err.message : null
  });
});

module.exports = app;
