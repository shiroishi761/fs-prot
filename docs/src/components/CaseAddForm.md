# CaseAddForm Component

## 概要
AI事例収集ワークフローの第一段階を担う企業基本情報入力フォーム。
ユーザーが企業名、業種、地域、規模などの基本情報を入力し、
AIヒヤリングセッションを開始するためのコンポーネント。

## 主要機能
- 企業基本情報の入力フォーム
- 複数業種選択対応（メイン業種 + サブ業種）
- 地域階層選択（地方 → 都道府県 → 市区町村）
- 企業規模の分類選択
- バリデーション機能
- AIヒヤリング開始のトリガー

## 依存関係
- React hooks (useState)
- `../types/case.ts` - データ型定義

## フォーム構成
```typescript
interface CaseBasicInfo {
  companyName: string;           // 企業名
  industry: string[];            // 選択された業種一覧
  mainIndustry: string;          // メイン業種
  region: string;                // 地方
  prefecture: string;            // 都道府県
  city: string;                  // 市区町村
  companySize: 'small' | 'medium' | 'large'; // 企業規模
}
```

## 業種選択機能
- **メイン業種**: 必須選択項目
- **サブ業種**: 複数選択可能
- **業種一覧**: 建設業界関連業種を網羅
  - 建設業、不動産業、製造業、IT・通信業など

## 地域選択機能
- **3層階層構造**: 地方 → 都道府県 → 市区町村
- **連動選択**: 上位選択により下位選択肢が動的に更新
- **全国対応**: 47都道府県と主要市区町村をカバー

## 企業規模分類
- **小規模**: 〜50名
- **中規模**: 50-300名  
- **大規模**: 300名〜

## バリデーション
- 企業名: 必須入力
- メイン業種: 必須選択
- 地域情報: 地方、都道府県、市区町村すべて必須
- 企業規模: 必須選択

## Props
```typescript
interface CaseAddFormProps {
  onStartInterview: (basicInfo: CaseBasicInfo) => void;
  onClose: () => void;
}
```

## 主要メソッド
- `handleSubmit()` - フォーム送信処理とバリデーション
- `handleIndustryChange()` - 業種選択状態の管理
- `handleRegionChange()` - 地域選択の連動制御

## ワークフロー連携
1. **現在の段階**: 基本情報入力
2. **次の段階**: CaseCollector（AIヒヤリング）
3. **最終段階**: CaseReviewEdit（確認・編集）

## UI/UX特徴
- シンプルで直感的なフォームレイアウト
- リアルタイムバリデーションフィードバック
- アクセシブルなフォーム設計
- モバイル対応レスポンシブデザイン