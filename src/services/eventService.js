/**
 * イベントサービス
 * Grok APIと通信してイベント情報を取得する
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Grok APIのベースURL
 */
const GROK_API_BASE_URL = 'https://api.grok.io/events';

/**
 * キャッシュされたデータを保持するオブジェクト
 */
let eventCache = {
  data: null,
  timestamp: null
};

/**
 * イベントサービスクラス
 */
class EventService {
  /**
   * 指定された期間の東京のイベントを取得する
   * @param {Object} options - 検索オプション
   * @param {Date} options.startDate - 検索開始日
   * @param {Date} options.endDate - 検索終了日
   * @param {number} options.limit - 取得件数の上限
   * @returns {Promise<Array>} イベントのリスト
   */
  async getTokyoEvents({ startDate, endDate, limit = 30 } = {}) {
    try {
      logger.debug('東京のイベント取得を開始', { startDate, endDate, limit });
      
      // キャッシュが有効かチェック
      if (this.isCacheValid()) {
        logger.debug('キャッシュからイベントを返却');
        return eventCache.data;
      }
      
      // 日付が指定されていない場合、現在から1ヶ月間を設定
      if (!startDate) {
        startDate = new Date();
      }
      
      if (!endDate) {
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
      }
      
      // ISO形式の日付文字列に変換
      const formattedStartDate = this.formatDate(startDate);
      const formattedEndDate = this.formatDate(endDate);
      
      // APIリクエストの設定
      const config = {
        headers: {
          'Authorization': `Bearer ${env.xaiApiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          location: 'Tokyo',
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          limit
        }
      };
      
      // APIリクエストを実行
      logger.debug('Grok APIにリクエストを送信', config.params);
      const response = await axios.get(GROK_API_BASE_URL, config);
      
      // レスポンスデータを整形
      const events = this.formatEvents(response.data);
      
      // データをキャッシュに保存
      if (env.enableCache) {
        this.cacheEvents(events);
      }
      
      logger.info(`${events.length}件のイベントを取得しました`);
      return events;
    } catch (error) {
      logger.error('イベント取得中にエラーが発生しました', error);
      throw new Error(`イベント取得に失敗しました: ${error.message}`);
    }
  }
  
  /**
   * 日付をISO形式の文字列に変換する
   * @param {Date} date - 変換する日付
   * @returns {string} YYYY-MM-DD形式の日付文字列
   */
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  /**
   * APIから取得したイベントデータを整形する
   * @param {Array} rawEvents - APIから取得した生データ
   * @returns {Array} 整形後のイベントデータ
   */
  formatEvents(rawEvents) {
    if (!Array.isArray(rawEvents)) {
      logger.warn('APIから受け取ったデータが配列ではありません', typeof rawEvents);
      return [];
    }
    
    return rawEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      venue: event.venue,
      organizer: event.organizer,
      category: event.category,
      url: event.url
    }));
  }
  
  /**
   * イベントデータをキャッシュに保存する
   * @param {Array} events - キャッシュするイベントデータ
   */
  cacheEvents(events) {
    eventCache = {
      data: events,
      timestamp: Date.now()
    };
    logger.debug('イベントデータをキャッシュしました');
  }
  
  /**
   * キャッシュが有効かどうか確認する
   * @returns {boolean} キャッシュが有効な場合はtrue
   */
  isCacheValid() {
    if (!env.enableCache || !eventCache.data || !eventCache.timestamp) {
      return false;
    }
    
    const now = Date.now();
    const cacheAge = now - eventCache.timestamp;
    const isValid = cacheAge < (env.cacheDuration * 1000);
    
    return isValid;
  }
  
  /**
   * キャッシュをクリアする
   */
  clearCache() {
    eventCache = {
      data: null,
      timestamp: null
    };
    logger.debug('キャッシュをクリアしました');
  }
}

module.exports = new EventService();
