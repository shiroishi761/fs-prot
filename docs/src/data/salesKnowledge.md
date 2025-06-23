# Sales Knowledge Database

## 概要
建設業界の営業ノウハウを体系化したデータベース。実際の成功・失敗パターンと業界特化の知見を集約し、商談前アドバイスと振り返り支援機能で活用される。

## データ構造

### SalesPattern
個別の営業事例パターンを定義
```typescript
interface SalesPattern {
  id: string;
  type: 'success' | 'failure';
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  stage: 'approach' | 'hearing' | 'proposal' | 'closing';
  situation: string;
  action: string;
  result: string;
  keyPoint: string;
  tags: string[];
}
```

### KeyInsight
業界・規模別の重要な知見
```typescript
interface KeyInsight {
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  doList: string[];  // やるべきこと
  dontList: string[];  // 避けるべきこと
  effectiveApproach: string[];  // 効果的なアプローチ
}
```

### StageAdvice
商談ステージ別の一般的なアドバイス
```typescript
interface StageAdvice {
  stage: 'approach' | 'hearing' | 'proposal' | 'closing';
  generalTips: string[];
  commonMistakes: string[];
}
```

## 収録データ

### 成功パターン（11件）

#### 建設業
- **小規模（sp001）**：現場理解による共感獲得
- **小規模（sp002）**：スモールスタートプランの効果

#### 土木業  
- **中規模（sp003）**：業務困りごとの数値化
- **中規模（sp004）**：実績と体験機会の提供

#### 電気工事業
- **大規模（sp005）**：経営視点でのメリット可視化

#### 管工事業
- **小規模（sp006）**：実物を見ながらの具体的ヒアリング

### 失敗パターン（5件）

#### 建設業
- **小規模（fp001）**：タイミング配慮不足
- **小規模（fp002）**：価値訴求の順序ミス

#### 土木業
- **中規模（fp003）**：ヒアリング不足による提案ミスマッチ
- **中規模（fp004）**：決裁権限の確認不足

#### 電気工事業
- **大規模（fp005）**：セキュリティ面の軽視

### 業界別インサイト（3件）

#### 建設業・小規模
```typescript
{
  doList: [
    '午後または夕方の訪問を心がける',
    '現場の苦労話に共感を示す',
    'スモールスタートの提案',
    '費用対効果を具体的に示す'
  ],
  dontList: [
    '朝一番の訪問',
    '最初から高額プランの提示',
    'IT用語の多用',
    '現場を知らない態度'
  ],
  effectiveApproach: [
    '人手不足の解消',
    '残業時間の削減',
    '若手育成の効率化'
  ]
}
```

#### 土木業・中規模
```typescript
{
  doList: [
    '公共工事の書類作成の大変さに共感',
    '工事写真管理の効率化を訴求',
    '同業他社の成功事例を紹介',
    'コンプライアンス対応のメリット'
  ],
  effectiveApproach: [
    '工事写真の整理時間削減',
    '電子納品対応',
    '安全管理の強化'
  ]
}
```

#### 電気工事業・大規模
```typescript
{
  doList: [
    'セキュリティ面の説明を重視',
    '全社導入のROIを明確に提示',
    '経営層向けのダッシュボード機能',
    '段階的な導入計画の提示'
  ],
  effectiveApproach: [
    '複数現場の一元管理',
    '経営数値の可視化',
    'BIM連携の可能性'
  ]
}
```

### ステージ別アドバイス（4ステージ）

#### アプローチ段階
- **一般的なコツ**：相手の業務リズム考慮、最初の30秒での興味喚起
- **よくある失敗**：忙しい時間帯の訪問、いきなり商品説明

#### ヒアリング段階
- **一般的なコツ**：8割聞いて2割話す、「なぜ」を3回繰り返し
- **よくある失敗**：自社商品の話ばかり、表面的な課題で満足

#### 提案段階
- **一般的なコツ**：課題解決のストーリー、Before/After明確化
- **よくある失敗**：機能の羅列、相手ニーズとのずれ

#### クロージング段階
- **一般的なコツ**：決裁者同席確認、懸念事項の完全解消
- **よくある失敗**：強引なクロージング、決裁権限の未確認

## 活用方法

### 商談前アドバイス機能での利用

#### 1. 業界・規模マッチング
```typescript
const insight = keyInsights.find(i => 
  i.industry === meetingInfo.industry && i.companySize === meetingInfo.companySize
);
```

#### 2. 成功パターン抽出
```typescript
const relevantSuccessPatterns = salesPatterns.filter(p => 
  p.type === 'success' && 
  p.industry === meetingInfo.industry &&
  p.companySize === meetingInfo.companySize
);
```

#### 3. 失敗警告の生成
- 同業界・同規模の失敗パターンから警告アドバイスを生成
- 「【警告】○○○」形式で注意喚起

### 振り返り機能での利用

#### 1. 会話内容からの情報抽出
```typescript
const industry = ['建設業', '土木業', '電気工事業', '管工事業']
  .find(i => conversationText.includes(i)) || '建設業';
```

#### 2. 類似失敗パターンの検索
```typescript
const similarFailures = salesPatterns.filter(p => 
  p.type === 'failure' && 
  p.industry === industry && 
  p.companySize === companySize
);
```

#### 3. 改善アドバイスの生成
- 成功パターンからの学び
- 業界特化の注意点
- ステージ別の改善ポイント

## データ設計の特徴

### 実践重視
- 理論的なフレームワークより実際の事例重視
- 具体的なシチュエーションと行動の記録
- 結果と学びの明確な関連付け

### 業界特化
- 建設業界特有の商習慣を反映
- 企業規模による違いを考慮
- 専門用語や業界背景の理解

### 段階的学習
- 商談ステージ別の知見整理
- 失敗パターンからの学習促進
- 継続的な改善サイクルの支援

## 拡張可能性

### データ追加の方向性
1. **業界拡張**：造園業、解体工事業、内装工事業等
2. **パターン詳細化**：より具体的なシチュエーション
3. **地域特性**：地域別の商習慣の違い
4. **時系列変化**：季節性や市況による変動

### 機能拡張への活用
1. **AIモデル学習**：パターンデータによるモデル訓練
2. **予測機能**：成功確率の事前計算
3. **レコメンド機能**：最適な提案内容の推奨
4. **分析ダッシュボード**：営業成果の可視化

## データ品質管理

### 情報源の明確化
- 実際の営業現場からの知見収集
- 業界エキスパートのレビュー
- 継続的なデータ検証と更新

### 一貫性の確保
- 統一されたフォーマットでの記録
- タグ付けによる分類の一貫性
- 定期的なデータクリーニング

### プライバシー配慮
- 個人情報や企業情報の匿名化
- 一般化された知見としての抽象化
- 機密情報の適切な管理