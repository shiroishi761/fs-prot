# AIヒヤリングAPI仕様書

## 概要
BRANU営業支援システムのAIヒヤリング関連API。Gemini APIを活用した対話型事例収集機能を提供。

## エンドポイント一覧

### 1. AIヒヤリング開始
```http
POST /api/ai-hearing/start
```

**説明**: 基本情報を元にAIヒヤリングセッションを開始

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "basicInfo": {
    "companyName": "株式会社建設太郎",
    "industries": ["土木一式工事業", "建築一式工事業"],
    "mainIndustry": "土木一式工事業",
    "prefecture": "東京都",
    "municipality": "新宿区",
    "companySize": "medium"
  }
}
```

**レスポンス**:
```json
{
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**ステータスコード**:
- `201`: セッション作成成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `500`: サーバーエラー

---

### 2. 会話継続
```http
POST /api/ai-hearing/continue
```

**説明**: AIヒヤリングセッションで会話を継続

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "現場での安全管理に課題があります。月2-3件の軽微な事故が発生しており、リアルタイムでの監視ができていません。"
}
```

**レスポンス**:
```json
{
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**ステータスコード**:
- `200`: 成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `404`: セッションが見つからない
- `410`: セッション期限切れ
- `500`: サーバーエラー

---

### 3. セッション状態取得
```http
GET /api/ai-hearing/session/{sessionId}
```

**説明**: AIヒヤリングセッションの現在状態を取得

**パスパラメータ**:
- `session_id`: string (required) - セッションID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "session": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "basicInfo": {
        "companyName": "株式会社建設太郎",
        "industries": ["土木一式工事業", "建築一式工事業"],
        "mainIndustry": "土木一式工事業",
        "prefecture": "東京都",
        "municipality": "新宿区",
        "companySize": "medium"
      },
      "conversationHistory": [
        {
          "role": "assistant",
          "content": "こんにちは！東京都新宿区の土木一式工事業を主業とする中規模企業「株式会社建設太郎」様の事例収集をお手伝いさせていただきます。",
          "timestamp": "2024-01-15T09:00:00Z"
        },
        {
          "role": "user",
          "content": "現場での安全管理に課題があります。",
          "timestamp": "2024-01-15T09:01:00Z"
        },
        {
          "role": "assistant",
          "content": "安全管理の課題は重要ですね。具体的にはどのような課題でしょうか？",
          "timestamp": "2024-01-15T09:01:30Z"
        }
      ],
      "caseSets": [
        {
          "title": "建設現場の安全管理システム導入事例",
          "tag": "安全管理",
          "challenge": "現場作業員85名の建設現場で月2-3件の軽微な事故が発生。リアルタイムでの安全監視体制が不十分で、事故の予防的対策が取れていない状況。",
          "need": "作業員の安全状況をリアルタイムで把握し、危険予知と事故予防を可能にする統合的な安全管理システムが必要。",
          "proposal": "IoTセンサーとAI画像解析を組み合わせた統合安全管理システムの導入。ヘルメットに装着したセンサーで作業員の位置と状態を監視し、危険エリア進入時の自動アラート機能を実装。"
        }
      ],
      "createdAt": "2024-01-15T09:00:00Z",
      "expiresAt": "2024-02-14T09:00:00Z",
      "remainingDays": 25
    }
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 未認証
- `403`: アクセス権限なし
- `404`: セッションが見つからない
- `410`: セッション期限切れ
- `500`: サーバーエラー

---

### 4. ヒヤリング再開
```http
POST /api/ai-hearing/resume
```

**説明**: 既存の事例からAIヒヤリングを再開

**ヘッダー**:
- `Authorization`: Bearer token
- `Content-Type`: application/json

**リクエストボディ**:
```json
{
  "case_id": "case-12345"
}
```

**レスポンス**:
```json
{
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**処理内容**:
- **Next.js担当**: RDSから基本情報・事例セット・会話履歴を取得、deals.updated_atを更新（30日期限リセット）
- **FastAPI担当**: 新セッションIDを生成、Redisに復元データで新セッションを作成

**ステータスコード**:
- `201`: 再開成功
- `400`: 無効なリクエストデータ
- `401`: 未認証
- `403`: アクセス権限なし（所有者でない）
- `404`: 事例が見つからない
- `422`: 再開不可能なステータス（公開済み事例）
- `500`: サーバーエラー

---

### 5. セッション削除
```http
DELETE /api/ai-hearing/session/{session_id}
```

**説明**: ヒヤリングセッションを削除（一時保存・キャンセル等で使用）

**パスパラメータ**:
- `session_id`: string (required) - セッションID

**ヘッダー**:
- `Authorization`: Bearer token

**レスポンス**:
```json
{
  "data": {
    "message": "セッションが削除されました"
  }
}
```

**一時保存時の処理フロー**:
1. **Next.js担当**: `/api/ai-hearing/session/{session_id}`でRedisからセッションデータを取得
2. **Next.js担当**: 事例データをRDSに保存（status: 'in_progress'）
3. **Next.js担当**: 会話履歴をconversation_historyテーブルに保存
4. **Next.js担当**: このエンドポイントを呼び出してRedisセッション削除
5. **FastAPI担当**: 指定されたRedisセッションを削除

**ステータスコード**:
- `200`: 削除成功
- `401`: 未認証
- `403`: アクセス権限なし
- `404`: セッションが見つからない
- `500`: サーバーエラー

## Redis データ構造

### セッションデータ
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-12345",
  "basic_info": {
    "company_name": "株式会社建設太郎",
    "industries": ["土木一式工事業", "建築一式工事業"],
    "main_industry": "土木一式工事業",
    "prefecture": "東京都",
    "municipality": "新宿区",
    "company_size": "medium"
  },
  "conversation_history": [
    {
      "role": "assistant",
      "content": "初回メッセージ",
      "timestamp": "2024-01-15T09:00:00Z"
    },
    {
      "role": "user",
      "content": "ユーザーの回答",
      "timestamp": "2024-01-15T09:01:00Z"
    }
  ],
  "case_sets": [
    {
      "title": "事例タイトル",
      "tag": "タグ名",
      "challenge": "課題内容",
      "need": "ニーズ内容",
      "proposal": "提案内容"
    }
  ],
  "created_at": "2024-01-15T09:00:00Z",
  "expires_at": "2024-02-14T09:00:00Z"
}
```
