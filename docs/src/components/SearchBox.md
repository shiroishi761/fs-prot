# SearchBox Component

## 概要
事例検索のためのフィルター入力インターフェース。
キーワード検索、業種・地域・企業規模の選択、タグ入力機能を提供。

## 主要機能
- キーワード入力フィールド
- 業種・地域・企業規模のドロップダウン選択
- タグの複数選択
- フィルタークリア機能
- 検索実行ボタン

## 依存関係
- `../types/case.ts` - SearchFilters型

## Props
```typescript
interface SearchBoxProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}
```

## 状態管理
- propsで受け取ったfiltersを基に表示状態を管理
- 変更時は即座にonFiltersChangeを呼び出し
- 検索ボタンクリック時にonSearchを実行

## UI構成
1. キーワード検索欄
2. 業種選択ドロップダウン
3. 地域選択ドロップダウン  
4. 企業規模選択ドロップダウン
5. タグ選択（複数選択可能）
6. フィルタークリアボタン
7. 検索実行ボタン

## 自動検索トリガー
- 業種、地域、企業規模の変更時は自動で検索実行
- キーワードは手動検索のみ（Enter キーまたは検索ボタン）

## アクセシビリティ
- 適切なlabel要素の設定
- キーボードナビゲーション対応
- フォーカス管理