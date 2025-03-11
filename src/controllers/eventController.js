/**
 * イベントコントローラー
 * イベントに関連するHTTPリクエストを処理する
 */

const eventService = require('../services/eventService');
const logger = require('../utils/logger');

/**
 * イベントコントローラークラス
 */
class EventController {
  /**
   * 東京のイベントを取得し、JSONレスポンスを返す
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {Object} res - Expressレスポンスオブジェクト
   */
  async getTokyoEvents(req, res) {
    try {
      logger.debug('イベント取得リクエストを受信', req.query);
      
      // クエリパラメータから日付を取得
      const { startDate, endDate, limit } = req.query;
      
      // 日付パラメータを処理
      const options = {
        limit: limit ? parseInt(limit, 10) : 30
      };
      
      if (startDate) {
        options.startDate = new Date(startDate);
      }
      
      if (endDate) {
        options.endDate = new Date(endDate);
      }
      
      // サービスからイベントを取得
      const events = await eventService.getTokyoEvents(options);
      
      // 取得したイベントをJSONとして返す
      logger.info(`${events.length}件のイベントを返却します`);
      return res.json(events);
    } catch (error) {
      logger.error('イベント取得処理でエラーが発生しました', error);
      return res.status(500).json({ 
        error: 'イベントの取得に失敗しました', 
        details: req.app.get('env') === 'development' ? error.message : null 
      });
    }
  }
  
  /**
   * キャッシュをクリアする管理エンドポイント
   * @param {Object} req - Expressリクエストオブジェクト
   * @param {Object} res - Expressレスポンスオブジェクト
   */
  clearCache(req, res) {
    try {
      eventService.clearCache();
      logger.info('キャッシュが手動でクリアされました');
      return res.json({ success: true, message: 'キャッシュがクリアされました' });
    } catch (error) {
      logger.error('キャッシュクリア処理でエラーが発生しました', error);
      return res.status(500).json({ 
        error: 'キャッシュのクリアに失敗しました', 
        details: req.app.get('env') === 'development' ? error.message : null 
      });
    }
  }
}

module.exports = new EventController();
