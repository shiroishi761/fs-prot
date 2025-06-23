// 建設業界営業のノウハウデータ

export interface SalesPattern {
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

export const salesPatterns: SalesPattern[] = [
  // ============ 成功パターン ============
  // 建設業 - 小規模
  {
    id: 'sp001',
    type: 'success',
    industry: '建設業',
    companySize: 'small',
    stage: 'approach',
    situation: '従業員30名の地場ゼネコン。社長が現場にも出ている',
    action: '朝の現場巡回時間を避けて、午後に訪問。現場の苦労話から入った',
    result: '社長と意気投合し、詳しい話を聞いてもらえた',
    keyPoint: '現場を理解していることを示し、共感を得る',
    tags: ['タイミング', '共感', '現場理解']
  },
  {
    id: 'sp002',
    type: 'success',
    industry: '建設業',
    companySize: 'small',
    stage: 'proposal',
    situation: '予算が限られている小規模建設会社',
    action: '必要最小限の機能から始められるスモールスタートプランを提案',
    result: '初期投資を抑えられることで導入決定',
    keyPoint: '段階的導入で初期コストを抑える',
    tags: ['コスト', 'スモールスタート', '段階導入']
  },
  
  // 土木業 - 中規模
  {
    id: 'sp003',
    type: 'success',
    industry: '土木業',
    companySize: 'medium',
    stage: 'hearing',
    situation: '公共工事が多く、書類作成に追われている',
    action: '実際の工事写真管理の大変さについて深堀りした',
    result: '月40時間の書類作成時間短縮ニーズを発見',
    keyPoint: '具体的な業務の困りごとを数値化',
    tags: ['ヒアリング', '業務効率化', '数値化']
  },
  {
    id: 'sp004',
    type: 'success',
    industry: '土木業',
    companySize: 'medium',
    stage: 'closing',
    situation: '導入に慎重な管理職がいる',
    action: '同業他社の成功事例を詳しく説明し、お試し期間を設定',
    result: '1ヶ月の試用後、効果を実感して本契約',
    keyPoint: '実績と体験機会の提供',
    tags: ['事例紹介', 'お試し', 'リスク軽減']
  },

  // 電気工事業 - 大規模
  {
    id: 'sp005',
    type: 'success',
    industry: '電気工事業',
    companySize: 'large',
    stage: 'proposal',
    situation: '複数の現場を管理し、進捗把握が課題',
    action: 'ダッシュボード機能で全現場を一元管理できることをデモ',
    result: '経営層が導入効果を理解し、全社導入決定',
    keyPoint: '経営視点でのメリットを可視化',
    tags: ['デモ', '一元管理', '経営メリット']
  },

  // ============ 失敗パターン ============
  // 建設業 - 小規模
  {
    id: 'fp001',
    type: 'failure',
    industry: '建設業',
    companySize: 'small',
    stage: 'approach',
    situation: '朝一番の忙しい時間に訪問',
    action: '現場に向かう準備中の社長に声をかけた',
    result: '「忙しいから後にして」と断られた',
    keyPoint: '建設業の朝は現場準備で多忙',
    tags: ['タイミング', '訪問時間', '配慮不足']
  },
  {
    id: 'fp002',
    type: 'failure',
    industry: '建設業',
    companySize: 'small',
    stage: 'proposal',
    situation: 'IT投資に消極的な社長',
    action: '最初から全機能の説明と料金を提示',
    result: '「うちには高すぎる」と即断られた',
    keyPoint: '価格の前に価値を伝える必要がある',
    tags: ['料金提示', '価値訴求', '順序']
  },

  // 土木業 - 中規模
  {
    id: 'fp003',
    type: 'failure',
    industry: '土木業',
    companySize: 'medium',
    stage: 'hearing',
    situation: '現場の課題を聞かずに提案を始めた',
    action: '一般的な機能説明から入った',
    result: '「うちの現場には合わない」と興味を失われた',
    keyPoint: '業界特有の課題を理解せずに提案',
    tags: ['ヒアリング不足', '一般論', 'ミスマッチ']
  },
  {
    id: 'fp004',
    type: 'failure',
    industry: '土木業',
    companySize: 'medium',
    stage: 'closing',
    situation: '決裁者不在で担当者とだけ話を進めた',
    action: '現場担当者の了解だけで進めようとした',
    result: '最終段階で社長からストップがかかった',
    keyPoint: '決裁権限の確認不足',
    tags: ['決裁者', '権限確認', 'プロセス']
  },

  // 管工事業 - 特有のパターン
  {
    id: 'sp006',
    type: 'success',
    industry: '管工事業',
    companySize: 'small',
    stage: 'hearing',
    situation: '図面管理と現場との情報共有が課題',
    action: '実際の配管図面を見せてもらいながら課題を聞いた',
    result: '図面の変更履歴管理ニーズを発見',
    keyPoint: '実物を見ながらの具体的なヒアリング',
    tags: ['図面管理', '具体例', 'ビジュアル']
  },
  {
    id: 'fp005',
    type: 'failure',
    industry: '電気工事業',
    companySize: 'large',
    stage: 'proposal',
    situation: 'セキュリティを重視する大手企業',
    action: 'クラウドの利便性ばかりを強調',
    result: 'セキュリティ面の懸念を払拭できず',
    keyPoint: '大手はセキュリティを最重視',
    tags: ['セキュリティ', '優先順位', '大手']
  }
];

// 業界・規模別の重要ポイント
export interface KeyInsight {
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  doList: string[];  // やるべきこと
  dontList: string[];  // 避けるべきこと
  effectiveApproach: string[];  // 効果的なアプローチ
}

export const keyInsights: KeyInsight[] = [
  {
    industry: '建設業',
    companySize: 'small',
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
  },
  {
    industry: '土木業',
    companySize: 'medium',
    doList: [
      '公共工事の書類作成の大変さに共感',
      '工事写真管理の効率化を訴求',
      '同業他社の成功事例を紹介',
      'コンプライアンス対応のメリット'
    ],
    dontList: [
      '一般的な機能説明',
      '現場を見ずに提案',
      '決裁者を無視した商談',
      '導入の手間を軽視'
    ],
    effectiveApproach: [
      '工事写真の整理時間削減',
      '電子納品対応',
      '安全管理の強化'
    ]
  },
  {
    industry: '電気工事業',
    companySize: 'large',
    doList: [
      'セキュリティ面の説明を重視',
      '全社導入のROIを明確に提示',
      '経営層向けのダッシュボード機能',
      '段階的な導入計画の提示'
    ],
    dontList: [
      'セキュリティを軽視した説明',
      '現場レベルの機能だけを訴求',
      '他社事例の安易な転用',
      '短期的なメリットのみ強調'
    ],
    effectiveApproach: [
      '複数現場の一元管理',
      '経営数値の可視化',
      'BIM連携の可能性'
    ]
  }
];

// 商談ステージ別のアドバイス
export interface StageAdvice {
  stage: 'approach' | 'hearing' | 'proposal' | 'closing';
  generalTips: string[];
  commonMistakes: string[];
}

export const stageAdvices: StageAdvice[] = [
  {
    stage: 'approach',
    generalTips: [
      '訪問時間は相手の業務リズムを考慮',
      '最初の30秒で相手の興味を引く',
      '共通の話題や課題から入る',
      '押し売りではなく情報提供のスタンス'
    ],
    commonMistakes: [
      '忙しい時間帯の訪問',
      'いきなり商品説明',
      '相手の話を聞かない',
      '専門用語の多用'
    ]
  },
  {
    stage: 'hearing',
    generalTips: [
      '8割聞いて2割話す',
      '具体的な数値で課題を把握',
      '「なぜ」を3回繰り返して深堀り',
      '現場の実態を理解する'
    ],
    commonMistakes: [
      '自社商品の話ばかり',
      '表面的な課題で満足',
      '決めつけや憶測',
      'メモを取らない'
    ]
  },
  {
    stage: 'proposal',
    generalTips: [
      '課題解決のストーリーで提案',
      'Before/Afterを明確に',
      'デモや事例で具体的に',
      '投資対効果を数値化'
    ],
    commonMistakes: [
      '機能の羅列',
      '相手のニーズとずれた提案',
      '料金を最初に提示',
      '導入後のイメージが湧かない'
    ]
  },
  {
    stage: 'closing',
    generalTips: [
      '決裁者の同席を確認',
      '懸念事項を全て解消',
      '導入スケジュールを明確に',
      '成功までのサポート体制を説明'
    ],
    commonMistakes: [
      '強引なクロージング',
      '決裁権限の未確認',
      '口約束で終わる',
      'アフターフォローの説明不足'
    ]
  }
];