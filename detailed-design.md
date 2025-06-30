# 詳細設計書

## 概要

建設業界向け営業支援システム「BRANU」の詳細設計書。Next.js 15 + FastAPI + PostgreSQL構成で、Amazon Bedrock (Claude 3) を活用したAI powered な事例管理と検索機能を提供。

## データベース設計

### テーブル一覧

| テーブル名 | 説明 |
|-----------|------|
| users | ユーザー情報（AWS Cognito連携） |
| companies | 会社情報 |
| company_sizes | 会社規模マスター |
| deals | 商談情報 |
| cases | 事例情報 |
| case_challenges | 事例課題詳細 |
| case_needs | 事例ニーズ詳細 |
| case_proposals | 事例提案詳細 |
| user_favorites | お気に入り |
| industries | 業種マスター |
| company_industries | 会社-業種関連 |
| tags | タグマスター |
| case_tags | 事例-タグ関連 |
| regions | 地域マスター |
| prefectures | 都道府県マスター |
| cities | 市区町村マスター |

### 詳細テーブル設計

#### users（ユーザー）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| cognito_id | VARCHAR(255) | UNIQUE, NOT NULL | Cognito ID |
| name | VARCHAR(100) | NOT NULL | ユーザー名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | メールアドレス |
| role | VARCHAR(20) | NOT NULL | 権限(admin, user) |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### companies（会社）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| name | VARCHAR(255) | NOT NULL | 会社名 |
| size_id | UUID | FOREIGN KEY | 規模ID |
| region_id | UUID | FOREIGN KEY | 地域ID |
| prefecture_id | UUID | FOREIGN KEY | 都道府県ID |
| city_id | UUID | FOREIGN KEY | 市区町村ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### company_sizes（会社規模マスター)
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| code | VARCHAR(20) | UNIQUE, NOT NULL | 規模コード |
| name | VARCHAR(50) | NOT NULL | 規模名称 |
| sort_order | INTEGER | DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### deals（商談）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| title | VARCHAR(255) | NOT NULL | 商談タイトル |
| company_id | UUID | FOREIGN KEY | 会社ID |
| user_id | UUID | FOREIGN KEY | 作成者ID |
| deal_status | VARCHAR(20) | NOT NULL | 商談状況(won, lost, in_progress) |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### cases（事例）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| deal_id | UUID | FOREIGN KEY | 商談ID |
| title | VARCHAR(255) | NOT NULL | 事例タイトル |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### case_challenges（事例課題）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| case_id | UUID | FOREIGN KEY | 事例ID |
| content | TEXT | NOT NULL | 課題内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### case_needs（事例ニーズ）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| case_id | UUID | FOREIGN KEY | 事例ID |
| content | TEXT | NOT NULL | ニーズ内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### case_proposals（事例提案）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| case_id | UUID | FOREIGN KEY | 事例ID |
| content | TEXT | NOT NULL | 提案内容 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### user_favorites（お気に入り）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| user_id | UUID | FOREIGN KEY | ユーザーID |
| case_id | UUID | FOREIGN KEY | 事例ID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### industries（業種）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| name | VARCHAR(100) | UNIQUE, NOT NULL | 業種名 |
| sort_order | INTEGER | DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### company_industries（会社業種関連）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| company_id | UUID | FOREIGN KEY | 会社ID |
| industry_id | UUID | FOREIGN KEY | 業種ID |
| is_main | BOOLEAN | DEFAULT FALSE | 主要業種フラグ |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### tags（タグ）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| name | VARCHAR(50) | UNIQUE, NOT NULL | タグ名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### case_tags（事例タグ関連）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| case_id | UUID | FOREIGN KEY | 事例ID |
| tag_id | UUID | FOREIGN KEY | タグID |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### regions（地域）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| code | VARCHAR(10) | UNIQUE, NOT NULL | 地域コード |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 地域名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### prefectures（都道府県）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| region_id | UUID | FOREIGN KEY | 地域ID |
| code | VARCHAR(10) | UNIQUE, NOT NULL | 都道府県コード |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 都道府県名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

#### cities（市区町村）
| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | UUID |
| prefecture_id | UUID | FOREIGN KEY | 都道府県ID |
| code | VARCHAR(10) | UNIQUE, NOT NULL | 市区町村コード |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 市区町村名 |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

