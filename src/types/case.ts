// 事例データの型定義
export interface Case {
  id: string;
  title: string;
  industry: string;
  region: string;
  companySize: 'small' | 'medium' | 'large'; // small: ~50名, medium: 50-300名, large: 300名~
  challenge: string;
  proposal: string;
  result: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 検索フィルターの型定義
export interface SearchFilters {
  query?: string;
  industry?: string;
  region?: string;
  companySize?: 'small' | 'medium' | 'large';
  tags?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

// 検索結果の型定義
export interface SearchResult {
  case: Case;
  relevanceScore: number;
  matchedFields: string[];
  highlights?: {
    title?: string;
    challenge?: string;
    proposal?: string;
    result?: string;
  };
}

// 業界の定義
export const INDUSTRIES = [
  '建設業',
  '土木業',
  '電気工事業',
  '管工事業',
  '造園業',
  '解体工事業',
  '内装工事業',
  '塗装工事業',
  '防水工事業',
  'その他専門工事業'
] as const;

// 地域の定義
export const REGIONS = [
  '北海道',
  '東北',
  '関東',
  '中部',
  '近畿',
  '中国',
  '四国',
  '九州・沖縄'
] as const;

// よく使われるタグ
export const COMMON_TAGS = [
  '工期短縮',
  'コスト削減',
  '人材不足解決',
  '安全管理',
  'DX推進',
  '生産性向上',
  '品質向上',
  '働き方改革',
  'ペーパーレス化',
  '情報共有',
  'リモートワーク',
  '教育・研修',
  'BIM/CIM活用',
  'IoT活用',
  'AI活用'
] as const;