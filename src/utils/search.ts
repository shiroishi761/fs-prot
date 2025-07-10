import { Case, SearchFilters, SearchResult } from '../types/case';

/**
 * 文字列の類似度を計算（レーベンシュタイン距離の簡易版）
 * @param str1 比較する文字列1
 * @param str2 比較する文字列2
 * @returns 0-1の範囲の類似度スコア（1が完全一致）
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = calculateEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * 編集距離（レーベンシュタイン距離）を計算
 */
function calculateEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 置換
          matrix[i][j - 1] + 1,     // 挿入
          matrix[i - 1][j] + 1      // 削除
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * 部分文字列マッチングのスコアを計算
 */
function calculateSubstringScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // 完全一致
  if (lowerText === lowerQuery) {
    return 1.0;
  }
  
  // 部分一致
  if (lowerText.includes(lowerQuery)) {
    // クエリの長さとテキストの長さの比率でスコアを調整
    return 0.8 * (lowerQuery.length / lowerText.length);
  }
  
  // 各単語での部分一致をチェック
  const queryWords = lowerQuery.split(/\s+/);
  const textWords = lowerText.split(/\s+/);
  let matchedWords = 0;
  
  for (const queryWord of queryWords) {
    for (const textWord of textWords) {
      if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        matchedWords++;
        break;
      }
    }
  }
  
  if (matchedWords > 0) {
    return 0.6 * (matchedWords / queryWords.length);
  }
  
  // ファジーマッチング
  return calculateStringSimilarity(lowerText, lowerQuery) * 0.4;
}

/**
 * ケースの関連度スコアを計算
 */
function calculateRelevanceScore(caseItem: Case, query: string): {
  score: number;
  matchedFields: string[];
} {
  const matchedFields: string[] = [];
  let totalScore = 0;
  
  // タイトルのマッチング（最も重要）
  const titleScore = calculateSubstringScore(caseItem.title, query) * 3.0;
  if (titleScore > 0.1) {
    matchedFields.push('title');
    totalScore += titleScore;
  }
  
  // 課題のマッチング（重要）
  let challengeScore = 0;
  if (caseItem.challenges?.length) {
    // 新しいデータ構造：複数の課題から最高スコアを使用
    challengeScore = Math.max(...caseItem.challenges.map(challenge => 
      calculateSubstringScore(challenge, query)
    )) * 2.0;
  } else if (caseItem.challenge) {
    // 後方互換性：古いデータ構造
    challengeScore = calculateSubstringScore(caseItem.challenge, query) * 2.0;
  }
  if (challengeScore > 0.1) {
    matchedFields.push('challenge');
    totalScore += challengeScore;
  }
  
  // 提案のマッチング
  let proposalScore = 0;
  if (caseItem.proposals?.length) {
    // 新しいデータ構造：複数の提案から最高スコアを使用
    proposalScore = Math.max(...caseItem.proposals.map(proposal => 
      calculateSubstringScore(proposal, query)
    )) * 1.5;
  } else if (caseItem.proposal) {
    // 後方互換性：古いデータ構造
    proposalScore = calculateSubstringScore(caseItem.proposal, query) * 1.5;
  }
  if (proposalScore > 0.1) {
    matchedFields.push('proposal');
    totalScore += proposalScore;
  }
  
  // 結果のマッチング
  let resultScore = 0;
  if (caseItem.results?.length) {
    // 新しいデータ構造：複数の結果から最高スコアを使用
    resultScore = Math.max(...caseItem.results.map(result => 
      calculateSubstringScore(result, query)
    )) * 1.5;
  } else if (caseItem.result) {
    // 後方互換性：古いデータ構造
    resultScore = calculateSubstringScore(caseItem.result, query) * 1.5;
  }
  if (resultScore > 0.1) {
    matchedFields.push('result');
    totalScore += resultScore;
  }
  
  // タグのマッチング
  for (const tag of caseItem.tags) {
    const tagScore = calculateSubstringScore(tag, query) * 1.0;
    if (tagScore > 0.5) {
      if (!matchedFields.includes('tags')) {
        matchedFields.push('tags');
      }
      totalScore += tagScore;
    }
  }
  
  // 業界のマッチング
  const industryScore = calculateSubstringScore(caseItem.industry, query) * 0.5;
  if (industryScore > 0.5) {
    matchedFields.push('industry');
    totalScore += industryScore;
  }
  
  // 地域のマッチング
  const regionScore = calculateSubstringScore(caseItem.region, query) * 0.5;
  if (regionScore > 0.5) {
    matchedFields.push('region');
    totalScore += regionScore;
  }
  
  // 都道府県のマッチング
  if (caseItem.prefecture) {
    const prefectureScore = calculateSubstringScore(caseItem.prefecture, query) * 0.7;
    if (prefectureScore > 0.5) {
      matchedFields.push('prefecture');
      totalScore += prefectureScore;
    }
  }
  
  // 市区町村のマッチング
  if (caseItem.city) {
    const cityScore = calculateSubstringScore(caseItem.city, query) * 0.8;
    if (cityScore > 0.5) {
      matchedFields.push('city');
      totalScore += cityScore;
    }
  }
  
  return {
    score: Math.min(totalScore / 10, 1.0), // 0-1の範囲に正規化
    matchedFields
  };
}

