# Grokイベント取得API 設計書

## 1. システム概要

### 1.1 目的

本システムは、Grok APIを使用して東京都の今後のイベント情報を取得し、ユーザーに提供するためのREST APIサービスです。
期間は現在から1ヶ月先までの東京都内で開催されるイベントを対象とし、最大30件のイベント情報をJSON形式で提供します。

### 1.2 システム構成

![システム構成図](https://mermaid.ink/img/pako:eNplkL1uwzAMhF-F0OQCHQKoSIa2azYXHTPQFpsIlSVDpI0g8N87DpqhS8ePd9QdacAWsZCgRzE6QIPmYaefpRcDNzHjMXsMeOVt31pBw10yZG_9FGClHtPFf3sBNdU5IlR4QfGY0QpM67PKKL1M3K73y--2CyhPcC80XweuQZdJsOTGsRjsSYNKKThOzO_cXxTrNNpnDcq1M8ZJo-FNSXJXKu9SRB5H9rJiWsqe9nrfqw0ZkpIGYXucPp6Z_0VVWXLI3JpBDGr0SNSurlTIT1B_7JPDMT1XHkvI0kCx8oGEPE-hUw7exf9bCYx1)

### 1.3 技術スタック

- **バックエンド**: Node.js + Express
- **開発言語**: JavaScript
- **パッケージ管理**: npm
- **Docker**: コンテナ化
- **CI/CD**: GitHub Actions
- **テスト**: Jest
- **外部API**: Grok API

## 2. アプリケーション設計

### 2.1 アーキテクチャ

本アプリケーションは以下のレイヤー構造に基づくクリーンアーキテクチャを採用しています：

1. **ルーティング層** (routes)
   - HTTPリクエストのルーティングを担当
   - URLパスとコントローラーメソッドのマッピング

2. **コントローラー層** (controllers)
   - HTTPリクエスト/レスポンスの処理
   - リクエストの検証とパラメータの解析
   - サービス層との連携

3. **サービス層** (services)
   - ビジネスロジックの実装
   - 外部APIとの通信処理
   - データの整形とキャッシュ管理

4. **ユーティリティ層** (utils)
   - 共通機能の提供
   - ロギング、エラーハンドリングなど

5. **設定層** (config)
   - 環境変数の管理
   - アプリケーション設定の一元管理

### 2.2 モジュール構成

```
/home/runner/workspace/
├── src/                       # ソースコードディレクトリ
│   ├── config/                # 設定ファイル
│   │   └── env.js            # 環境変数の管理
│   ├── controllers/          # コントローラー
│   │   └── eventController.js # イベント関連のリクエスト処理
│   ├── routes/               # ルーティング
│   │   ├── eventRoutes.js    # イベントAPIのルート定義
│   │   └── healthRoutes.js   # ヘルスチェックのルート定義
│   ├── services/             # サービスレイヤー
│   │   └── eventService.js   # GrokAPIとの通信処理
│   ├── utils/                # ユーティリティ
│   │   └── logger.js         # ロギングユーティリティ
│   └── app.js               # Expressアプリケーション設定
├── test/                     # テストディレクトリ
│   ├── config/               # 設定のテスト
│   │   └── env.test.js       # 環境変数設定のテスト
│   ├── controllers/          # コントローラーのテスト
│   │   └── eventController.test.js
│   └── services/             # サービスのテスト
│       └── eventService.test.js
├── .env                      # 環境変数（本番用）
├── .env.example              # 環境変数のサンプル
├── .github/workflows/        # GitHub Actions CI/CD設定
│   └── ci-cd.yml             # CI/CDパイプライン
├── .gitignore                # Git除外設定
├── Dockerfile                # Dockerイメージ設定
├── README.md                 # プロジェクト説明
├── DESIGN.md                 # 設計書（本ドキュメント）
├── docker-compose.yaml       # Docker Compose設定
├── package.json              # パッケージ管理
└── server.js                 # サーバーエントリーポイント
```

## 3. API設計

### 3.1 エンドポイント一覧

#### 3.1.1 イベント取得 API

- **エンドポイント**: `GET /api/events`
- **機能**: 東京都の今後のイベント情報を取得
- **クエリパラメータ**:
  - `startDate`: 検索開始日 (YYYY-MM-DD形式、省略時は現在日)
  - `endDate`: 検索終了日 (YYYY-MM-DD形式、省略時は1ヶ月後)
  - `limit`: 最大取得件数 (1-30の整数、デフォルト30)
- **レスポンス**: イベント情報の配列（JSON）

#### 3.1.2 キャッシュクリア API

- **エンドポイント**: `POST /api/events/cache/clear`
- **機能**: イベントデータのキャッシュをクリア
- **レスポンス**: 成功/失敗のステータス（JSON）

#### 3.1.3 ヘルスチェック API

- **エンドポイント**: `GET /health`
- **機能**: アプリケーションの稼働状態確認
- **レスポンス**: システム状態情報（JSON）

### 3.2 データ構造

#### 3.2.1 イベント情報

```json
{
  "id": "イベントID",
  "title": "イベントタイトル",
  "description": "イベント詳細説明",
  "startDate": "開始日時（ISO8601形式）",
  "endDate": "終了日時（ISO8601形式）",
  "location": "場所（都市名）",
  "venue": "会場名",
  "organizer": "主催者",
  "category": "カテゴリ",
  "url": "イベントのURL"
}
```

## 4. 機能詳細

### 4.1 Grok APIとの連携

- **認証方法**: Bearer認証（XAI_API_KEYを使用）
- **API呼び出し**: 非同期通信（Axiosを使用）
- **エラーハンドリング**: リトライ処理なし、エラー時は500エラーを返却

### 4.2 キャッシュ機能

- **キャッシュ方式**: メモリ内キャッシュ
- **キャッシュ期間**: 環境変数`CACHE_DURATION`で指定（秒単位、デフォルト3600秒）
- **キャッシュ制御**: 環境変数`ENABLE_CACHE`で有効/無効を切り替え
- **手動クリア**: 専用エンドポイントによるキャッシュクリア機能

### 4.3 ロギング機能

- **ログレベル**: debug、info、warn、error
- **ログ内容**: タイムスタンプ、ログレベル、メッセージ、追加データ
- **出力先**: 標準出力（コンソール）
- **デバッグモード**: 環境変数`DEBUG_MODE`で有効/無効を切り替え

## 5. 設定項目

### 5.1 環境変数

| 変数名 | 説明 | デフォルト値 | 必須 |
|--------|------|------------|------|
| PORT | サーバーのポート番号 | 3000 | × |
| NODE_ENV | 実行環境（development, production, test） | development | × |
| XAI_API_KEY | Grok APIの認証キー | - | ○ |
| DEBUG_MODE | デバッグモードの有効/無効 | false | × |
| LOG_LEVEL | ログレベル（debug, info, warn, error） | info | × |
| ENABLE_CACHE | キャッシュ機能の有効/無効 | false | × |
| CACHE_DURATION | キャッシュ期間（秒） | 3600 | × |

## 6. テスト戦略

### 6.1 単体テスト

- **対象**: 各モジュール（サービス、コントローラー、設定など）
- **ツール**: Jest
- **モック**: 外部依存（API、環境変数など）はモック化

### 6.2 統合テスト

- **対象**: APIエンドポイント
- **ツール**: Supertest + Jest
- **モック**: 外部API呼び出しはモック化

### 6.3 E2Eテスト

- 現段階では実装なし

## 7. デプロイメント

### 7.1 Docker

- **ベースイメージ**: node:18-alpine
- **公開ポート**: 3000
- **環境変数**: コンテナ起動時に`.env`または環境変数から注入

### 7.2 CI/CD

- **プラットフォーム**: GitHub Actions
- **ワークフロー**:
  1. テスト実行
  2. Dockerイメージビルド
  3. Dockerイメージのプッシュ
  4. （デプロイは現段階では未実装）

## 8. 今後の拡張可能性

1. **認証機能**: API利用者の認証・認可機能の追加
2. **レート制限**: APIの過剰利用を防ぐためのレート制限
3. **データベース連携**: 永続的なデータストアへの対応
4. **ページネーション**: 大量データ取得時のページネーション対応
5. **検索機能の拡張**: キーワードやカテゴリによる検索機能

---

## 9. 改訂履歴

| 日付 | バージョン | 内容 | 担当者 |
|------|----------|------|-------|
| 2025-03-11 | 1.0.0 | 初版作成 | - |
