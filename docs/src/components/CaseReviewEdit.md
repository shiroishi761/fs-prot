# CaseReviewEdit Component

## 概要
AI事例収集ワークフローの最終段階を担う確認・編集コンポーネント。
AIヒヤリングで収集された情報をユーザーが確認・編集し、
最終的な事例データとして保存するためのフォーム。

## 主要機能
- AI生成データの表示・編集
- 基本情報の編集（企業名、業種、地域、企業規模）
- 課題・ニーズ・提案セットの動的編集
- セットの追加・削除機能
- 商談結果の選択（受注・失注）
- 編集モード対応（既存事例の編集）
- チャット画面への復帰機能
- 最終保存処理

## 依存関係
- React hooks (useState)
- `../types/case.ts` - データ型定義、INDUSTRIES、REGIONS、AREA_HIERARCHY

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
  companyName: string;              // 企業名（編集可能）
  industry: string;                 // 業種（選択式）
  region: string;                   // 地域（選択式）
  prefecture: string;               // 都道府県（選択式）
  city: string;                     // 市区町村（テキスト入力）
  companySize: string;              // 企業規模（選択式）
  challenges: string[];             // 課題詳細
  challengeSummaries: string[];     // 課題要約
  needs: string[];                  // ニーズ詳細
  proposals: string[];              // 提案詳細
  results: string[];                // 結果（拡張用）
  orderStatus: 'won' | 'lost';      // 商談結果（新規作成時のみ）
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
  basicInfo: CaseBasicInfo;          // 基本情報（編集可能）
  aiGeneratedData: Partial<Case>;    // AI生成データまたは既存事例データ
  onSave: (caseData: Partial<Case>) => void;  // 保存処理
  onBackToChat: () => void;          // チャット画面への復帰
}
```

## ワークフロー連携
### 新規作成フロー
1. **前の段階**: CaseCollector（AIヒヤリング）
2. **現在の段階**: 確認・編集
3. **完了**: App（メインアプリケーション）への保存

### 既存事例編集フロー
1. **開始**: My Cases（マイ事例）の編集ボタン
2. **現在の段階**: 既存データの編集
3. **完了**: App（メインアプリケーション）への保存

### ヒヤリング再開フロー
1. **開始**: My Cases（マイ事例）のヒヤリング再開ボタン
2. **中間**: CaseCollector（AIヒヤリング続行）
3. **現在の段階**: 更新内容の確認・編集
4. **完了**: 既存事例の更新保存

## ナビゲーション
- **キャンセル**: チャット画面に戻る（会話履歴保持）
- **保存**: 事例データとして永続化し、検索画面に戻る

## UI構成
1. **基本情報セクション**: 編集可能な企業情報
   - 企業名、業種、企業規模（1段目）
   - 地域、都道府県、市区町村（2段目）
2. **タイトルセクション**: 事例タイトルの編集
3. **商談結果セクション**: 受注・失注の選択（進行中事例の編集時は非表示）
4. **セットセクション**: 課題・ニーズ・提案の動的編集エリア
5. **アクションセクション**: キャンセル・保存ボタン

## 保存処理
```typescript
const finalData = {
  ...editedData,
  // Use edited basic info
  industry: editedData.industry || basicInfo.mainIndustry,
  industries: editedData.industry ? [editedData.industry] : basicInfo.industry,
  region: editedData.region || basicInfo.region,
  prefecture: editedData.prefecture || basicInfo.prefecture,
  city: editedData.city || basicInfo.city,
  companySize: editedData.companySize || basicInfo.companySize,
  companyName: editedData.companyName || basicInfo.companyName,
  // Ensure orderStatus is saved correctly
  orderStatus: editedData.orderStatus || 'won'
};
```

## バリデーション
- タイトル: 必須入力
- セット構成: 空のセットも許可（後から編集可能）
- 基本情報: 編集可能（選択式フィールドは適切な選択肢から選択）
- 商談結果: 新規作成時は受注・失注から選択必須

## アクセシビリティ
- フォーム要素の適切なラベリング
- キーボードナビゲーション対応
- 画面リーダー対応
- エラーメッセージの明確な表示