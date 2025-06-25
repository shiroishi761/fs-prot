# CaseDetail Component

## 概要
事例の詳細情報を表示するモーダルコンポーネント。
選択された事例の全詳細を表示し、関連事例の提案も行う。

## 主要機能
- 事例の全詳細情報表示
- 事例間のナビゲーション（前/次ボタン）
- モーダルとしてのオーバーレイ表示
- 背景クリックでの閉じる機能
- キーボードナビゲーション（矢印キー、ESCキー）

## 依存関係
- `../types/case.ts` - Case型定義

## Props
```typescript
interface CaseDetailProps {
  case: Case | null;                          // 表示する事例データ
  onClose: () => void;                        // モーダルクローズハンドラー
  onNavigate?: (direction: 'prev' | 'next') => void; // ナビゲーションハンドラー
  hasPrev?: boolean;                          // 前の事例があるかどうか
  hasNext?: boolean;                          // 次の事例があるかどうか
}
```

## 状態管理
- propsで受け取った事例データを表示
- キーボードイベントリスナーの管理（useEffect）

## 表示セクション
1. **ヘッダー部分**
   - 事例タイトル
   - 閉じるボタン
   - メタ情報（業種、地域、企業規模）

2. **詳細情報**
   - 課題の詳細
   - 提案内容の詳細
   - 結果・成果の詳細
   - 課題種別一覧

3. **フッター**
   - ナビゲーションボタン（前/次）
   - 作成日表示

## ナビゲーション機能
- 左矢印キー（←）: 前の事例
- 右矢印キー（→）: 次の事例
- ESCキー: モーダルを閉じる
- ナビゲーションボタン: 画面中央に配置
- 作成日: 右端に固定表示

## UI特徴
- **レスポンシブ対応**: モバイルでも適切に表示
- **キーボードナビゲーション**: 矢印キー、ESCキー対応
- **オーバーレイクリック**: 背景クリックで閉じる
- **スクロール対応**: 長いコンテンツでもスクロール可能
- **中央配置**: ナビゲーションボタンが常に中央に配置

## アクセシビリティ
- フォーカストラップ（モーダル内にフォーカス制限）
- 適切なARIA属性設定
- ESCキーでの閉じる機能
- セマンティックHTML構造

## パフォーマンス考慮
- キーボードイベントリスナーの適切なクリーンアップ
- useEffectの依存関係最適化
- ナビゲーション状態の効率的な管理

## 使用例
```typescript
{selectedCase && (
  <CaseDetail
    case={selectedCase}
    onClose={handleCaseDetailClose}
    onNavigate={handleCaseNavigate}
    hasPrev={selectedCaseIndex > 0}
    hasNext={selectedCaseIndex < searchResults.length - 1}
  />
)}
```