## アーキテクチャ設計

### システム構成
- **Next.js 15**: フロントエンド + バックエンドAPI
- **FastAPI**: AI機能特化（Amazon Bedrock連携）
- **PostgreSQL**: データベース（AWS RDS Multi-AZ）
- **AWS App Runner**: コンテナデプロイ（Next.js + FastAPI）
- **Amazon Bedrock**: Claude 3によるAIヒヤリング機能

### データベース接続方式
- **Next.js**: PostgreSQLに接続（全ての事例管理、ユーザー管理）
- **FastAPI**: データベース接続なし（AI処理専用）

### サービス間通信
- **認証方式**: INTERNAL_API_KEY（本番環境のみ）
- **通信プロトコル**: HTTPS（VPC内通信）
- **データフロー**: FastAPI AI処理完了 → 構造化データをNext.jsに返却

## AI機能設計

### Amazon Bedrock統合
- **モデル**: Claude(Anthropic)
- **用途**: 営業ヒヤリング、事例構造化
- **FastAPI役割**: Bedrockとの通信、プロンプト管理
- **レスポンス処理**: 自然言語 → 構造化データ変換

### AIヒヤリングフロー
1. **Next.js**: 基本情報入力 → FastAPI呼び出し
2. **FastAPI**: Bedrock連携 → 対話実行
3. **FastAPI**: 結果構造化 → Next.jsに構造化データ返却
4. **Next.js**: AIデータ受信 → 確認・編集画面表示
5. **Next.js**: 一時保存/最終保存ボタン → 自DB保存

### 詳細な画面遷移・データフロー

#### 事例作成ワークフロー
```
基本情報入力 → AIヒヤリング → 確認・編集 → 保存
     ↓              ↓           ↓        ↓
CaseAddForm → CaseCollector → CaseReviewEdit → PostgreSQL
```

#### AIヒヤリング詳細フロー

**1. AIヒヤリングボタン押下時**
```
POST /api/ai-interview (Next.js API Route)
{
  "userId": "cognito-user-id",
  "basicInfo": {
    "companyName": "株式会社例",
    "industries": ["建設業", "製造業"],
    "mainIndustry": "建設業",
    "region": "関東",
    "prefecture": "東京都",
    "city": "新宿区",
    "companySize": "medium"
  },
  "conversationHistory": []  // 空配列（初回）
}

↓ Next.js API Route → FastAPI プロキシ

POST /ai-interview/process (FastAPI)
- Amazon Bedrock (Claude 3) 呼び出し
- 基本情報を踏まえた最初の挨拶メッセージ生成

↓ FastAPIレスポンス

{
  "success": true,
  "message": "こんにちは！基本情報を確認いたしました...",
  "aiData": null  // 初回は構造化データなし
}
```

**2. ユーザーメッセージ送信時（ステートレス）**
```
POST /api/ai-interview (同一エンドポイント)
{
  "userId": "cognito-user-id",
  "basicInfo": { /* 会社情報 */ },
  "conversationHistory": [
    {"role": "assistant", "content": "最初の挨拶"},
    {"role": "user", "content": "現場での安全管理に課題があります"},
    {"role": "assistant", "content": "具体的にはどのような..."}
  ]
}

↓ FastAPI処理

- 全会話履歴をBedrock送信
- AI応答生成
- 十分な情報収集後に構造化データ抽出

↓ レスポンス

{
  "success": true,
  "message": "それは重要な課題ですね...",
  "aiData": [  // 十分な情報が集まった場合のみ（初回は通常null）
    {
      "title": "建設現場の安全管理改善",
      "challenge": "現場での安全事故が多発している",
      "need": "リアルタイムでの安全監視システム",
      "proposal": "IoTセンサーによる危険検知システムの導入"
    }
  ]
}
```

**3. 保存ボタンの有効化条件**
```typescript
// FastAPIから構造化データを受信した時点で保存可能
useEffect(() => {
  if (response.aiData && response.aiData.length > 0) {
    setCanTemporarySave(true);  // 一時保存ボタン有効化
    // ユーザーに進捗を通知
    showNotification('事例情報が整理されました！保存できます。');
  }
}, [response]);
```

