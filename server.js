/**
 * サーバーエントリーポイント
 * アプリケーションのサーバーを起動する
 */

const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');

// ポート設定
const PORT = env.port;

// 未処理の例外やPromiseリジェクションをキャッチ
process.on('uncaughtException', (error) => {
  logger.error('未処理の例外が発生しました', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未処理のPromiseリジェクションが発生しました', { reason });
  process.exit(1);
});

// サーバーを起動
const server = app.listen(PORT, () => {
  logger.info(`サーバーが起動しました - ポート ${PORT} (${env.nodeEnv}モード)`);
  if (env.debugMode) {
    logger.debug('デバッグモードが有効です');
  }
});

// GracefulShutdown処理
const gracefulShutdown = () => {
  logger.info('シャットダウンシグナルを受信しました');
  
  server.close(() => {
    logger.info('サーバーを正常にシャットダウンしました');
    process.exit(0);
  });
  
  // 強制シャットダウンのタイムアウト設定（10秒後）
  setTimeout(() => {
    logger.error('サーバーのグレースフルシャットダウンに失敗しました - 強制終了します');
    process.exit(1);
  }, 10000);
};

// シャットダウンシグナルのハンドリング
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;
