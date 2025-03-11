/**
 * イベントルーター
 * イベント関連のエンドポイントを定義する
 */

const express = require('express');
const eventController = require('../controllers/eventController');
const router = express.Router();

/**
 * @route   GET /api/events
 * @desc    東京のイベント一覧を取得する
 * @access  Public
 */
router.get('/', eventController.getTokyoEvents.bind(eventController));

/**
 * @route   POST /api/events/cache/clear
 * @desc    イベントのキャッシュをクリアする（管理者用）
 * @access  Private
 */
router.post('/cache/clear', eventController.clearCache.bind(eventController));

module.exports = router;
