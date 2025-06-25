import { Case } from '../types/case';

/**
 * ケースから基本情報を作成する
 */
export const createBasicInfoFromCase = (caseData: Case) => ({
  companyName: caseData.companyName || '',
  industry: caseData.industries || [caseData.industry],
  mainIndustry: caseData.industry,
  region: caseData.region,
  prefecture: caseData.prefecture || '',
  city: caseData.city || '',
  companySize: caseData.companySize
});

/**
 * 新しいケースIDを生成する
 */
export const generateCaseId = () => `case-${Date.now()}`;

/**
 * ケースのタグを更新する
 */
export const updateCaseTags = (orderStatus: string) => {
  switch (orderStatus) {
    case 'won':
      return ['受注'];
    case 'lost':
      return ['失注'];
    default:
      return ['進行中'];
  }
};