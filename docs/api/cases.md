# 事例管理API仕様書

## 概要
BRANU営業支援システムの事例管理関連API。事例の検索、取得、作成、更新、削除機能を提供。

## エンドポイント一覧

### 1. 事例検索（公開事例）
```http
GET /api/cases
```

**説明**: 公開された事例を検索・取得

**クエリパラメータ**:
- `keyword`: string (optional) - キーワード検索
- `industries[]`: string[] (optional) - 業種フィルター
- `prefecture`: string (optional) - 都道府県フィルター
- `municipality`: string (optional) - 市区町村フィルター
- `companySize`: string (optional) - 企業規模 (small/medium/large)
- `tags[]`: string[] (optional) - タグフィルター
- `favoriteOnly`: boolean (optional) - お気に入りのみ (default: false)
- `page`: number (optional) - ページ番号 (default: 1)
- `limit`: number (optional) - 1ページあたりの件数 (default: 9, max: 50)

**ソート**:
- **固定仕様**: 作成日降順（新しい順）でソート

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "cases": [
      {
        "id": "case-12345",
        "title": "建設現場の安全管理システム導入事例",
        "basicInfo": {
          "companyName": "株式会社建設太郎",
          "industries": ["土木一式工事業", "建築一式工事業"],
          "mainIndustry": "土木一式工事業",
          "prefecture": "東京都",
          "municipality": "新宿区",
          "companySize": "medium"
        },
        "caseSets": [
          {
            "id": "set-1",
            "title": "安全管理システム導入",
            "tag": "安全管理",
            "challenge": "現場作業員85名の建設現場で月2-3件の軽微な事故が発生...",
            "need": "作業員の安全状況をリアルタイムで把握し...",
            "proposal": "IoTセンサーとAI画像解析を組み合わせた..."
          }
        ],
        "status": "won",
        "tags": ["受注", "安全管理"],
        "isFavorite": false,
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z",
        "createdBy": {
          "id": "user-67890",
          "name": "営業太郎"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "appliedFilters": {
        "industries": ["土木一式工事業"],
        "prefecture": "東京都",
        "tags": ["安全管理"]
      },
      "availableFilters": {
        "industries": ["土木一式工事業", "建築一式工事業", "..."],
        "prefectures": ["東京都", "大阪府", "..."],
        "municipalities": ["新宿区", "渋谷区", "..."],
        "tags": ["受注", "失注", "安全管理", "..."]
      }
    }
  }
}
```

**ステータスコード**:
- `200`: 成功
- `400`: 無効なパラメータ
- `401`: 未認証
- `500`: サーバーエラー

---

### 2. 自分の事例一覧取得
```http
GET /api/cases/my-cases
```

**説明**: ログインユーザーが作成した事例一覧を取得

**クエリパラメータ**:
- `status`: string (optional) - ステータスフィルター (all/in_progress/won/lost, default: all)
- `page`: number (optional) - ページ番号 (default: 1)
- `limit`: number (optional) - 1ページあたりの件数 (default: 9, max: 50)

**ソート**:
- **固定仕様**: 作成日降順（新しい順）でソート

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "cases": [
      {
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
        "caseSets": [
          {
            "id": "set-1",
            "title": "安全管理システム導入",
            "tag": "安全管理",
            "challenge": "現場作業員85名の建設現場で...",
            "need": "作業員の安全状況を...",
            "proposal": "IoTセンサーとAI画像解析を..."
          }
        ],
        "status": "in_progress",
        "tags": ["進行中", "安全管理"],
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z",
        "hearingSessionId": "550e8400-e29b-41d4-a716-446655440000",
        "hearingExpiresAt": "2024-02-14T09:00:00Z"
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

---

### 3. 事例詳細取得
```http
GET /api/cases/{caseId}
```

**説明**: 特定の事例の詳細情報を取得

**パスパラメータ**:
- `caseId`: string (required) - 事例ID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "case": {
      "id": "case-12345",
      "title": "建設現場の安全管理システム導入事例",
      "basicInfo": {
        "companyName": "株式会社建設太郎",
        "industries": ["土木一式工事業", "建築一式工事業"],
        "mainIndustry": "土木一式工事業",
        "prefecture": "東京都",
        "municipality": "新宿区",
        "companySize": "medium"
      },
      "caseSets": [
        {
          "id": "set-1",
          "title": "安全管理システム導入",
          "tag": "安全管理",
          "challenge": "現場作業員85名の建設現場で月2-3件の軽微な事故が発生。リアルタイムでの安全監視体制が不十分で、事故の予防的対策が取れていない状況。",
          "need": "作業員の安全状況をリアルタイムで把握し、危険予知と事故予防を可能にする統合的な安全管理システムが必要。",
          "proposal": "IoTセンサーとAI画像解析を組み合わせた統合安全管理システムの導入。ヘルメットに装着したセンサーで作業員の位置と状態を監視し、危険エリア進入時の自動アラート機能を実装。"
        }
      ],
      "status": "won",
      "tags": ["受注", "安全管理"],
      "isFavorite": true,
      "isOwner": false,
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T09:00:00Z",
      "createdBy": {
        "id": "user-67890",
        "name": "営業太郎"
      }
    }
  }
}
```