#### 会話継続の仕組み
- **ステートレス設計**: 毎回全会話履歴を送信
- **会話状態管理**: フロントエンド（CaseCollector）で実装
- **履歴制限**: 最新10件のみ保持（パフォーマンス考慮）
- **whileループ不要**: 各メッセージごとに個別API呼び出し

#### 保存オプション
**一時保存ボタン**
```typescript
// 基本的な事例データを生成
const basicCaseData = {
  title: `${basicInfo?.companyName}との商談`,
  companyName: basicInfo?.companyName,
  // ... 基本情報
  orderStatus: 'in_progress'  // My Casesのみ表示
};
```

**追加ボタン（確認・編集画面へ）**
```typescript
// AI生成データまたは基本データを渡す
onReviewEdit(caseData, messages, conversationHistory);
```

## データフロー設計

### FastAPI API仕様

#### AIヒヤリング実行API
- **エンドポイント**: `POST /ai-interview/process`
- **リクエスト**: ユーザーID + 基本情報 + 対話履歴
- **レスポンス**: 構造化されたAIデータ（課題・ニーズ・提案）
- **処理**: Bedrock連携のみ、DB保存なし
- **通信方式**: HTTP POST（ステートレス）

#### データ整合性制御

**Phase 1: 完全送信方式**（初期実装）
- 毎回全ての対話履歴をNext.js → FastAPIに送信
- シンプルで実装が容易
- 会話履歴保存機能なし

**Phase 2: セッション管理方式**（将来拡張）
- セッションIDによる対話状態管理
- 新しいメッセージのみ送信で効率化
- 会話履歴のDB保存機能と連携

### Next.js ↔ FastAPI 通信

#### Next.js → FastAPI リクエスト（Phase 1）
```json
{
  "userId": "cognito-user-id",
  "basicInfo": {
    "companyName": "...",
    "industries": [...],
    "region": "...",
    "size": "..."
  },
  "conversationHistory": [
    {"role": "user", "content": "現場での課題を教えてください"},
    {"role": "assistant", "content": "どのような作業現場でしょうか？"},
    {"role": "user", "content": "建設現場での安全管理です"}
  ]
}
```

#### 将来のセッション管理リクエスト（Phase 2）
```json
{
  "sessionId": "uuid-session-123",
  "userId": "cognito-user-id",
  "newMessage": {
    "role": "user", 
    "content": "追加の課題があります"
  }
}
```

#### FastAPI → Next.js レスポンス
```json
{
  "success": true,
  "aiData": [
    {
      "title": "建設現場の安全管理改善",
      "challenge": "現場での安全事故が多発している",
      "need": "リアルタイムでの安全監視システム",
      "proposal": "IoTセンサーによる危険検知システムの導入"
    },
    {
      "title": "作業効率の向上", 
      "challenge": "手作業による進捗管理で遅延が発生",
      "need": "デジタル化による工程管理の最適化",
      "proposal": "クラウド型プロジェクト管理システムの導入"
    }
  ]
}
```

### Next.js側のDB保存
- **編集画面**: FastAPIから受信したAIデータを表示・編集可能
- **一時保存**: `orderStatus = 'in_progress'`でDB保存
- **最終保存**: `orderStatus = 'won'/'lost'`でDB保存
- **保存処理**: Next.js API Routesで実装

## Next.js API Routes設計

### 事例管理API

#### 事例履歴取得（My Cases）
- **エンドポイント**: `POST /api/cases/my-cases`
- **リクエスト**: ユーザーID + 公開ステータスフィルター + ページネーション
- **レスポンス**: ユーザーの事例履歴 + ページネーション情報
- **用途**: My Cases画面での表示

