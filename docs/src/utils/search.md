# Search Utility

## 概要
事例データの検索機能を提供するユーティリティ。
キーワード検索、フィルター検索、スコアリング、ハイライト機能を実装。

## 主要機能
- 複数フィールドでのキーワード検索
- 業種・地域・企業規模でのフィルタリング
- タグマッチング
- 検索スコアの算出
- 検索結果のハイライト表示

## 依存関係
- `../types/case.ts` - Case, SearchFilters, SearchResult型

## 主要関数

### `searchCases(cases: Case[], filters: SearchFilters): SearchResult[]`
メイン検索関数。全ての検索条件を適用し、スコア順でソートした結果を返す。

#### 処理フロー
1. 基本フィルター適用（業種、地域、企業規模）
2. タグフィルター適用
3. キーワード検索とスコアリング
4. 結果のソートとハイライト適用

### `calculateScore(case: Case, query: string): object`
キーワード検索のスコア算出。各フィールドの重み付けに基づいて総合スコアを計算。

#### スコア重み付け
- `title`: 30点
- `challenge`: 25点  
- `proposal`: 20点
- `result`: 15点
- `tags`: 10点（部分マッチ時5点）

#### 検索対象フィールド
- タイトル
- 課題
- 提案内容
- 結果
- タグ配列

### `highlightText(text: string, query: string): string`
検索キーワードのハイライト処理。大文字小文字を区別せずマッチしたテキストを`<mark>`タグで囲む。

## 検索アルゴリズム
1. **完全一致**: 最高スコア
2. **部分一致**: 中程度スコア  
3. **タグ一致**: 固定スコア
4. **複数キーワード**: OR検索（いずれかにマッチ）

## フィルター処理
- 業種: 完全一致
- 地域: 完全一致
- 企業規模: 列挙値一致
- タグ: 配列内の部分一致

## 使用例
```typescript
const results = searchCases(mockCases, {
  query: "DX推進",
  industry: "建築業", 
  companySize: "medium"
});
```

## パフォーマンス考慮
- 大文字小文字変換は一度のみ実行
- 早期リターンによる不要な処理のスキップ
- スコア0の結果は除外

## 関数拡張パターン
### `searchCases`関数のシグネチャ変更
```typescript
// 変更前: searchCases(cases, filters)
// 変更後: searchCases(cases, filters, favoritesSet?)
```

**影響箇所:**
- `App.tsx` - 3箇所の呼び出し（handleSearch、handleFiltersChange、handleCaseCollected）
- オプショナル引数のため破壊的変更なし

## 拡張時の注意点
- 新フィールド追加時はスコア計算に含める
- 重み付けの調整時は総合スコアが100を超えないよう注意
- 関数シグネチャ変更時は影響箇所の事前調査必須