# GeminiService

## 概要
Google Gemini APIとの通信を管理するサービスクラス。
営業事例収集のための会話管理と、事例データの自動抽出機能を提供。

## 主要機能
- Gemini Chat APIとの会話管理
- 事例登録準備状況の判定
- 会話履歴からの構造化データ抽出
- エラーハンドリングと詳細エラーメッセージ

## 依存関係
- `@google/generative-ai` - Google Gemini API ライブラリ
- `../types/case.ts` - 事例データ型定義

## 設定
```typescript
- MODEL: 'gemini-1.5-flash'
- TEMPERATURE: 0.7
- MAX_OUTPUT_TOKENS: 1024
- API_KEY: process.env.REACT_APP_GEMINI_API_KEY
```

## システムプロンプト
建設業界の営業支援AIアシスタントとして以下の情報を収集：
1. お客様の業種（建築、土木、設備工事など）
2. 地域（都道府県）
3. 企業規模（従業員数）
4. お客様が抱えていた課題
5. 提案した内容（CAREECONの機能活用方法）
6. 結果（契約、検討中、デモ予定など）

## 主要メソッド

### `continueConversation(conversationHistory, userMessage)`
- Chat APIを使用した会話継続
- 会話履歴をGemini形式に変換
- 最新メッセージのみを送信して累積表示を防止

### `checkIfReadyToSave(conversationHistory)`
事例登録準備の判定条件：
- 業種情報の存在
- 地域情報の存在  
- 課題情報の存在
- 提案情報の存在
- 最低4回の会話実施（2往復）

### `extractStructuredCase(text, conversationHistory)`
- `[CONFIRM_SAVE]`トークンによる明示的な保存指示検出
- 正規表現による情報抽出
- デフォルト値の適用

## エラーハンドリング
- `API_KEY_INVALID` - APIキー無効
- `PERMISSION_DENIED` - 権限不足
- `quota` - 利用制限到達

## 会話履歴管理
- 最大10件の履歴を保持
- Chat API形式での履歴変換
- システムプロンプトの初回設定

## 注意点
- APIキーの環境変数設定必須
- 事例抽出は明示的な確認後のみ実行
- 会話履歴の適切な制限管理