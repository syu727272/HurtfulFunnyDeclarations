/**
 * ヘルスチェックルーター
 * アプリケーションの状態を確認するためのエンドポイントを定義する
 */

const express = require('express');
const env = require('../config/env');
const router = express.Router();

/**
 * @route   GET /health
 * @desc    アプリケーションの状態を確認する
 * @access  Public
 */
router.get('/', (req, res) => {
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    version: process.env.npm_package_version || '1.0.0'
  };
  
  res.status(200).json(healthInfo);
});

module.exports = router;
