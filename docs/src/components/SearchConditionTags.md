# SearchConditionTags Component

## 概要
検索条件をタグ形式で表示し、個別に削除可能なコンポーネント。
ユーザーが現在適用されているフィルターを視覚的に確認し、不要な条件を簡単に削除できる。

## 主要機能
- 適用中の検索条件をタグ形式で表示
- 各タグの個別削除機能
- 複数選択項目（業種、課題種別）の個別表示
- レスポンシブデザイン対応

## 依存関係
- `../types/case.ts` - SearchFilters型定義

## Props
```typescript
interface SearchConditionTagsProps {
  filters: SearchFilters;                                    // 現在の検索フィルター
  onRemoveFilter: (filterType: keyof SearchFilters, value?: string) => void; // フィルター削除ハンドラー
}
```

## 表示される条件タグ
1. **キーワード**: クエリ文字列
2. **業種**: 複数選択された業種（個別削除可能）
3. **地域**: 地域、都道府県、市区町村の階層表示
4. **企業規模**: 選択された企業規模
5. **課題種別**: 複数選択されたタグ（個別削除可能）

## UI特徴
- **色分け**: 条件タイプ別に背景色を設定
- **削除ボタン**: 各タグに×ボタンを配置
- **階層表示**: 地域情報は地域 > 都道府県 > 市区町村の形式
- **複数選択対応**: 業種と課題種別は個別のタグとして表示

## 削除機能
- 単一項目: フィルタータイプのみ指定で全削除
- 複数選択項目: value指定で特定の値のみ削除
- 地域階層: 上位レベル削除時は下位レベルも連動削除

## 使用例
```typescript
{hasSearched && (
  <SearchConditionTags
    filters={filters}
    onRemoveFilter={handleRemoveFilter}
  />
)}
```

## アクセシビリティ
- 削除ボタンに適切なaria-label設定
- キーボードナビゲーション対応
- スクリーンリーダー対応

## パフォーマンス考慮
- 条件変更時のみ再描画
- 不要な再レンダリングの回避
- 効率的な配列操作