**リクエスト**
```json
{
  "userId": "cognito-user-id",
  "filters": {
    "publicationStatus": "all"  // "all" | "published" | "unpublished"
  },
  "pagination": {
    "page": 1,
    "limit": 9
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "事例タイトル",
      "companyName": "会社名",
      "orderStatus": "in_progress",  // "won" | "lost" | "in_progress"
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 9,
    "total": 14,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### 事例詳細取得
- **エンドポイント**: `GET /api/cases/[id]`
- **パラメータ**: `id` (Case UUID)
- **レスポンス**: 事例詳細データ

#### 事例作成・更新
- **エンドポイント**: `POST /api/cases` (新規作成) / `PUT /api/cases/{caseId}` (更新)
- **リクエスト**: 事例データ + `orderStatus`
- **処理**: 新規作成 or 既存更新

**事例更新（編集画面）**
```json
PUT /api/cases/{caseId}
{
  "title": "編集されたタイトル",
  "companyName": "企業名",
  "industry": "建設業",
  "region": "関東",
  "prefecture": "東京都",
  "city": "新宿区",
  "companySize": "medium",
  "orderStatus": "won",  // "won" | "lost" | "in_progress"
  "challenges": ["課題1", "課題2"],
  "challengeSummaries": ["課題要約1", "課題要約2"],
  "needs": ["ニーズ1", "ニーズ2"],
  "proposals": ["提案1", "提案2"]
}
```

#### 事例削除
- **エンドポイント**: `DELETE /api/cases/{caseId}`
- **パラメータ**: `caseId` (Case UUID)
- **処理**: 論理削除 or 物理削除
- **削除フロー**: 削除ボタン → 確認アラート → 削除実行 → My Cases一覧更新

**確認アラート仕様**
```typescript
// フロントエンド実装
const handleDelete = async (caseId: string) => {
  const confirmed = window.confirm('本当に削除しますか？');
  if (confirmed) {
    await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
    // My Cases一覧を再取得
  }
};
```

### 検索・フィルタリングAPI

#### 事例検索・一覧取得
- **エンドポイント**: `POST /api/cases/search`
- **リクエスト**: 検索条件 + ページネーション + ソート条件
- **レスポンス**: 検索結果 + ページネーション情報
- **用途**: デフォルト表示・検索実行の両方に使用

**デフォルト表示（全件取得）**
```json
{
  "filters": {},  // 空オブジェクト = 全件
  "pagination": {
    "page": 1,
    "limit": 6
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  }
}
```

**検索実行時**
```json
{
  "filters": {
    "keyword": "安全管理",
    "industries": ["建設業", "製造業"],
    "regions": ["関東", "関西"],
    "companySize": ["medium", "large"],
    "publicationStatus": "published"
  },
  "pagination": {
    "page": 1,
    "limit": 6
  },
  "sort": {
    "field": "createdAt",
    "order": "desc"
  }
}
```

**レスポンス**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "事例タイトル",
      "companyName": "会社名",
      "industry": "建設業",
      "region": "関東",
      "createdAt": "2024-01-01T00:00:00Z",
      // ... その他の事例データ
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 14,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### AI連携API

#### AIヒヤリング実行
- **エンドポイント**: `POST /api/ai-interview`
- **リクエスト**: 基本情報 + 対話履歴
- **処理**: FastAPIへのプロキシ + レスポンス加工
- **レスポンス**: 構造化されたAIデータ

### ユーザー管理API

#### ユーザー情報取得
- **エンドポイント**: `GET /api/users/me`
- **認証**: Cognito トークン検証
- **レスポンス**: ユーザープロフィール

#### お気に入り管理
- **エンドポイント**: `POST /api/favorites`
- **リクエスト**: `caseId`, `action` ('add' | 'remove')
- **処理**: お気に入り状態の切り替え

### マスターデータAPI

#### 業種一覧
- **エンドポイント**: `GET /api/industries`
- **レスポンス**: 業種マスター

#### 地域一覧
- **エンドポイント**: `GET /api/regions`
- **レスポンス**: 地域マスター（都道府県、市区町村含む）

#### 会社規模一覧
- **エンドポイント**: `GET /api/company-sizes`
- **レスポンス**: 会社規模マスター

## 認証設計

### 基本方針
- **AWS Cognito** を使用
- **Google認証** によるソーシャルログイン
- **Remember Me機能**: AWS Cognitoの長期間トークン + localStorage活用によるシンプル実装
- **サービス間認証**: INTERNAL_API_KEY（環境別設定）

### 画面遷移・認証フロー

#### ログイン処理
```
[ログイン画面] → Googleログインボタン → [AWS Cognito認証] → [事例検索画面]
```

#### 認証データフロー
**通常ログイン**
```
1. ユーザー: 「Googleでログイン」ボタン押下
2. Frontend: AWS Cognito → Google OAuth連携
3. Google: 認証成功 → 認証トークン返却
4. AWS Cognito: Googleトークン検証 → JWTトークン発行
5. Frontend: JWTトークンを受信・保存
6. 画面遷移: 事例検索画面へリダイレクト
```

**Remember Me機能付きログイン**
```
1. ユーザー: 「ログイン状態を保持する」チェック + ログインボタン
2. Frontend: localStorage/sessionStorageに長期保存フラグ設定
3. AWS Cognito: 長期間有効なリフレッシュトークン発行
4. Frontend: accessToken・refreshToken・rememberMeフラグをlocalStorageに保存
5. 画面遷移: 事例検索画面へ
```

### JWT トークン管理

#### トークン種別
- **Access Token** (JWT): API認証用、1時間有効
- **ID Token** (JWT): ユーザー情報用
- **Refresh Token**: 自動更新用、長期間有効

#### localStorage保存データ構造
```typescript
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "rememberMe": true,
  "userInfo": {
    "cognitoId": "user-uuid",
    "email": "user@example.com",
    "name": "ユーザー名"
  }
}
```

#### 自動ログイン処理
```
1. アプリ起動時: localStorage確認
2. rememberMe=true かつ有効なトークン存在
3. → 自動的に事例検索画面表示
4. トークン期限切れ時: refreshTokenで自動更新
```

### API認証システム

#### Next.js API Routes認証
```typescript
// 全てのAPI リクエスト
Headers: {
  "Authorization": "Bearer ${accessToken}",
  "Content-Type": "application/json"
}

