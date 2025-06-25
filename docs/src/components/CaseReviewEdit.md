# CaseReviewEdit Component

## 概要
AI事例収集ワークフローの最終段階を担う確認・編集コンポーネント。
AIヒヤリングで収集された情報をユーザーが確認・編集し、
最終的な事例データとして保存するためのフォーム。

## 主要機能
- AI生成データの表示・編集
- 基本情報の確認表示
- 課題・ニーズ・提案セットの動的編集
- セットの追加・削除機能
- チャット画面への復帰機能
- 最終保存処理

## 依存関係
- React hooks (useState)
- `../types/case.ts` - データ型定義

## データ構造
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

interface EditableData {
  title: string;                    // 事例タイトル
  challenges: string[];             // 課題詳細
  challengeSummaries: string[];     // 課題要約
  needs: string[];                  // ニーズ詳細
  proposals: string[];              // 提案詳細
  results: string[];                // 結果（拡張用）
}
```

## セット構造の特徴
- **統一セット管理**: 課題・課題要約・ニーズ・提案が1セットとして管理
- **動的セット数**: 必要に応じてセットの追加・削除が可能
- **最小セット数**: 常に1セット以上を維持
- **インデックス管理**: 配列インデックスでセット間の対応を保持

## 編集機能
### セット操作
- `addNewSet()` - 新しい課題・ニーズ・提案セットを追加
- `removeSet(index)` - 指定インデックスのセットを削除
- `handleSetFieldChange()` - セット内フィールドの個別編集

### データ操作
- `handleFieldChange()` - タイトル等の単体フィールド編集
- リアルタイム状態反映
- 自動保存機能なし（明示的保存のみ）

## Props
```typescript
interface CaseReviewEditProps {
  basicInfo: CaseBasicInfo;
  aiGeneratedData: Partial<Case>;
  onSave: (caseData: Partial<Case>) => void;
  onBackToChat: () => void;
}
```

## ワークフロー連携
1. **前の段階**: CaseCollector（AIヒヤリング）
2. **現在の段階**: 確認・編集
3. **完了**: App（メインアプリケーション）への保存

## ナビゲーション
- **キャンセル**: チャット画面に戻る（会話履歴保持）
- **保存**: 事例データとして永続化し、検索画面に戻る

## UI構成
1. **基本情報セクション**: 読み取り専用の企業情報表示
2. **タイトルセクション**: 事例タイトルの編集
3. **セットセクション**: 課題・ニーズ・提案の動的編集エリア
4. **アクションセクション**: キャンセル・保存ボタン

## 保存処理
```typescript
const finalData = {
  ...editedData,
  industry: basicInfo.mainIndustry,
  industries: basicInfo.industry,
  region: basicInfo.region,
  prefecture: basicInfo.prefecture,
  city: basicInfo.city,
  companySize: basicInfo.companySize,
  orderStatus: 'in_progress'
};
```

## バリデーション
- タイトル: 必須入力
- セット構成: 空のセットも許可（後から編集可能）
- 基本情報: 前段階で確定済みのため編集不可

## アクセシビリティ
- フォーム要素の適切なラベリング
- キーボードナビゲーション対応
- 画面リーダー対応
- エラーメッセージの明確な表示