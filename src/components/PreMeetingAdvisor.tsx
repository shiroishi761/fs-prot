import React, { useState } from 'react';
import { Case, Reflection, INDUSTRIES, REGIONS } from '../types/case';
import { salesPatterns, keyInsights } from '../data/salesKnowledge';

interface PreMeetingAdvisorProps {
  onClose: () => void;
  cases: Case[];
  reflections: Reflection[];
}

interface MeetingInfo {
  industry: string;
  region: string;
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

export const PreMeetingAdvisor: React.FC<PreMeetingAdvisorProps> = ({ 
  onClose, 
  cases,
  reflections 
}) => {
  const [step, setStep] = useState<'input' | 'advice'>('input');
  const [meetingInfo, setMeetingInfo] = useState<MeetingInfo>({
    industry: '',
    region: ''
  });
  const [adviceList, setAdviceList] = useState<Advice[]>([]);
  const [relatedCases, setRelatedCases] = useState<Case[]>([]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // ステージラベルの変換
  const getStageLabel = (stage: string): string => {
    const stageLabels: { [key: string]: string } = {
      'approach': 'アプローチ',
      'hearing': 'ヒアリング',
      'proposal': '提案',
      'closing': 'クロージング'
    };
    return stageLabels[stage] || stage;
  };

  // 商談情報から関連する成功事例と失敗パターンを分析
  const analyzePatterns = () => {
    // 関連する成功事例を検索
    const successCases = cases.filter(c => {
      const sameIndustry = c.industry === meetingInfo.industry;
      const sameRegion = c.region === meetingInfo.region;
      
      // 業種と地域の両方または少なくとも一つが一致
      return sameIndustry && sameRegion;
    }).slice(0, 5);

    setRelatedCases(successCases);

    // 関連する失敗パターンを検索
    const failurePatterns = reflections.filter(r => {
      const sameIndustry = r.industry === meetingInfo.industry;
      const sameRegion = r.region === meetingInfo.region;
      return sameIndustry || sameRegion;
    });

    // アドバイスを生成
    const generatedAdvice: Advice[] = [];

    // ノウハウデータベースからのアドバイス
    const insight = keyInsights.find(i => 
      i.industry === meetingInfo.industry
    );

    if (insight) {
      // 効果的なアプローチ
      insight.effectiveApproach.forEach((approach, index) => {
        generatedAdvice.push({
          category: 'アプローチ',
          title: `${approach}をメインに訴求`,
          description: `${meetingInfo.industry}では、${approach}が特に関心を持たれやすいです。`,
          priority: index === 0 ? 'high' : 'medium',
          basedOn: 'success'
        });
      });

      // やるべきこと
      insight.doList.forEach((todo, index) => {
        generatedAdvice.push({
          category: '準備・心がけ',
          title: todo,
          description: `${meetingInfo.industry}での成功パターンに基づく重要なポイントです。`,
          priority: index < 2 ? 'high' : 'medium',
          basedOn: 'success'
        });
      });

      // 避けるべきこと
      insight.dontList.forEach((dont, index) => {
        generatedAdvice.push({
          category: '注意点',
          title: `避ける：${dont}`,
          description: `${meetingInfo.industry}では失敗につながりやすい行動です。注意しましょう。`,
          priority: index < 2 ? 'high' : 'medium',
          basedOn: 'failure'
        });
      });
    }

    // 成功パターンからのアドバイス
    const relevantSuccessPatterns = salesPatterns.filter(p => 
      p.type === 'success' && 
      p.industry === meetingInfo.industry &&
      ['approach', 'hearing'].includes(p.stage)
    );

    relevantSuccessPatterns.slice(0, 3).forEach(pattern => {
      generatedAdvice.push({
        category: getStageLabel(pattern.stage),
        title: pattern.keyPoint,
        description: `実例：${pattern.action} → ${pattern.result}`,
        priority: 'medium',
        basedOn: 'success'
      });
    });

    // 失敗パターンからの警告
    const relevantFailurePatterns = salesPatterns.filter(p => 
      p.type === 'failure' && 
      p.industry === meetingInfo.industry &&
      ['approach', 'hearing'].includes(p.stage)
    );

    relevantFailurePatterns.slice(0, 2).forEach(pattern => {
      generatedAdvice.push({
        category: '注意点',
        title: `【警告】${pattern.keyPoint}`,
        description: `失敗例：${pattern.action} → ${pattern.result}`,
        priority: 'high',
        basedOn: 'failure'
      });
    });

    // 成功事例からのアドバイス
    if (successCases.length > 0) {
      // よく出てくる課題を分析
      const challengeKeywords = new Map<string, number>();
      successCases.forEach(c => {
        // 新しいデータ構造と古いデータ構造の両方に対応
        const challenges = c.challenges?.length ? c.challenges : (c.challenge ? [c.challenge] : []);
        
        challenges.forEach(challenge => {
          if (challenge.includes('人材不足')) challengeKeywords.set('人材不足', (challengeKeywords.get('人材不足') || 0) + 1);
          if (challenge.includes('コスト')) challengeKeywords.set('コスト削減', (challengeKeywords.get('コスト削減') || 0) + 1);
          if (challenge.includes('工期')) challengeKeywords.set('工期短縮', (challengeKeywords.get('工期短縮') || 0) + 1);
          if (challenge.includes('品質')) challengeKeywords.set('品質向上', (challengeKeywords.get('品質向上') || 0) + 1);
        });
      });

      // 最も多い課題についてアドバイス
      const topChallenge = Array.from(challengeKeywords.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (topChallenge) {
        generatedAdvice.push({
          category: 'アプローチ',
          title: `${topChallenge[0]}の話題から入る`,
          description: `同業他社では${topChallenge[0]}に関する課題を抱えているケースが多いです。この話題から入ると共感を得やすいでしょう。`,
          priority: 'high',
          basedOn: 'success'
        });
      }
    }

    // 失敗パターンからのアドバイス
    if (failurePatterns.length > 0) {
      // よくある失敗ポイント
      const failurePoints = new Map<string, number>();
      failurePatterns.forEach(r => {
        if (r.failurePoint.includes('料金') || r.failurePoint.includes('価格')) {
          failurePoints.set('料金説明', (failurePoints.get('料金説明') || 0) + 1);
        }
        if (r.failurePoint.includes('機能') || r.failurePoint.includes('説明')) {
          failurePoints.set('機能説明', (failurePoints.get('機能説明') || 0) + 1);
        }
        if (r.failurePoint.includes('導入') || r.failurePoint.includes('実装')) {
          failurePoints.set('導入プロセス', (failurePoints.get('導入プロセス') || 0) + 1);
        }
      });

      // 失敗を避けるためのアドバイス
      failurePoints.forEach((count, point) => {
        if (count >= 2) {
          if (point === '料金説明') {
            generatedAdvice.push({
              category: '注意点',
              title: '料金説明は後半に',
              description: '過去の失敗例では、早い段階での料金説明が顧客の興味を失わせました。まず価値を伝えてから料金の話をしましょう。',
              priority: 'high',
              basedOn: 'failure'
            });
          } else if (point === '機能説明') {
            generatedAdvice.push({
              category: '注意点',
              title: '機能より効果を重視',
              description: '機能の詳細説明よりも、顧客の課題をどう解決するかに焦点を当てましょう。',
              priority: 'medium',
              basedOn: 'failure'
            });
          }
        }
      });
    }

    // 一般的なアドバイス
    generatedAdvice.push({
      category: '準備',
      title: '競合他社の情報を確認',
      description: `${meetingInfo.industry}では複数のサービスを比較検討することが多いです。競合との差別化ポイントを明確にしておきましょう。`,
      priority: 'medium',
      basedOn: undefined
    });

    generatedAdvice.push({
      category: '資料',
      title: '導入事例資料を準備',
      description: '同業他社の成功事例を具体的に示せる資料があると説得力が増します。',
      priority: 'medium',
      basedOn: undefined
    });


    setAdviceList(generatedAdvice.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzePatterns();
    setStep('advice');
  };

  const handleCheckToggle = (adviceTitle: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(adviceTitle)) {
        newSet.delete(adviceTitle);
      } else {
        newSet.add(adviceTitle);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '重要';
      case 'medium': return '推奨';
      case 'low': return '参考';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {step === 'input' ? '商談前アドバイス' : '商談準備チェックリスト'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  企業名（任意）
                </label>
                <input
                  type="text"
                  value={meetingInfo.companyName || ''}
                  onChange={(e) => setMeetingInfo({...meetingInfo, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="株式会社◯◯建設"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  業種 <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetingInfo.industry}
                  onChange={(e) => setMeetingInfo({...meetingInfo, industry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地域 <span className="text-red-500">*</span>
                </label>
                <select
                  value={meetingInfo.region}
                  onChange={(e) => setMeetingInfo({...meetingInfo, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商談の目的（任意）
                </label>
                <textarea
                  value={meetingInfo.meetingPurpose || ''}
                  onChange={(e) => setMeetingInfo({...meetingInfo, meetingPurpose: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="新規開拓、既存顧客のフォロー、提案など"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  アドバイスを表示
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* 商談情報サマリー */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">商談情報</h4>
              <div className="text-sm text-gray-600 space-y-1">
                {meetingInfo.companyName && <p>企業名: {meetingInfo.companyName}</p>}
                <p>業種: {meetingInfo.industry} / 地域: {meetingInfo.region}</p>
              </div>
            </div>

            {/* アドバイスリスト */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {adviceList.map((advice, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getPriorityColor(advice.priority)}`}
                >
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={checkedItems.has(advice.title)}
                      onChange={() => handleCheckToggle(advice.title)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-sm">{advice.title}</h5>
                        <span className="text-xs font-medium px-2 py-1 rounded">
                          {getPriorityLabel(advice.priority)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{advice.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded">{advice.category}</span>
                        {advice.basedOn && (
                          <span className="ml-2">
                            {advice.basedOn === 'success' ? '✅ 成功事例より' : '⚠️ 失敗事例より'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 関連する成功事例 */}
            {relatedCases.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">参考になる成功事例</h4>
                <div className="space-y-2">
                  {relatedCases.slice(0, 3).map((c, index) => (
                    <div key={c.id} className="text-sm bg-green-50 p-3 rounded border border-green-200">
                      <p className="font-medium text-green-800">{index + 1}. {c.title}</p>
                      <p className="text-xs text-gray-600 mt-1">課題: {
                        (c.challenges?.length ? c.challenges[0] : c.challenge || '情報なし').substring(0, 50)
                      }...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-2 pt-4 border-t">
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                準備完了
              </button>
            </div>

            <div className="text-center text-xs text-gray-500">
              チェック済み: {checkedItems.size} / {adviceList.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};