// バックエンドでJWT検証
const user = await verifyToken(accessToken); // AWS Cognito公開鍵で検証
```

#### JWT検証プロセス
```
1. フロントエンド: Authorization: Bearer eyJ... をヘッダーに付与
2. バックエンド: JWTトークンを受信
3. バックエンド: AWS Cognito公開鍵でトークン署名を検証
4. バックエンド: トークンの有効期限・発行者を確認
5. バックエンド: 検証成功 → API処理続行 / 失敗 → 401エラー
```

#### 認証エラー時の処理
```
1. API応答: 401 Unauthorized
2. Frontend: refreshTokenで再認証試行
3. 成功: 元のAPI再実行
4. 失敗: ログイン画面へリダイレクト
```

### サービス間認証

#### Next.js ↔ FastAPI通信
```typescript
// Next.js → FastAPI (内部通信)
Headers: {
  "X-Internal-API-Key": "${INTERNAL_API_KEY}",
  "Content-Type": "application/json"
}
```

#### FastAPI側認証チェック
```python
@app.post("/ai-interview/process")
async def process_interview(
    request: InterviewRequest,
    api_key: str = Header(alias="X-Internal-API-Key")
):
    if api_key != INTERNAL_API_KEY:
        raise HTTPException(401, "Unauthorized")
    # AI処理のみ実行
