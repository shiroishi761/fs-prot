# Case Types

## 概要
営業事例システムで使用する型定義。
事例データの構造、検索フィルター、検索結果の型を定義。

## 主要な型定義

### `Case`
```typescript
interface Case {
  id: string;                    // 一意識別子
  title: string;                 // 事例タイトル
  industry: string;              // 業種
  region: string;                // 地域
  companySize: 'small' | 'medium' | 'large'; // 企業規模
  challenge: string;             // 顧客の課題
  proposal: string;              // 提案内容
  result: string;                // 結果・成果
  tags: string[];               // タグ
  createdAt: Date;              // 作成日時
  updatedAt: Date;              // 更新日時
}
```

### `SearchFilters`
```typescript
interface SearchFilters {
  query?: string;               // キーワード検索
  industry?: string;            // 業種フィルター（後方互換性）
  industries?: string[];        // 業種フィルター（複数選択）
  region?: string;              // 地域フィルター（後方互換性）
  regions?: string[];           // 地域フィルター（複数選択）
  prefecture?: string;          // 都道府県フィルター
  city?: string;                // 市区町村フィルター
  companySize?: 'small' | 'medium' | 'large'; // 企業規模フィルター
  tags?: string[];              // タグフィルター
}
```

### `SearchResult`
```typescript
interface SearchResult {
  case: Case;                   // 事例データ
  score: number;                // 検索スコア（0-100）
  matchedFields: string[];      // マッチしたフィールド
  highlightedTitle?: string;    // ハイライト済みタイトル
  highlightedChallenge?: string; // ハイライト済み課題
}
```

## 企業規模の定義
- `small`: 小規模（〜50名）
- `medium`: 中規模（50〜300名）  
- `large`: 大規模（300名〜）

## 業種の例
- 建設業
- 製造業
- 不動産業
- 運輸業
- 情報通信業
- 卸売・小売業
- 金融・保険業
- サービス業

## 使用箇所
- `CaseCollector` - 新規事例作成時
- `SearchBox` - フィルター設定時（複数選択UI対応）
- `CaseList` - 検索結果表示時
- `SearchConditionTags` - 選択条件表示時
- `search.ts` - 検索処理時（複数選択対応）

## 型拡張の影響範囲
- **SearchFilters拡張時の影響箇所:**
  - `utils/search.ts` - searchCases関数の対応（複数選択対応済み）
  - `components/SearchBox.tsx` - UI要素追加（複数選択UI実装済み）
  - `components/SearchConditionTags.tsx` - 条件表示対応
  - `App.tsx` - 状態管理追加（フィルター削除ロジック対応済み）

## 拡張時の注意点
- 企業規模は列挙型のため、追加時は関連コンポーネントも更新
- 新しいフィールド追加時は検索処理とUI表示の対応も必要
- オプショナル型（?）での追加推奨（破壊的変更回避）