/**
 * ハイライト用のテキストを生成
 */
function createHighlight(text: string, query: string, maxLength: number = 150): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/);
  
  // 最初にマッチした位置を探す
  let bestStart = 0;
  let bestScore = 0;
  
  for (let i = 0; i < text.length - maxLength; i++) {
    const snippet = lowerText.substring(i, i + maxLength);
    let score = 0;
    
    for (const word of queryWords) {
      if (snippet.includes(word)) {
        score++;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestStart = i;
    }
  }
  
  // 文の境界を考慮して調整
  const start = Math.max(0, text.lastIndexOf('。', bestStart) + 1);
  const end = Math.min(text.length, text.indexOf('。', bestStart + maxLength) + 1);
  
  let highlight = text.substring(start, end || start + maxLength);
  if (start > 0) highlight = '...' + highlight;
  if (end < text.length) highlight = highlight + '...';
  
  return highlight;
}

/**
 * フィルターに基づいてケースを絞り込む
 */
function applyFilters(cases: Case[], filters: SearchFilters, favoritesSet?: Set<string>): Case[] {
  let filteredCases = [...cases];
  
  // 業界でフィルター（複数選択対応）
  if (filters.industries && filters.industries.length > 0) {
    filteredCases = filteredCases.filter(c => filters.industries!.includes(c.industry));
  } else if (filters.industry) {
    // 後方互換性のため古いフィルターも対応
    filteredCases = filteredCases.filter(c => c.industry === filters.industry);
  }
  
  // 地域でフィルター（複数選択対応）
  if (filters.regions && filters.regions.length > 0) {
    filteredCases = filteredCases.filter(c => filters.regions!.includes(c.region));
  } else if (filters.region) {
    // 後方互換性のため古いフィルターも対応
    filteredCases = filteredCases.filter(c => c.region === filters.region);
  }
  
  // 都道府県でフィルター
  if (filters.prefecture) {
    filteredCases = filteredCases.filter(c => c.prefecture === filters.prefecture);
  }
  
  // 市区町村でフィルター
  if (filters.city) {
    filteredCases = filteredCases.filter(c => c.city === filters.city);
  }
  
  
  // タグでフィルター
  if (filters.tags && filters.tags.length > 0) {
    filteredCases = filteredCases.filter(c => 
      filters.tags!.some(tag => c.tags.includes(tag))
    );
  }
  
  // ネックタイプでフィルター
  if (filters.neckTypes && filters.neckTypes.length > 0) {
    filteredCases = filteredCases.filter(c => 
      c.neckType && filters.neckTypes!.includes(c.neckType)
    );
  }
  
  // 5大活用（課題）でフィルター
  if (filters.challenges && filters.challenges.length > 0) {
    filteredCases = filteredCases.filter(c => 
      filters.challenges!.some(challenge => c.tags.includes(challenge))
    );
  }
  
  // 日付範囲でフィルター
  if (filters.dateFrom) {
    filteredCases = filteredCases.filter(c => 
      c.createdAt >= filters.dateFrom!
    );
  }
  
  if (filters.dateTo) {
    filteredCases = filteredCases.filter(c => 
      c.createdAt <= filters.dateTo!
    );
  }
  
  // お気に入りでフィルター
  if (filters.favorites && favoritesSet) {
    filteredCases = filteredCases.filter(c => favoritesSet.has(c.id));
  }
  
  // 公開ステータスでフィルター
  if (filters.publicationStatus) {
    filteredCases = filteredCases.filter(c => {
      if (filters.publicationStatus === 'published') {
        // 受注・失注は公開済み
        return c.orderStatus === 'won' || c.orderStatus === 'lost';
      } else if (filters.publicationStatus === 'unpublished') {
        // 進行中は非公開
        return c.orderStatus === 'in_progress';
      }
      return true;
    });
  }
  
  return filteredCases;
}

