# お気に入りAPI仕様書

## 概要
BRANU営業支援システムのお気に入り機能関連API。ユーザーごとの事例お気に入り登録・解除・取得機能を提供。

## エンドポイント一覧

### 1. お気に入り追加
```http
POST /api/favorites
```

**説明**: 事例をお気に入りに追加

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "caseId": "case-12345"
}
```

**レスポンス**:
```json
{
  "data": {
    "caseId": "case-12345",
    "isFavorite": true,
    "addedAt": "2024-01-15T09:00:00Z"
  }
}
```

**ステータスコード**:
- `201`: 追加成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `404`: 事例が見つからない
- `409`: 既にお気に入り登録済み
- `500`: サーバーエラー

---

### 2. お気に入り削除
```http
DELETE /api/favorites/{caseId}
```

**説明**: 事例をお気に入りから削除

**パスパラメータ**:
- `caseId`: string (required) - 事例ID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "caseId": "case-12345",
    "isFavorite": false,
    "removedAt": "2024-01-15T09:00:00Z"
  }
}
```

**ステータスコード**:
- `200`: 削除成功
- `401`: 未認証
- `404`: お気に入り登録が見つからない
- `500`: サーバーエラー

---

### 3. お気に入り状態確認
```http
GET /api/favorites/{caseId}
```

**説明**: 特定の事例のお気に入り状態を確認

**パスパラメータ**:
- `caseId`: string (required) - 事例ID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "caseId": "case-12345",
    "isFavorite": true,
    "addedAt": "2024-01-15T09:00:00Z"
  }
}
```

**お気に入り未登録時**:
```json
{
  "data": {
    "caseId": "case-12345",
    "isFavorite": false
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 未認証
- `404`: 事例が見つからない
- `500`: サーバーエラー

---

### 4. お気に入り一覧取得
```http
GET /api/favorites
```

**説明**: ユーザーのお気に入り事例一覧を取得

**クエリパラメータ**:
- `page`: number (optional) - ページ番号 (default: 1)
- `limit`: number (optional) - 1ページあたりの件数 (default: 20, max: 100)
- `sortBy`: string (optional) - ソート基準 (addedAt/case.createdAt, default: addedAt)
- `sortOrder`: string (optional) - ソート順 (asc/desc, default: desc)

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "favorites": [
      {
        "caseId": "case-12345",
        "addedAt": "2024-01-15T09:00:00Z",
        "case": {
          "id": "case-12345",
          "title": "建設現場の安全管理システム導入事例",
          "basicInfo": {
            "companyName": "株式会社建設太郎",
            "industries": ["土木一式工事業"],
            "mainIndustry": "土木一式工事業",
            "prefecture": "東京都",
            "municipality": "新宿区",
            "companySize": "medium"
          },
          "tags": ["受注", "安全管理"],
          "status": "won",
          "createdAt": "2024-01-10T08:00:00Z",
          "createdBy": {
            "id": "user-67890",
            "name": "営業太郎"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 未認証
- `500`: サーバーエラー

## 設計方針

### お気に入り状態の効率的な取得
- **事例一覧**: `GET /api/cases`レスポンスの`isFavorite`フィールドで状態確認
- **個別確認**: `GET /api/favorites/{caseId}`で必要に応じて個別確認
- **一覧表示**: `GET /api/favorites`でお気に入り事例のみ表示

### シンプルなAPI設計
- 必要最小限の4つのエンドポイントで全機能を提供
- 複雑な一括処理や統計APIは実装しない
- 既存APIの組み合わせで十分な機能性を確保

