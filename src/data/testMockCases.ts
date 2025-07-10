import { Case } from '../types/case';

export const testMockCases: Case[] = [
  {
    id: 'test-001',
    title: '小規模建設会社のDX推進事例',
    companyName: 'テスト建設株式会社',
    industry: '建設業',
    region: '関東',
    prefecture: '東京都',
    city: '23区',
    orderStatus: 'won',
    challenges: ['人手不足による工期遅延'],
    challengeSummaries: ['人材不足'],
    needs: ['効率化を図りたい'],
    proposals: ['デジタルツール導入'],
    results: ['工期20%短縮'],
    tags: ['受注', 'DX'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'test-002',
    title: '中規模土木会社の業務改善',
    companyName: 'テスト土木工業',
    industry: '土木業',
    region: '関東',
    prefecture: '神奈川県',
    city: '横浜市',
    orderStatus: 'won',
    challenges: ['現場管理の非効率'],
    challengeSummaries: ['管理効率化'],
    needs: ['リアルタイム情報共有'],
    proposals: ['クラウドシステム導入'],
    results: ['管理工数50%削減'],
    tags: ['受注', '効率化'],
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: 'test-003',
    title: '大規模建設会社のシステム統合',
    companyName: 'テスト大手建設',
    industry: '建設業',
    region: '関東',
    prefecture: '東京都',
    city: '千代田区',
    orderStatus: 'won',
    challenges: ['複数システムの乱立'],
    challengeSummaries: ['システム統合'],
    needs: ['統一プラットフォーム'],
    proposals: ['統合システム構築'],
    results: ['業務効率30%向上'],
    tags: ['受注', 'システム'],
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  }
];