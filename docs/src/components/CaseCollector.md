# CaseCollector Component

## 概要
AIアシスタントとの会話を通じて営業事例を収集するモーダルコンポーネント。
ユーザーが商談情報を入力すると、Gemini APIと連携してインタラクティブな質問応答を行い、
最終的に構造化された事例データを生成・登録する。

## 主要機能
- モーダル形式の会話インターフェース
- Gemini APIとのリアルタイム対話
- 会話履歴の管理（最大10件に制限）
- 事例登録前のユーザー確認フロー
- 送信後の入力フィールド自動クリア

## 依存関係
- `../services/geminiService.ts` - AI会話エンジン
- `../types/case.ts` - 事例データ型定義
- React hooks (useState, useRef, useEffect)

## 状態管理
```typescript
- messages: Message[] - 会話メッセージ履歴
- input: string - 現在の入力テキスト
- isLoading: boolean - API通信中フラグ
- conversationHistory: ConversationHistory[] - Gemini API用会話履歴
- isCompleted: boolean - 事例登録完了フラグ
- showConfirmation: boolean - 登録確認ダイアログ表示フラグ
```

## 重要な実装パターン
1. **メモリリーク防止**: 会話履歴を最大10件に制限
2. **入力クリア**: 送信時にsetState + DOM操作の二重クリア
3. **非同期処理管理**: isLoadingによる重複送信防止
4. **ユーザー確認**: 事例登録前の明示的な同意取得

## Props
```typescript
interface CaseCollectorProps {
  onCaseCollected: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}
```

## 主要メソッド
- `handleSend()` - メッセージ送信とAI応答処理
- `handleConfirmSave()` - 事例登録確認時の処理
- `handleDeclineSave()` - 事例登録拒否時の処理
- `handleKeyDown()` - Enter キー送信対応

## 注意点
- Gemini API キーが必要（環境変数 REACT_APP_GEMINI_API_KEY）
- 事例登録は必ずユーザー確認後に実行
- エラー時も入力フィールドをクリア