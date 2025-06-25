# MyPageFilter Component

## 概要
マイ事例ページ専用のフィルターコンポーネント。
公開ステータス（すべて表示・公開済み・非公開）による事例の絞り込み機能を提供。

## 主要機能
- 公開ステータスによる事例フィルタリング
- ラジオボタン形式の排他的選択
- リアルタイムフィルター適用
- 検索条件の状態管理

## 依存関係
- React
- `../types/case.ts` - SearchFilters型定義

## データ構造
```typescript
interface SearchFilters {
  publicationStatus?: 'published' | 'unpublished';
}
```

## フィルター選択肢
1. **すべて表示**: publicationStatus = undefined（全ての事例を表示）
2. **公開済み**: publicationStatus = 'published'（受注・失注済みの事例）
3. **非公開**: publicationStatus = 'unpublished'（進行中の事例）

## Props
```typescript
interface MyPageFilterProps {
  filters: SearchFilters;                           // 現在のフィルター状態
  onFiltersChange: (filters: SearchFilters) => void; // フィルター変更時のコールバック
}
```

## 動作仕様
### 公開ステータスの判定
- **公開済み（published）**: orderStatus が 'won' または 'lost'
- **非公開（unpublished）**: orderStatus が 'in_progress'

### フィルター変更の流れ
1. ユーザーがラジオボタンを選択
2. `handleFilterChange`が呼び出される
3. 新しいフィルター状態が`onFiltersChange`で親コンポーネントに通知
4. 親コンポーネント（App.tsx）で検索実行

## 使用例
```tsx
<MyPageFilter
  filters={myPageFilters}
  onFiltersChange={setMyPageFilters}
/>
```

## スタイリング
- Tailwind CSSを使用
- シンプルなフォームレイアウト
- ラジオボタンの適切なスタイリング
- レスポンシブ対応

## 連携コンポーネント
- **App.tsx**: フィルター状態の管理と検索実行
- **CaseList**: フィルター結果の表示
- **searchCases()**: フィルター条件に基づく事例検索

## アクセシビリティ
- ラジオボタンの適切なラベリング
- フォーカス管理
- スクリーンリーダー対応
- キーボードナビゲーション対応