```

### 環境別セキュリティ
- **開発環境**: 簡易キーまたは認証なし
- **本番環境**: 厳格なINTERNAL_API_KEY + AWS Parameter Store

## 実装上の重要ポイント

### セキュリティ考慮事項
- **JWT署名検証**: AWS Cognito公開鍵による確実な検証
- **INTERNAL_API_KEY**: Next.js ↔ FastAPI間の内部API保護
- **環境変数管理**: 機密情報の適切な管理
- **CORS設定**: 適切なオリジン制限
- **トークン期限**: Access Token 1時間、適切な自動更新

### UX・パフォーマンス最適化
- **Remember Me**: 自動ログインによるシームレスな体験
- **ステートレス設計**: スケーラブルなAI会話システム
- **エラーハンドリング**: 401エラー時の自動再認証
- **履歴制限**: 会話履歴10件制限によるパフォーマンス確保
- **ローディング状態**: AI処理中の適切なフィードバック

### 開発・運用上の注意点

#### 責任分界
- **Next.js担当**: 認証、UI、データベース操作、ユーザー管理
- **FastAPI担当**: AI処理（Amazon Bedrock連携）のみ

#### エラー対応
```typescript
// 認証エラー処理例
try {
  const response = await fetch('/api/cases', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (response.status === 401) {
    // リフレッシュトークンで再認証試行
    await refreshAccessToken();
    // 元のAPI再実行
  }
} catch (error) {
  // ログイン画面へリダイレクト
}
```

#### 環境設定
```bash
# 必要な環境変数
COGNITO_USER_POOL_ID=us-west-2_xxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxx
INTERNAL_API_KEY=secure-random-key-for-production
FASTAPI_ENDPOINT=https://fastapi.example.com
```

### データ整合性
- **事例作成**: 一時保存 (`in_progress`) → 最終保存 (`won`/`lost`)
- **会話履歴**: フロントエンドで管理、必要時のみDB保存
- **AI生成データ**: 確認・編集画面での検証後DB保存
- **認証状態**: localStorage + JWT検証による二重管理

## My Cases機能設計

### 画面遷移フロー
```
[事例検索画面] → 事例履歴ボタン → [My Cases一覧] → 編集ボタン → [編集画面] → 保存/キャンセル
                                      ↓
                                   削除ボタン → 確認アラート → 削除実行
```

### My Cases一覧画面仕様

#### 表示ルール
- **デフォルト**: 公開ステータス「すべて表示」
- **ソート**: 作成日降順（新しい順）
- **ページネーション**: 最大9件表示
- **フィルター**: 公開済み（受注/失注）・非公開（進行中）・すべて表示

#### 公開ステータス詳細
- **進行中** (`in_progress`): AIヒヤリング完了後、商談結果未確定
- **受注** (`won`): 商談成功、公開対象
- **失注** (`lost`): 商談失敗、公開対象

#### 表示制御
- **事例検索画面**: `published` (受注・失注) のみ表示
- **My Cases画面**: 全ステータス表示可能（フィルター切り替え）

### 編集画面仕様

#### 機能
- **基本情報編集**: 企業名、業種、地域、タイトル
- **商談結果選択**: 受注・失注・進行中
- **課題・ニーズ・提案**: セット単位での編集・追加
- **保存**: 編集内容を反映してMy Cases一覧に戻る
- **キャンセル**: 編集内容を破棄してMy Cases一覧に戻る

#### 編集可能項目
- 基本情報（企業名、業種、地域等）
- 事例タイトル
- 商談結果（orderStatus）
- 課題・ニーズ・提案の内容
- 課題要約（カード表示用）

## 事例詳細モーダル機能設計

### 画面仕様

#### 表示トリガー
- **事例検索画面**: 事例カードクリック → 詳細モーダル表示
- **My Cases画面**: 事例カードクリック → 詳細モーダル表示

#### モーダル構成
```
┌─ 事例詳細モーダル ─────────────────┐
│ ✕ 閉じるボタン                     │
│                                   │
│ 【基本情報】                      │
│ ・会社名、業種、地域、企業規模    │
│                                   │
│ 【課題カード】（アコーディオン）  │
│ ▼ 繁忙期と閑散期格差で稼働率45%低下│
│   [詳細内容]                      │
│                                   │
│ 【ニーズカード】（アコーディオン）│
│ ▼ 職人の多能工化による...         │
│   [詳細内容]                      │
│                                   │
│ 【提案カード】（受注時のみ）      │
│ ▼ CAREECONの統合スキル...         │
│   [詳細内容]                      │
│                                   │
│ ← → ナビゲーション（複数カードある場合）│
│                                   │
│ 作成日: 2024/12/15                │
└───────────────────────────────────┘
```

### アコーディオンUI仕様

#### 初期状態・操作
- **すべて閉じた状態**: タイトルのみ表示
- **クリック**: カード展開、詳細内容表示
- **アイコン**: ▼（閉じた状態）→ ▲（開いた状態）

#### カード表示ルール
- **課題**: 常に表示
- **ニーズ**: 常に表示
- **提案**: `orderStatus = 'won'`（受注）の場合のみ表示

#### 複数カードのナビゲーション
- **表示条件**: 各カテゴリで複数カードがある場合
- **操作**: 左右矢印でカード切り替え
- **実装**: カテゴリ別のカード現在位置を管理

### 事例詳細API

#### 事例詳細取得
- **エンドポイント**: `GET /api/cases/{caseId}`
- **用途**: モーダル表示時の詳細データ取得

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "専門工事業の多能工化を支援",
    "companyName": "青森総合工業株式会社",
    "industry": "その他専門工事業",
    "region": "東北",
    "prefecture": "青森県",
    "city": "青森市", 
    "companySize": "中規模（50-300名）",
    "orderStatus": "won",
    "challenges": [
      {
        "title": "繁忙期と閑散期格差で稼働率45%低下",
        "content": "電気工事専門で社員25名だが..."
      }
    ],
    "needs": [
      {
        "title": "職人の多能工化による安定収益",
        "content": "職人の多能工化により閑散期でも..."
      }
    ],
    "proposals": [
      {
        "title": "CAREECONの統合スキル管理システム", 
        "content": "CAREECONの統合スキル管理システムと..."
      }
    ],
    "createdAt": "2024-12-15T00:00:00Z",
    "updatedAt": "2024-12-15T00:00:00Z"
  }
}
```

### 実装詳細

#### 状態管理
```typescript
// アコーディオン状態管理
const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
const [currentCardIndex, setCurrentCardIndex] = useState<{[key: string]: number}>({
  challenges: 0,
  needs: 0,
  proposals: 0
});
```

#### UI操作
- **モーダル表示**: 事例カードクリック → API呼び出し → モーダル表示
- **アコーディオン**: カードタイトルクリック → 展開/折りたたみ
- **ナビゲーション**: 矢印クリック → カードインデックス更新
- **モーダル閉じる**: ✕ボタンまたは背景クリック

## 事例作成ワークフロー設計

### 完全な画面遷移フロー
```
[サイドバー：事例追加] 
         ↓
[基本情報入力画面] → AIヒヤリング開始
         ↓
[AIヒヤリング画面] → 一時保存 OR 追加ボタン
         ↓                    ↓
[My Cases画面]           [確認・編集画面]
（非公開・ヒヤリング再開）     ↓
                        受注/失注選択 → 保存
                             ↓
                     [検索画面・My Cases画面に表示]
```

### サイドバーからの事例追加

#### 事例追加ボタン
- **場所**: サイドバー「事例追加」
- **遷移先**: 基本情報入力画面（CaseAddForm）
- **機能**: 新規事例作成の開始点

#### 基本情報入力画面仕様
- **企業名**: テキスト入力（必須）
- **業種**: チェックボックス複数選択（必須、メイン業種選択）
- **地域・都道府県・市区町村**: 3段階プルダウン選択（必須）
- **企業規模**: プルダウン選択（必須）
- **バリデーション**: 全項目入力必須
- **次へボタン**: 「AIヒヤリング開始」

#### バリデーションルール
```typescript
const validateBasicInfo = (data: CaseBasicInfo) => {
  const errors = [];
  if (!data.companyName) errors.push('企業名は必須です');
  if (!data.industry.length) errors.push('業種を選択してください');
  if (!data.mainIndustry) errors.push('メイン業種を選択してください');
  if (!data.region || !data.prefecture) errors.push('地域を選択してください');
  if (!data.companySize) errors.push('企業規模を選択してください');
  return errors;
};
```

### AIヒヤリング・保存機能

#### AIヒヤリング画面
- **初期メッセージ**: 基本情報を踏まえた挨拶
- **FastAPI連携**: `/api/ai-interview` エンドポイント使用
- **会話履歴管理**: フロントエンドで状態管理
- **ボタン**: 一時保存・追加（確認画面へ）

#### 一時保存機能
- **表示条件**: FastAPIから構造化データ（aiData）を受信後のみ有効
- **初期状態**: ボタン無効、説明テキスト表示

```typescript
const [canTemporarySave, setCanTemporarySave] = useState(false);
const [aiDataReceived, setAiDataReceived] = useState(null);

// FastAPIからaiDataが返ってきた時
useEffect(() => {
  if (aiDataReceived && aiDataReceived.length > 0) {
    setCanTemporarySave(true);
  }
}, [aiDataReceived]);

const handleTemporarySave = async () => {
  const caseData = {
    ...basicInfo,
    title: `${basicInfo.companyName}との商談`,
    orderStatus: 'in_progress',
    // AI生成データを使用
    challenges: aiDataReceived.map(item => item.challenge),
    needs: aiDataReceived.map(item => item.need),
    proposals: aiDataReceived.map(item => item.proposal)
  };
  
  await fetch('/api/cases', {
    method: 'POST',
    body: JSON.stringify(caseData)
  });
  
  // My Cases画面に遷移
  router.push('/my-cases');
};
```

#### ボタン状態管理
```typescript
// 一時保存ボタン
<button
  onClick={handleTemporarySave}
  disabled={isLoading || !canTemporarySave}
  className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
    ${canTemporarySave 
      ? 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500' 
      : 'opacity-50 cursor-not-allowed'
    }`}
