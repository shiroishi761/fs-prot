# CaseDetail Component

## 概要
事例の詳細情報を表示するモーダルコンポーネント。
選択された事例の全詳細を表示し、関連事例の提案も行う。

## 主要機能
- 事例の全詳細情報表示
- 関連事例の自動抽出・表示
- モーダルとしてのオーバーレイ表示
- 背景クリックでの閉じる機能
- 関連事例クリックでの事例切り替え

## 依存関係
- `../types/case.ts` - Case型定義
- `../utils/search.ts` - getRelatedCases関数
- `../data/mockCases.ts` - 関連事例検索用データ

## Props
```typescript
interface CaseDetailProps {
  case: Case | null;           // 表示する事例データ
  onClose: () => void;         // モーダルクローズハンドラー
  onCaseSelect: (caseId: string) => void; // 関連事例選択ハンドラー
}
```

## 状態管理
```typescript
- relatedCases: Case[] - 関連事例リスト（最大5件）
```

## 表示セクション
1. **ヘッダー部分**
   - 事例タイトル
   - 閉じるボタン
   - メタ情報（業種、地域、企業規模）

2. **詳細情報**
   - 課題の詳細
   - 提案内容の詳細
   - 結果・成果の詳細
   - タグ一覧

3. **関連事例**
   - 同業種・同規模の類似事例
   - クリックで事例切り替え可能

## 関連事例の抽出ロジック
- 同じ業界: +3点
- 同じ地域: +1点  
- 同じ企業規模: +2点
- 共通のタグ: +1.5点/タグ
- スコア順で上位5件を表示

## UI特徴
- **レスポンシブ対応**: モバイルでも適切に表示
- **キーボードナビゲーション**: ESCキーで閉じる
- **オーバーレイクリック**: 背景クリックで閉じる
- **スクロール対応**: 長いコンテンツでもスクロール可能

## アクセシビリティ
- フォーカストラップ（モーダル内にフォーカス制限）
- 適切なARIA属性設定
- ESCキーでの閉じる機能
- セマンティックHTML構造

## パフォーマンス考慮
- 関連事例の計算は事例変更時のみ実行
- 不要な再レンダリングの回避
- 関連事例数の制限（5件）

## 使用例
```typescript
{selectedCase && (
  <CaseDetail
    case={selectedCase}
    onClose={() => setSelectedCase(null)}
    onCaseSelect={(caseId) => {
      const newCase = findCaseById(caseId);
      setSelectedCase(newCase);
    }}
  />
)}
```