/**
 * ケースを検索する
 */
export function searchCases(
  cases: Case[],
  filters: SearchFilters,
  favoritesSet?: Set<string>
): SearchResult[] {
  // フィルターを適用
  let filteredCases = applyFilters(cases, filters, favoritesSet);
  
  // クエリがない場合は、フィルター結果を最新順で返す
  if (!filters.query || filters.query.trim() === '') {
    return filteredCases
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(c => ({
        case: c,
        relevanceScore: 1.0,
        matchedFields: []
      }));
  }
  
  // クエリで検索
  const query = filters.query.trim();
  const results: SearchResult[] = [];
  
  for (const caseItem of filteredCases) {
    const { score, matchedFields } = calculateRelevanceScore(caseItem, query);
    
    if (score > 0.1) { // 閾値以上のスコアのみ含める
      const result: SearchResult = {
        case: caseItem,
        relevanceScore: score,
        matchedFields,
        highlights: {}
      };
      
      // ハイライトを生成
      if (matchedFields.includes('title')) {
        result.highlights!.title = createHighlight(caseItem.title, query, 100);
      }
      if (matchedFields.includes('challenge')) {
        const challengeText = caseItem.challenges?.length ? caseItem.challenges[0] : caseItem.challenge;
        if (challengeText) {
          result.highlights!.challenge = createHighlight(challengeText, query);
        }
      }
      if (matchedFields.includes('proposal')) {
        const proposalText = caseItem.proposals?.length ? caseItem.proposals[0] : caseItem.proposal;
        if (proposalText) {
          result.highlights!.proposal = createHighlight(proposalText, query);
        }
      }
      if (matchedFields.includes('result')) {
        const resultText = caseItem.results?.length ? caseItem.results[0] : caseItem.result;
        if (resultText) {
          result.highlights!.result = createHighlight(resultText, query);
        }
      }
      
      results.push(result);
    }
  }
  
  // スコアの高い順にソート、同じスコアの場合は最新順
  results.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.case.createdAt.getTime() - a.case.createdAt.getTime();
  });
  
  return results;
}

/**
 * 関連するケースを取得
 */
export function getRelatedCases(
  currentCase: Case,
  allCases: Case[],
  limit: number = 5
): Case[] {
  const otherCases = allCases.filter(c => c.id !== currentCase.id);
  const scoredCases: { case: Case; score: number }[] = [];
  
  for (const otherCase of otherCases) {
    let score = 0;
    
    // 同じ業界
    if (otherCase.industry === currentCase.industry) {
      score += 3;
    }
    
    // 同じ地域
    if (otherCase.region === currentCase.region) {
      score += 1;
    }
    
    // 共通のタグ
    const commonTags = currentCase.tags.filter(tag => 
      otherCase.tags.includes(tag)
    );
    score += commonTags.length * 1.5;
    
    if (score > 0) {
      scoredCases.push({ case: otherCase, score });
    }
  }
  
  // スコアの高い順にソートして上位を返す
  return scoredCases
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.case);
}

/**
 * 検索クエリの候補を生成（オートコンプリート用）
 */
export function generateSearchSuggestions(
  cases: Case[],
  partialQuery: string,
  limit: number = 10
): string[] {
  const suggestions = new Set<string>();
  const lowerQuery = partialQuery.toLowerCase();
  
  // タイトルから候補を抽出
  for (const caseItem of cases) {
    const words = caseItem.title.split(/[\s、。・]/);
    for (const word of words) {
      if (word.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(word);
      }
    }
  }
  
  // タグから候補を抽出
  for (const caseItem of cases) {
    for (const tag of caseItem.tags) {
      if (tag.toLowerCase().startsWith(lowerQuery)) {
        suggestions.add(tag);
      }
    }
  }
  
  // 業界名から候補を抽出
  for (const caseItem of cases) {
    if (caseItem.industry.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(caseItem.industry);
    }
  }
  
  // 地域名から候補を抽出
  for (const caseItem of cases) {
    if (caseItem.region.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(caseItem.region);
    }
  }
  
  // 都道府県から候補を抽出
  for (const caseItem of cases) {
    if (caseItem.prefecture && caseItem.prefecture.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(caseItem.prefecture);
    }
  }
  
  // 市区町村から候補を抽出
  for (const caseItem of cases) {
    if (caseItem.city && caseItem.city.toLowerCase().startsWith(lowerQuery)) {
      suggestions.add(caseItem.city);
    }
  }
  
  return Array.from(suggestions)
    .sort((a, b) => a.length - b.length)
    .slice(0, limit);
}