>
  一時保存 {!canTemporarySave && '(事例作成後に有効)'}
</button>

// 追加ボタン
<button
  onClick={handleAddCase}
  disabled={isLoading || !canTemporarySave}
  className={`px-4 py-2 text-sm font-medium text-white 
    ${canTemporarySave 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-gray-400 cursor-not-allowed'
    } rounded-md`}
>
  追加 {!canTemporarySave && '(事例作成後に有効)'}
</button>

{!canTemporarySave && (
  <div className="text-sm text-gray-500 mt-2">
    💡 AIが課題やニーズを整理できたら、保存ボタンが有効になります
  </div>
)}
```

#### My Cases画面での進行中事例表示
- **ステータス**: 非公開（進行中）
- **特別ボタン**: 「ヒヤリング再開」
- **機能**: 保存された会話履歴を復元してAIヒヤリング画面に遷移
- **編集・削除**: 通常の事例と同様に可能

### 確認・編集・最終保存

#### 確認・編集画面（CaseReviewEdit）
- **遷移元**: AIヒヤリング画面の「追加」ボタン
- **表示内容**: AI生成データの確認・編集
- **編集項目**: 基本情報、タイトル、課題・ニーズ・提案

#### 商談結果選択
```typescript
// 商談結果ラジオボタン
<div className="商談結果">
  <label>
    <input 
      type="radio" 
      value="won" 
      checked={orderStatus === 'won'}
      onChange={(e) => setOrderStatus(e.target.value)}
    />
    受注
  </label>
  
  <label>
    <input 
      type="radio" 
      value="lost" 
      checked={orderStatus === 'lost'}
      onChange={(e) => setOrderStatus(e.target.value)}
    />
    失注
  </label>
