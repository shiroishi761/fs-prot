import React, { useState } from 'react';
import { Case, INDUSTRIES, REGIONS, AREA_HIERARCHY, NECK_TYPES, FIVE_CHALLENGES } from '../types/case';

interface CaseBasicInfo {
  companyName: string;
  industry: string[];
  mainIndustry: string;
  region: string;
  prefecture: string;
  city: string;
}

interface CaseReviewEditProps {
  basicInfo: CaseBasicInfo;
  aiGeneratedData: Partial<Case>;
  conversationHistory?: string;
  messages?: any[];
  onSave: (caseData: Partial<Case>) => void;
  onBackToChat: () => void;
}


export const CaseReviewEdit: React.FC<CaseReviewEditProps> = ({
  basicInfo,
  aiGeneratedData,
  onSave,
  onBackToChat
}) => {

  const [editedData, setEditedData] = useState<Partial<Case>>(() => {
    const defaultData = {
      orderStatus: 'won' as const, // Default to won (受注)
      title: aiGeneratedData.title || '',
      companyName: aiGeneratedData.companyName || basicInfo.companyName,
      industry: aiGeneratedData.industry || basicInfo.mainIndustry,
      region: aiGeneratedData.region || basicInfo.region,
      prefecture: aiGeneratedData.prefecture || basicInfo.prefecture,
      city: aiGeneratedData.city || basicInfo.city,
      challenges: aiGeneratedData.challenges || [''],
      challengeSummaries: aiGeneratedData.challengeSummaries || [''],
      needs: aiGeneratedData.needs || [''],
      proposals: aiGeneratedData.proposals || [''],
      results: aiGeneratedData.results || [''],
      tags: aiGeneratedData.tags || [],
      neckType: aiGeneratedData.neckType || undefined,
      customerStatement: aiGeneratedData.customerStatement || '',
      action: aiGeneratedData.action || ''
    };
    
    // Only override orderStatus if it's explicitly set in aiGeneratedData and is different from default
    return {
      ...defaultData,
      ...aiGeneratedData,
      orderStatus: aiGeneratedData.orderStatus || defaultData.orderStatus
    };
  });

  const handleFieldChange = (field: keyof Case, value: any) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSetFieldChange = (setIndex: number, field: 'challenges' | 'challengeSummaries' | 'needs' | 'proposals', value: string) => {
    setEditedData(prev => {
      const fieldArray = [...(prev[field] as string[] || [])];
      fieldArray[setIndex] = value;
      return {
        ...prev,
        [field]: fieldArray
      };
    });
  };


  const handleSave = () => {
    onSave({
      ...editedData,
      // Use basic info (not editable)
      industry: basicInfo.mainIndustry,
      industries: basicInfo.industry,
      region: basicInfo.region,
      prefecture: basicInfo.prefecture,
      city: basicInfo.city,
      companyName: basicInfo.companyName,
      // Ensure orderStatus is saved correctly
      orderStatus: editedData.orderStatus || 'won',
      // Ensure arrays are properly formatted
      challenges: editedData.challenges?.filter(c => c.trim()) || [],
      needs: editedData.needs?.filter(n => n.trim()) || [],
      proposals: editedData.proposals?.filter(p => p.trim()) || [],
      tags: editedData.tags || []
    });
  };



  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">

        {/* 事例タイトル */}
        <div className="space-y-4">
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-3">タイトル</label>
            <textarea
              value={editedData.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="事例のタイトルを入力してください"
              required
            />
          </div>

          {/* 商談結果（進行中以外の場合のみ表示） */}
          {aiGeneratedData.orderStatus !== 'in_progress' && (
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">商談結果</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderStatus"
                    value="won"
                    checked={editedData.orderStatus === 'won'}
                    onChange={(e) => handleFieldChange('orderStatus', e.target.value)}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">受注</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="orderStatus"
                    value="lost"
                    checked={editedData.orderStatus === 'lost'}
                    onChange={(e) => handleFieldChange('orderStatus', e.target.value)}
                    className="mr-2 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">失注</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* 課題・ニーズ・提案セット（最初のセットのみ） */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">課題・ニーズ・提案</h2>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-4">
              {/* 課題タイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  課題タイプ
                </label>
                <select
                  value={editedData.tags?.[0] || ''}
                  onChange={(e) => {
                    const newTags = e.target.value ? [e.target.value] : [];
                    handleFieldChange('tags', newTags);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">課題タイプを選択してください</option>
                  {FIVE_CHALLENGES.map(challenge => (
                    <option key={challenge} value={challenge}>{challenge}</option>
                  ))}
                </select>
              </div>

              {/* 課題 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  課題
                </label>
                <textarea
                  value={(editedData.challenges || [])[0] || ''}
                  onChange={(e) => handleSetFieldChange(0, 'challenges', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="課題の詳細を入力してください"
                />
              </div>

              {/* ニーズ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ニーズ
                </label>
                <textarea
                  value={(editedData.needs || [])[0] || ''}
                  onChange={(e) => handleSetFieldChange(0, 'needs', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="ニーズの詳細を入力してください"
                />
              </div>

              {/* 提案 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  提案
                </label>
                <textarea
                  value={(editedData.proposals || [])[0] || ''}
                  onChange={(e) => handleSetFieldChange(0, 'proposals', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="提案の詳細を入力してください"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ネック情報 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">ネック</h2>
          
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-4">
              {/* ネックタイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ネックタイプ
                </label>
                <select
                  value={editedData.neckType || ''}
                  onChange={(e) => handleFieldChange('neckType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選択してください</option>
                  {NECK_TYPES.map(type => (
                    <option key={type} value={type}>{type}ネック</option>
                  ))}
                </select>
              </div>

              {/* 顧客の声 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  顧客の声
                </label>
                <textarea
                  value={editedData.customerStatement || ''}
                  onChange={(e) => handleFieldChange('customerStatement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="顧客の具体的な発言を入力してください"
                />
              </div>

              {/* 実施した対策 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  実施した対策
                </label>
                <textarea
                  value={editedData.action || ''}
                  onChange={(e) => handleFieldChange('action', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="実施した対策を入力してください"
                />
              </div>

            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBackToChat}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};