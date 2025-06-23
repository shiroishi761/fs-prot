# ReflectionAssistant Component

## 概要
商談失敗後の振り返りを支援するAI対話コンポーネント。優しく共感的なトーンで営業担当者の振り返りをサポートし、建設的なアドバイスを提供する。

## コンポーネント構成

### Props Interface
```typescript
interface ReflectionAssistantProps {
  onReflectionComplete: (reflection: Omit<Reflection, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  cases: Case[]; // 成功事例のリスト
}
```

### State管理
```typescript
const [messages, setMessages] = useState<Message[]>([])
const [input, setInput] = useState('')
const [isLoading, setIsLoading] = useState(false)
const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([])
const [showSaveOption, setShowSaveOption] = useState(false)
const [collectedInfo] = useState<Partial<Reflection>>({})
```

## 主要機能

### 1. AI対話システム
- Gemini 1.5 Flash APIを使用した自然な対話
- 振り返り専用プロンプトによる共感的な対応
- 段階的な情報収集（業種、規模、失敗ポイント、顧客反応）

### 2. ノウハウベースアドバイス
- 会話内容から業界・規模・失敗段階を自動抽出
- `salesKnowledge.ts`のデータを活用したアドバイス生成
- 類似失敗パターンからの学びと成功パターンからの改善提案

### 3. 関連成功事例の表示
- 同業種・同規模の成功事例を自動検索
- 失敗ポイントに関連するキーワードマッチング
- 最大3件の関連事例をカード形式で表示

### 4. データ永続化
- 振り返り内容をlocalStorageに保存
- 検索対象外の内部データとして管理
- 将来の商談前アドバイス機能で活用

## UI/UX設計

### モーダル構成
- ヘッダー：タイトルと閉じるボタン
- メッセージエリア：対話履歴（396px固定高さ、スクロール対応）
- 関連事例表示：成功事例カード（条件付き表示）
- 入力エリア：テキストエリア + 送信ボタン
- 保存オプション：「保存する」「保存せずに閉じる」

### メッセージ表示
- ユーザーメッセージ：右寄せ、青背景
- AIメッセージ：左寄せ、白背景
- タイムスタンプ：各メッセージに表示
- ローディング：3つのドットアニメーション

### 関連事例カード
- 緑系の背景色で成功を表現
- 事例タイトル、業種・規模、提案内容の抜粋を表示
- 最大3件まで表示

## アドバイス生成ロジック

### 情報抽出
```typescript
const industry = collectedInfo.industry || 
  ['建設業', '土木業', '電気工事業', '管工事業'].find(i => conversationText.includes(i)) || '建設業';
const companySize = collectedInfo.companySize || 'medium';
const failureStage = ['アプローチ', 'ヒアリング', '提案', 'クロージング'].find(s => 
  conversationText.includes(s)
) || '提案';
```

### アドバイス構成
1. **業界・規模別アプローチ**：効果的な訴求ポイント
2. **同業界での注意点**：類似失敗パターンからの警告
3. **成功パターンから学ぶ**：同業界の成功事例
4. **段階別改善ポイント**：失敗段階に応じたアドバイス

## 技術的な実装詳細

### Gemini API統合
- `GeminiService`を使用した対話管理
- 振り返り専用のシステムプロンプト設定
- `[REFLECTION_COMPLETE]`マーカーによる完了判定

### エラーハンドリング
- API通信エラーの適切な処理
- エラーメッセージの表示
- 入力状態のリセット

### パフォーマンス最適化
- 会話履歴の制限（最新10件まで）
- メッセージの自動スクロール
- 適切なローディング状態の管理

## 利用フロー

### 1. 振り返り開始
```
AI: お疲れ様でした。今日の商談について振り返りましょう。
    どんなお客様でしたか？（業種、規模など）
```

### 2. 情報収集段階
- 業種、地域、企業規模の確認
- 失敗した段階の特定
- 顧客の具体的な反応の聞き取り
- 原因の分析

### 3. アドバイス提供
- AIによる共感的なフィードバック
- ノウハウデータベースからの具体的アドバイス
- 関連成功事例の提示

### 4. 保存判断
- ユーザーが保存するかどうかを選択
- 保存する場合：Reflectionデータとして永続化
- 保存しない場合：そのまま終了

## 他コンポーネントとの連携

### App.tsx
- `handleReflectionComplete`関数でReflectionデータを受け取り
- localStorageに保存処理
- モーダルの表示/非表示制御

### salesKnowledge.ts
- 業界・規模別のキーインサイトを活用
- 成功・失敗パターンの参照
- ステージ別アドバイスの取得

## 設計思想

### 共感的アプローチ
- 失敗を責めない温かいトーン
- 「なぜ失敗したか」より「次どうするか」にフォーカス
- 営業担当者のモチベーション維持

### 学習促進
- 失敗から具体的な学びを抽出
- 成功パターンとの比較による気づき
- 次回改善のための具体的なアクション

### データ活用
- 蓄積された振り返りデータの活用
- 業界ノウハウとの組み合わせ
- 継続的な改善サイクルの支援