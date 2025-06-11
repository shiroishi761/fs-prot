# CaseList Component

## 概要
検索結果の事例一覧を表示するコンポーネント。
グリッドレイアウトで事例カードを表示し、クリックで詳細表示を可能にする。

## 主要機能
- 検索結果のグリッド表示
- ローディング状態の表示
- 検索結果なしの場合のメッセージ表示
- 事例カードクリックでの詳細表示

## 依存関係
- `./CaseCard.tsx` - 個別事例表示カード
- `../types/case.ts` - SearchResult型

## Props
```typescript
interface CaseListProps {
  searchResults: SearchResult[];
  loading: boolean;
  onCaseSelect: (caseId: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (caseId: string) => void;
}
```

## Props 追加パターン
新機能追加時のProps拡張は以下の流れ：
1. **上位コンポーネント（App）** - 状態管理追加
2. **中間コンポーネント（CaseList）** - Props受け取りと転送
3. **下位コンポーネント（CaseCard）** - 実際の機能実装

## 表示状態
1. **ローディング中**: スケルトンローダーまたはスピナー表示
2. **結果あり**: CaseCardのグリッド表示
3. **結果なし**: "該当する事例が見つかりませんでした"メッセージ

## レイアウト
- レスポンシブグリッド（1〜3カラム）
- カード間の適切な余白
- 大量データでの仮想スクロール（将来実装）

## 相互作用
- CaseCardクリック → onCaseSelect呼び出し → 詳細モーダル表示
- 検索結果更新時の滑らかなアニメーション