# CaseCollector Component

## 概要
AI事例収集ワークフローの第二段階を担うチャットインターフェース。
企業基本情報を受け取り、AIアシスタントとの会話を通じて商談の詳細情報を収集し、
最終的に確認・編集画面に送るためのコンポーネント。

## 主要機能
- 基本情報に基づく初期メッセージ生成
- Gemini APIとのリアルタイム対話
- 会話履歴の管理（最大10件に制限）
- 一時保存機能
- 確認・編集画面への遷移機能
- 会話履歴の永続化対応

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
interface CaseBasicInfo {
  companyName: string;
  industry: string[];
  mainIndustry: string;
  region: string;
  prefecture: string;
  city: string;
  companySize: 'small' | 'medium' | 'large';
}

interface CaseCollectorProps {
  onCaseCollected: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onReviewEdit: (aiData: Partial<Case>, messages: Message[], conversationHistory: ConversationHistory[]) => void;
  onClose: () => void;
  basicInfo?: CaseBasicInfo;
  savedMessages?: Message[];
  savedConversationHistory?: ConversationHistory[];
}
```

## 主要メソッド
- `getInitialMessage()` - 基本情報に基づく初期メッセージ生成
- `handleSend()` - メッセージ送信とAI応答処理
- `handleKeyDown()` - Enter キー送信対応

## ワークフロー連携
1. **前の段階**: CaseAddForm（基本情報入力）
2. **現在の段階**: AIヒヤリング
3. **次の段階**: CaseReviewEdit（確認・編集）

## 会話履歴管理
- **復帰時**: savedMessagesとsavedConversationHistoryで状態復元
- **保存時**: 現在の会話状態を次の画面に引き継ぎ
- **メモリ制限**: 最大10件の会話履歴を保持

## 注意点
- Gemini API キーが必要（環境変数 REACT_APP_GEMINI_API_KEY）
- 会話履歴の永続化により状態復帰が可能
- エラー時も入力フィールドをクリア
- 基本情報がない場合は汎用的な初期メッセージを表示