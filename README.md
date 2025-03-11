# Grokイベント取得API（東京都）

## 概要

このアプリケーションはGrok APIを使用して東京都の今後のイベント情報を取得します。RESTful APIエンドポイントを提供し、今日から1ヶ月先までの期間で最大30件のイベント情報をJSON形式で取得できます。

## 機能一覧

- 東京都の今後1ヶ月間のイベント情報を取得
- 最大30件のイベント詳細情報を返却
- 各イベントにつき約10項目のJSONフィールドを含む
- キャッシュ機能（オプションで有効化可能）
- 詳細なロギング機能
- Docker対応による簡単デプロイ
- CI/CDパイプラインによる自動テストとデプロイ

## システム要件

### 必須環境

- Node.js 16+ または Docker
- Grok API Key（XAI_API_KEY）

### 推奨環境

- Node.js 18.x
- npm 9.x
- Docker 24.x & Docker Compose v2

## セットアップ手順

### 環境変数の設定

`.env.example`ファイルを`.env`にコピーして、必要な設定を行います：

```bash
cp .env.example .env
```

`.env`ファイルを編集してGrok APIキーを設定します：

```
XAI_API_KEY=あなたのAPIキー
```

### インストール方法

#### Node.jsを使用する場合：

```bash
# 依存パッケージのインストール
npm install

# アプリケーションの起動
npm start

# 開発モードでの起動（自動再起動あり）
npm run dev
```

#### Dockerを使用する場合：

```bash
# Dockerイメージのビルドと起動
docker-compose up -d

# ログの確認
docker-compose logs -f
```

## APIエンドポイント

### GET /api/events

東京都のイベント情報を取得します。

**クエリパラメータ：**

| パラメータ | 説明 | デフォルト値 |
|----------|------|------------|
| startDate | 検索開始日（YYYY-MM-DD） | 今日 |
| endDate | 検索終了日（YYYY-MM-DD） | 1ヶ月後 |
| limit | 最大取得件数 | 30 |

**レスポンス形式：**
```json
[
  {
    "id": "event123",
    "title": "東京テックフェスティバル",
    "description": "年次技術見本市",
    "startDate": "2025-04-01T10:00:00+09:00",
    "endDate": "2025-04-01T18:00:00+09:00",
    "location": "東京",
    "venue": "東京国際展示場",
    "organizer": "東京テック協会",
    "category": "Technology",
    "url": "https://example.com/events/tokyo-tech-festival"
  },
  ...
]
```

### GET /health

ヘルスチェックエンドポイント。システムの状態を返します。

**レスポンス：**
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2025-03-11T09:00:00Z",
  "version": "1.0.0"
}
```

### POST /api/events/cache/clear

イベントデータのキャッシュをクリアします（管理者用）。

## 開発ガイド

### プロジェクト構造

```
/
├── src/                   # ソースコードディレクトリ
│   ├── config/            # 設定ファイル
│   ├── controllers/       # コントローラー
│   ├── routes/            # ルーティング
│   ├── services/          # サービスレイヤー
│   ├── utils/             # ユーティリティ
│   └── app.js            # Expressアプリケーション設定
├── test/                  # テストディレクトリ
└── server.js             # サーバーエントリーポイント
```

### デバッグモード

デバッグモードを有効にするには、`.env`ファイルで`DEBUG_MODE=true`を設定します。

### テスト実行

```bash
# 全テストの実行
npm test

# カバレッジレポートの確認
npm test -- --coverage
```

### Lintとコード整形

```bash
# コードのlint
npm run lint

# コードの自動整形
npm run format
```

## デプロイ

このアプリケーションにはGitHub Actionsを使用したCI/CDパイプラインが含まれています。
mainブランチにプッシュすると、自動的にテストとデプロイが実行されます。

### 手動デプロイ

```bash
# Dockerイメージのビルド
npm run docker:build

# Dockerコンテナの実行
npm run docker:run
```

## ライセンス

MIT

