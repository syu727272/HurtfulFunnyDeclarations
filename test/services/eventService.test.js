/**
 * イベントサービスのユニットテスト
 */

const axios = require('axios');
const eventService = require('../../src/services/eventService');
const env = require('../../src/config/env');

// axiosをモック化
jest.mock('axios');

// loggerをモック化
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// 環境設定をモック化
jest.mock('../../src/config/env', () => ({
  xaiApiKey: 'test-api-key',
  enableCache: false,
  cacheDuration: 3600
}));

describe('イベントサービス', () => {
  // テスト用のモックデータ
  const mockApiResponse = {
    data: [
      {
        id: 'event1',
        title: '東京テックフェスティバル',
        description: '年次技術見本市',
        startDate: '2025-04-01T10:00:00+09:00',
        endDate: '2025-04-01T18:00:00+09:00',
        location: 'Tokyo',
        venue: '東京国際展示場',
        organizer: '東京テック協会',
        category: 'Technology',
        url: 'https://example.com/events/tokyo-tech-festival'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // axiosのモックレスポンスをリセット
    axios.get.mockReset();
  });

  describe('getTokyoEvents', () => {
    test('正常に東京のイベントを取得できること', async () => {
      // axiosのモックレスポンスを設定
      axios.get.mockResolvedValueOnce(mockApiResponse);
      
      // テスト対象の関数を実行
      const result = await eventService.getTokyoEvents();
      
      // 期待される結果を検証
      expect(result).toEqual(mockApiResponse.data);
      
      // axiosが正しいパラメータで呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.grok.io/events', 
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          }),
          params: expect.objectContaining({
            location: 'Tokyo',
            limit: 30
          })
        })
      );
    });
    
    test('日付パラメータが指定されている場合、それらが正しく使用されること', async () => {
      // axiosのモックレスポンスを設定
      axios.get.mockResolvedValueOnce(mockApiResponse);
      
      // テスト用の日付
      const startDate = new Date('2025-03-15');
      const endDate = new Date('2025-04-15');
      
      // テスト対象の関数を実行
      await eventService.getTokyoEvents({ startDate, endDate, limit: 10 });
      
      // axiosが正しいパラメータで呼ばれていることを確認
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.grok.io/events', 
        expect.objectContaining({
          params: expect.objectContaining({
            startDate: '2025-03-15',
            endDate: '2025-04-15',
            limit: 10
          })
        })
      );
    });
    
    test('APIエラーが発生した場合、適切にエラーが処理されること', async () => {
      // axiosのモックエラーを設定
      const errorMessage = 'API接続エラー';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // テスト対象の関数を実行し、エラーが投げられることを確認
      await expect(eventService.getTokyoEvents()).rejects.toThrow(`イベント取得に失敗しました: ${errorMessage}`);
    });
  });
  
  describe('キャッシュ機能', () => {
    beforeEach(() => {
      // キャッシュ設定を有効にする
      jest.spyOn(env, 'enableCache', 'get').mockReturnValue(true);
      
      // イベントサービス内のキャッシュをクリア
      eventService.clearCache();
    });
    
    test('キャッシュが有効な場合、2回目以降のリクエストではAPIが呼ばれないこと', async () => {
      // axiosのモックレスポンスを設定
      axios.get.mockResolvedValueOnce(mockApiResponse);
      
      // 1回目のリクエスト
      await eventService.getTokyoEvents();
      expect(axios.get).toHaveBeenCalledTimes(1);
      
      // 2回目のリクエスト
      await eventService.getTokyoEvents();
      // axiosが再度呼ばれていないことを確認
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
    
    test('clearCache関数が正しくキャッシュをクリアすること', async () => {
      // axiosのモックレスポンスを設定
      axios.get.mockResolvedValue(mockApiResponse);
      
      // 1回目のリクエスト
      await eventService.getTokyoEvents();
      expect(axios.get).toHaveBeenCalledTimes(1);
      
      // キャッシュをクリア
      eventService.clearCache();
      
      // 2回目のリクエスト
      await eventService.getTokyoEvents();
      // キャッシュがクリアされたので、axiosが再度呼ばれることを確認
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('formatEvents', () => {
    test('APIレスポンスを正しくフォーマットすること', () => {
      const result = eventService.formatEvents(mockApiResponse.data);
      expect(result).toEqual(mockApiResponse.data);
    });
    
    test('APIレスポンスが配列でない場合、空配列を返すこと', () => {
      const result = eventService.formatEvents('not an array');
      expect(result).toEqual([]);
    });
  });
});
