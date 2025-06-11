# App Component

## 概要
営業支援システム（CAREECO）のメインアプリケーションコンポーネント。
事例検索、詳細表示、新規事例登録の全体的な状態管理を行う。

## 主要機能
- 全体レイアウト（ヘッダー、メイン、フッター）
- 事例データの状態管理
- 検索機能の統合
- モーダル表示の制御（詳細・登録）

## 依存関係
- `./components/SearchBox` - 検索インターフェース
- `./components/CaseList` - 事例一覧表示
- `./components/CaseDetail` - 事例詳細モーダル
- `./components/CaseCollector` - 新規事例登録モーダル
- `./utils/search` - 検索処理
- `./data/mockCases` - 初期データ
- `./types/case` - 型定義

## 状態管理
```typescript
- filters: SearchFilters - 現在の検索条件
- searchResults: SearchResult[] - 検索結果
- loading: boolean - 検索処理中フラグ  
- selectedCase: Case | null - 選択中の事例
- hasSearched: boolean - 検索実行済みフラグ
- showCaseCollector: boolean - 新規登録モーダル表示フラグ
- mockCases: Case[] - 事例データ（動的更新可能）
```

## 主要メソッド

### `handleSearch()`
- 検索条件に基づく事例検索実行
- ローディング状態管理
- 結果更新とhasSearchedフラグ設定

### `handleFiltersChange(filters)`
- 検索条件の更新
- 非キーワードフィルター変更時の自動検索
- デバウンス処理（100ms）

### `handleCaseSelect(caseId)`
- 事例ID指定での詳細表示
- モーダル状態管理

### `handleCaseCollected(newCase)`
- 新規事例の登録処理
- データ配列への追加（先頭挿入）
- 検索結果の自動更新

## レイアウト構成
1. **ヘッダー**
   - システム名（CAREECO）
   - 新規事例追加ボタン
   - 登録事例数表示

2. **メインエリア**
   - 検索セクション
   - 結果表示セクション

3. **フッター**
   - コピーライト
   - システム説明

## 初期化処理
- mockCasesでの初期事例データ設定
- 全事例表示（フィルターなし検索）

## エラーハンドリング
- 検索エラー時の適切なメッセージ表示
- ネットワークエラー時のリトライ機能

## パフォーマンス最適化
- 検索のデバウンス処理
- 不要な再レンダリング防止
- 大量データでの仮想スクロール対応

## アクセシビリティ
- セマンティックHTML構造
- 適切なARIA属性設定
- キーボードナビゲーション対応