**ステータスコード**:
- `200`: 成功
- `404`: 事例が見つからない
- `403`: アクセス権限なし（非公開事例で所有者でない場合）
- `401`: 未認証
- `500`: サーバーエラー

---

### 4. 事例作成
```http
POST /api/cases
```

**説明**: 新しい事例を作成

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "title": "建設現場の安全管理システム導入事例",
  "basicInfo": {
    "companyName": "株式会社建設太郎",
    "industries": ["土木一式工事業", "建築一式工事業"],
    "mainIndustry": "土木一式工事業",
    "prefecture": "東京都",
    "municipality": "新宿区",
    "companySize": "medium"
  },
  "caseSets": [
    {
      "title": "安全管理システム導入",
      "tag": "安全管理",
      "challenge": "現場作業員85名の建設現場で...",
      "need": "作業員の安全状況を...",
      "proposal": "IoTセンサーとAI画像解析を..."
    }
  ],
  "status": "won"
}
```

**レスポンス**:
```json
{
  "data": {
    "case": {
      "id": "case-12345",
      "title": "建設現場の安全管理システム導入事例",
      "status": "won",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  }
}
```

**ステータスコード**:
- `201`: 作成成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `500`: サーバーエラー

---

### 5. 事例更新
```http
PUT /api/cases/{caseId}
```

**説明**: 既存の事例を更新（所有者のみ）

**パスパラメータ**:
- `caseId`: string (required) - 事例ID

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "title": "建設現場の安全管理システム導入事例（更新版）",
  "basicInfo": {
    "companyName": "株式会社建設太郎",
    "industries": ["土木一式工事業"],
    "mainIndustry": "土木一式工事業",
    "prefecture": "東京都",
    "municipality": "新宿区",
    "companySize": "large"
  },
  "caseSets": [
    {
      "id": "set-1",
      "title": "安全管理システム導入",
      "tag": "安全管理",
      "challenge": "更新された課題内容...",
      "need": "更新されたニーズ...",
      "proposal": "更新された提案..."
    }
  ],
  "status": "won"
}
```

**レスポンス**:
```json
{
  "data": {
    "case": {
      "id": "case-12345",
      "title": "建設現場の安全管理システム導入事例（更新版）",
      "updatedAt": "2024-01-20T10:30:00Z"
    }
  }
}
```

**ステータスコード**:
- `200`: 更新成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `403`: 更新権限なし
- `404`: 事例が見つからない
- `500`: サーバーエラー

---

### 6. 事例削除
```http
DELETE /api/cases/{caseId}
```

**説明**: 事例を削除（所有者のみ）

**パスパラメータ**:
- `caseId`: string (required) - 事例ID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "message": "事例が削除されました"
  }
}
```

**ステータスコード**:
- `200`: 削除成功
- `401`: 未認証
- `403`: 削除権限なし
- `404`: 事例が見つからない
- `500`: サーバーエラー

## バリデーション仕様

### 基本情報
- `companyName`: 1-100文字、必須
- `industries`: 1つ以上選択、必須
- `mainIndustry`: industriesに含まれる値、必須
- `prefecture`: 有効な都道府県名、必須
- `municipality`: 0-50文字、任意
- `companySize`: small/medium/large、必須

### 事例セット
- `title`: 1-200文字、必須
- `tag`: 有効なタグ名、必須
- `challenge`: 1-2000文字、必須
- `need`: 1-2000文字、必須
- `proposal`: 1-2000文字、必須

### ステータス
- `status`: in_progress/won/lost、必須

## エラーレスポンス

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値に誤りがあります",
    "details": [
      {
        "field": "basicInfo.companyName",
        "message": "企業名は必須です"
      },
      {
        "field": "caseSets[0].challenge",
        "message": "課題は2000文字以内で入力してください"
      }
    ]
  }
}
```