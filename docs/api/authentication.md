# 認証API仕様書

## 概要
BRANU営業支援システムの認証関連API。AWS Cognito連携、セッション管理、ログイン/ログアウト機能を提供。

## エンドポイント一覧

### 1. Google OAuth認証開始
```http
GET /api/auth/google
```

**説明**: Google OAuth認証フローを開始

**パラメータ**: なし

**レスポンス**:
```json
{
  "data": {
    "redirectUrl": "https://cognito-auth-url-with-google-oauth"
  }
}
```

**ステータスコード**:
- `200`: 成功
- `500`: サーバーエラー

---

### 2. OAuth認証コールバック
```http
GET /api/auth/callback
```

**説明**: Google OAuth認証後のコールバック処理

**クエリパラメータ**:
- `code`: string (required) - OAuth認証コード
- `state`: string (required) - CSRF防止用状態パラメータ

**レスポンス**:
```json
{
  "data": {
    "user": {
      "id": "user-12345",
      "email": "user@branu.jp",
      "name": "山田太郎",
      "picture": "https://profile-image-url"
    },
    "redirectTo": "/"
  }
}
```

**エラーレスポンス**:
```json
{
  "error": {
    "code": "INVALID_DOMAIN",
    "message": "このアカウントではログインできません"
  }
}
```

**ステータスコード**:
- `200`: 認証成功
- `403`: ドメイン制限違反
- `400`: 無効なパラメータ
- `500`: サーバーエラー

---

### 3. セッション状態確認
```http
GET /api/auth/session
```

**説明**: 現在のセッション状態を確認

**ヘッダー**:
- `Cookie`: セッションCookie

**レスポンス**:
```json
{
  "data": {
    "authenticated": true,
    "user": {
      "id": "user-12345",
      "email": "user@branu.jp",
      "name": "山田太郎"
    },
    "expiresAt": "2024-02-01T12:00:00Z"
  }
}
```

**未認証時**:
```json
{
  "data": {
    "authenticated": false
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 未認証

---

### 4. ログアウト
```http
POST /api/auth/logout
```

**説明**: セッションを終了してログアウト

**ヘッダー**:
- `Cookie`: セッションCookie

**レスポンス**:
```json
{
  "data": {
    "message": "ログアウトしました"
  }
}
```

**ステータスコード**:
- `200`: 成功
- `500`: サーバーエラー

---

### 5. トークン更新
```http
POST /api/auth/refresh
```

**説明**: リフレッシュトークンを使用してアクセストークンを更新

**ヘッダー**:
- `Cookie`: リフレッシュトークンCookie

**レスポンス**:
```json
{
  "data": {
    "expiresAt": "2024-02-01T12:00:00Z"
  }
}
```

**エラーレスポンス**:
```json
{
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "リフレッシュトークンが無効です"
  }
}
```

**ステータスコード**:
- `200`: 成功
- `401`: 無効なリフレッシュトークン
- `500`: サーバーエラー

## Cookie仕様

### セッションCookie
- **名前**: `session-token`
- **HttpOnly**: true
- **Secure**: true (HTTPS環境)
- **SameSite**: Lax
- **Path**: /

### 短期セッション（チェックボックスOFF）
- **有効期限**: Session Cookie（ブラウザ閉じると削除）
- **Redis TTL**: 5時間

### 長期セッション（チェックボックスON）
- **有効期限**: 30日間
- **Redis TTL**: 30日間