</div>
```

#### 最終保存処理
```typescript
const handleFinalSave = async () => {
  const finalCaseData = {
    ...editedCaseData,
    orderStatus: selectedOrderStatus, // 'won' or 'lost'
    publicationStatus: 'published'    // 公開状態
  };
  
  // 新規作成または更新
  const method = caseData.id ? 'PUT' : 'POST';
  const url = caseData.id ? `/api/cases/${caseData.id}` : '/api/cases';
  
  await fetch(url, {
    method,
    body: JSON.stringify(finalCaseData)
  });
  
  // 適切な画面に戻る
  router.push('/cases'); // または My Cases
};
```

### ステータス管理システム

#### 3つのorderStatus
- **`in_progress`**: 一時保存状態、My Casesのみ表示
- **`won`**: 受注、全画面表示、提案カード表示あり
- **`lost`**: 失注、全画面表示、提案カード表示なし

#### 画面別表示制御
- **事例検索画面**: `orderStatus = 'won' OR 'lost'` のみ
- **My Cases画面**: 全ステータス（フィルター可能）
- **事例詳細モーダル**: `orderStatus = 'won'` の場合のみ提案カード表示

#### ヒヤリング再開機能
```typescript
const handleResumeInterview = (caseData: Case) => {
  // 保存されたデータを復元
  const resumeData = {
    basicInfo: extractBasicInfo(caseData),
    savedMessages: caseData.conversationHistory || [],
    existingCaseData: caseData
  };
  
  // AIヒヤリング画面に遷移
  router.push({
    pathname: '/ai-interview',
    query: { resume: true, caseId: caseData.id }
  });
};
```