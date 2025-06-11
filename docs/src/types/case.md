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
  industry?: string;            // 業種フィルター
  region?: string;              // 地域フィルター
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
- `small`: 小規模（〜30名）
- `medium`: 中規模（30〜100名）  
- `large`: 大規模（100名〜）

## 業種の例
- 建築業
- 土木工事業
- 設備工事業
- 内装工事業
- 電気工事業

## 使用箇所
- `CaseCollector` - 新規事例作成時
- `SearchBox` - フィルター設定時
- `CaseList` - 検索結果表示時
- `search.ts` - 検索処理時

## 拡張時の注意点
- 企業規模は列挙型のため、追加時は関連コンポーネントも更新
- 新しいフィールド追加時は検索処理とUI表示の対応も必要