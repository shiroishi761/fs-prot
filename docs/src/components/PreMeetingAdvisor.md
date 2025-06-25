# PreMeetingAdvisor Component

## 概要
商談前の準備を支援するアドバイス機能。商談相手の情報を入力すると、過去の成功・失敗パターンから最適なアドバイスを生成し、チェックリスト形式で提供する。

## コンポーネント構成

### Props Interface
```typescript
interface PreMeetingAdvisorProps {
  onClose: () => void;
  cases: Case[]; // 成功事例のリスト
  reflections: Reflection[]; // 失敗パターンのリスト
}
```

### State管理
```typescript
const [step, setStep] = useState<'input' | 'advice'>('input')
const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({})
const [adviceList, setAdviceList] = useState<Advice[]>([])
const [relatedCases, setRelatedCases] = useState<Case[]>([])
const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
```

### データ型定義
```typescript
interface MeetingInfo {
  industry: string;
  region: string;
  companySize: 'small' | 'medium' | 'large';
  companyName?: string;
  meetingPurpose?: string;
}

interface Advice {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  basedOn?: 'success' | 'failure';
}
```

## 主要機能

### 1. 商談情報入力フォーム
- **必須項目**：業種、地域、企業規模
- **任意項目**：企業名、商談の目的
- **バリデーション**：必須項目の入力チェック
- **UI**：select要素とradioボタンによる選択式

### 2. スマートアドバイス生成
多段階のアドバイス生成ロジック：

#### a) ノウハウデータベース優先
- `keyInsights`から業界・規模特化のアドバイス
- 効果的なアプローチ手法
- やるべきこと・避けるべきことリスト

#### b) 実績パターンマッチング
- `salesPatterns`から成功・失敗事例を抽出
- 実例付きの具体的なアドバイス
- ステージ別の注意点

#### c) 蓄積データ分析
- 過去の成功事例からの課題キーワード分析
- 失敗パターンからの警告生成

### 3. 優先度付きチェックリスト
- **重要（高）**：赤系の色彩で強調
- **推奨（中）**：黄系の色彩
- **参考（低）**：緑系の色彩
- チェックボックスで準備状況を管理

### 4. 関連成功事例の表示
- 同業種・同規模・同地域の成功事例を抽出
- 最大3件まで表示
- 課題概要の抜粋表示

## アドバイス生成ロジック

### 業界・規模別カスタマイズ
```typescript
const insight = keyInsights.find(i => 
  i.industry === meetingInfo.industry && i.companySize === meetingInfo.companySize
);
```

### 成功パターン抽出
```typescript
const relevantSuccessPatterns = salesPatterns.filter(p => 
  p.type === 'success' && 
  p.industry === meetingInfo.industry &&
  (p.companySize === meetingInfo.companySize || ['approach', 'hearing'].includes(p.stage))
);
```

### 失敗パターン警告
```typescript
const relevantFailurePatterns = salesPatterns.filter(p => 
  p.type === 'failure' && 
  p.industry === meetingInfo.industry &&
  (p.companySize === meetingInfo.companySize || ['approach', 'hearing'].includes(p.stage))
);
```

## UI/UX設計

### 2ステップ構成
1. **入力ステップ**：商談情報の収集
2. **アドバイスステップ**：チェックリスト表示

### 入力フォーム
- 清潔なフォームレイアウト
- 必須項目に赤いアスタリスク
- ラジオボタンによる企業規模選択
- テキストエリアによる目的入力

### アドバイス表示
- 商談情報サマリーを上部に表示
- 優先度別の色分けカード
- チェックボックスによる進捗管理
- 関連事例を下部に配置

### カラーシステム
```typescript
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
  }
};
```

## 具体的なアドバイス例

### 建設業・小規模企業
- **アプローチ**：「人材不足解消をメインに訴求」
- **準備・心がけ**：「午後または夕方の訪問を心がける」
- **注意点**：「避ける：朝一番の訪問」

### 土木業・中規模企業
- **アプローチ**：「工事写真の整理時間削減をメインに訴求」
- **準備・心がけ**：「公共工事の書類作成の大変さに共感」
- **実例**：「具体的な業務の困りごとを数値化：実際の工事写真管理の大変さについて深堀りした → 月40時間の書類作成時間短縮ニーズを発見」

### 電気工事業・大規模企業
- **アプローチ**：「複数現場の一元管理をメインに訴求」
- **準備・心がけ**：「セキュリティ面の説明を重視」
- **注意点**：「【警告】大手はセキュリティを最重視」

## データ活用パターン

### 成功事例分析
```typescript
const challengeKeywords = new Map<string, number>();
successCases.forEach(c => {
  if (c.challenge.includes('人材不足')) challengeKeywords.set('人材不足', count + 1);
  if (c.challenge.includes('コスト')) challengeKeywords.set('コスト削減', count + 1);
  // ...
});
```

### 失敗パターン警告
```typescript
const failurePoints = new Map<string, number>();
failurePatterns.forEach(r => {
  if (r.failurePoint.includes('料金')) failurePoints.set('料金説明', count + 1);
  // ...
});
```

## 技術的な実装詳細

### フォームバリデーション
- 必須フィールドの入力チェック
- submit時のバリデーション
- エラー状態の適切な表示

### 状態遷移管理
- input → advice の一方向フロー
- 「キャンセル」ボタンによる状態リセット
- フォームデータの保持

### パフォーマンス最適化
- アドバイス生成の最適化
- 関連事例検索の効率化
- 適切なデータフィルタリング

## 利用フロー

### 1. 商談情報入力
```
企業名：株式会社○○建設（任意）
業種：建設業
地域：関東
企業規模：中規模（50〜300名）
商談の目的：新規開拓
```

### 2. アドバイス生成・表示
- 入力情報に基づく分析実行
- 優先度順のアドバイスリスト生成
- 関連成功事例の抽出・表示

### 3. チェックリスト活用
- 重要なアドバイスから順次確認
- チェックボックスで準備状況を管理
- 完了率の可視化

### 4. 商談準備完了
- 「準備完了」ボタンで終了
- チェック状況は保持されない（セッション限り）

## 他コンポーネントとの連携

### App.tsx
- `showPreMeetingAdvisor`状態によるモーダル制御
- 成功事例（cases）と失敗パターン（reflections）の提供

### salesKnowledge.ts
- `keyInsights`：業界・規模別の重要ポイント
- `salesPatterns`：実際の成功・失敗事例
- データベース化された営業ノウハウの活用

## 設計思想

### 実践重視
- 理論的なアドバイスより実例重視
- 具体的なアクションプランの提供
- チェックリスト形式による実行可能性

### データドリブン
- 蓄積された実績データの活用
- 業界特化の知見の反映
- 継続的な学習による改善

### ユーザビリティ
- 直感的な操作フロー
- 視覚的な優先度表示
- 準備状況の見える化