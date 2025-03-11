/**
 * ロガーユーティリティ
 * アプリケーション全体で一貫したログ出力を提供する
 */

const env = require('../config/env');

/**
 * ログレベルに応じた色付けの設定
 */
const colors = {
  error: '\x1b[31m', // 赤
  warn: '\x1b[33m',  // 黄
  info: '\x1b[36m',  // シアン
  debug: '\x1b[32m', // 緑
  reset: '\x1b[0m'   // リセット
};

/**
 * ログレベルの優先順位
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

/**
 * 現在の時刻を取得
 * @returns {string} フォーマットされた時刻文字列
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * 指定されたログレベルが現在の設定より重要かチェック
 * @param {string} level - チェックするログレベル
 * @returns {boolean} 出力すべきかどうか
 */
const shouldLog = (level) => {
  return logLevels[level] <= logLevels[env.logLevel];
};

/**
 * ログメッセージを出力
 * @param {string} level - ログレベル
 * @param {string} message - ログメッセージ
 * @param {Object} [data] - 追加のデータ
 */
const log = (level, message, data) => {
  if (!shouldLog(level)) return;

  const timestamp = getTimestamp();
  const color = colors[level] || '';
  const resetColor = colors.reset;
  
  let output = `${timestamp} ${color}[${level.toUpperCase()}]${resetColor} ${message}`;
  
  if (data) {
    // オブジェクトの場合は整形して出力
    if (typeof data === 'object') {
      output += `\n${JSON.stringify(data, null, 2)}`;
    } else {
      output += ` ${data}`;
    }
  }
  
  console.log(output);
};

/**
 * エクスポートするロガー関数
 */
module.exports = {
  debug: (message, data) => {
    if (env.debugMode) {
      log('debug', message, data);
    }
  },
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data),
  // アクセスログ専用のフォーマット
  access: (req) => {
    if (env.debugMode) {
      log('info', `アクセス: ${req.method} ${req.url}`);
    }
  }
};
