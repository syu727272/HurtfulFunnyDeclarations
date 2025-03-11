/**
 * イベントコントローラーのユニットテスト
 */

const eventController = require('../../src/controllers/eventController');
const eventService = require('../../src/services/eventService');

// イベントサービスをモック化
jest.mock('../../src/services/eventService');

// loggerをモック化
jest.mock('../../src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('イベントコントローラー', () => {
  // モックリクエスト・レスポンスオブジェクト
  let req;
  let res;
  
  // テスト用のモックデータ
  const mockEvents = [
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
  ];

  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();
    
    // リクエスト・レスポンスモックの設定
    req = {
      query: {},
      app: {
        get: jest.fn().mockReturnValue('development')
      }
    };
    
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    
    // イベントサービスのモック応答をリセット
    eventService.getTokyoEvents.mockReset();
  });

  describe('getTokyoEvents', () => {
    test('正常にイベントを取得してレスポンスで返すこと', async () => {
      // サービスのモック応答を設定
      eventService.getTokyoEvents.mockResolvedValueOnce(mockEvents);
      
      // コントローラーメソッドを実行
      await eventController.getTokyoEvents(req, res);
      
      // サービスが正しいパラメータで呼ばれていることを確認
      expect(eventService.getTokyoEvents).toHaveBeenCalledWith(expect.objectContaining({
        limit: 30
      }));
      
      // レスポンスが正しく設定されていることを確認
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });
    
    test('クエリパラメータが正しく処理されること', async () => {
      // リクエストのクエリパラメータを設定
      req.query = {
        startDate: '2025-03-15',
        endDate: '2025-04-15',
        limit: '10'
      };
      
      // サービスのモック応答を設定
      eventService.getTokyoEvents.mockResolvedValueOnce(mockEvents);
      
      // コントローラーメソッドを実行
      await eventController.getTokyoEvents(req, res);
      
      // サービスが正しいパラメータで呼ばれていることを確認
      expect(eventService.getTokyoEvents).toHaveBeenCalledWith(expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        limit: 10
      }));
    });
    
    test('エラーが発生した場合、適切なエラーレスポンスを返すこと', async () => {
      // サービスのモックエラーを設定
      const errorMessage = 'テスト用エラー';
      eventService.getTokyoEvents.mockRejectedValueOnce(new Error(errorMessage));
      
      // コントローラーメソッドを実行
      await eventController.getTokyoEvents(req, res);
      
      // エラーステータスが設定されていることを確認
      expect(res.status).toHaveBeenCalledWith(500);
      
      // エラーレスポンスが返されていることを確認
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'イベントの取得に失敗しました',
        details: errorMessage
      }));
    });
  });
  
  describe('clearCache', () => {
    test('キャッシュを正常にクリアすること', async () => {
      // コントローラーメソッドを実行
      await eventController.clearCache(req, res);
      
      // サービスのclearCacheメソッドが呼ばれていることを確認
      expect(eventService.clearCache).toHaveBeenCalled();
      
      // 成功レスポンスが返されていることを確認
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });
    
    test('エラーが発生した場合、適切なエラーレスポンスを返すこと', async () => {
      // サービスのモックエラーを設定
      const errorMessage = 'キャッシュクリアエラー';
      eventService.clearCache.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });
      
      // コントローラーメソッドを実行
      await eventController.clearCache(req, res);
      
      // エラーステータスが設定されていることを確認
      expect(res.status).toHaveBeenCalledWith(500);
      
      // エラーレスポンスが返されていることを確認
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'キャッシュのクリアに失敗しました',
        details: errorMessage
      }));
    });
  });
});
