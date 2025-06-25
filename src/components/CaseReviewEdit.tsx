import React, { useState } from 'react';
import { Case } from '../types/case';

interface CaseBasicInfo {
  companyName: string;
  industry: string[];
  mainIndustry: string;
  region: string;
  prefecture: string;
  city: string;
  companySize: 'small' | 'medium' | 'large';
}

interface CaseReviewEditProps {
  basicInfo: CaseBasicInfo;
  aiGeneratedData: Partial<Case>;
  onSave: (caseData: Partial<Case>) => void;
  onBackToChat: () => void;
}

export const CaseReviewEdit: React.FC<CaseReviewEditProps> = ({
  basicInfo,
  aiGeneratedData,
  onSave,
  onBackToChat
}) => {
  // 課題/ニーズ/提案のセット数を決定
  const maxSets = Math.max(
    aiGeneratedData.challenges?.length || 1,
    aiGeneratedData.needs?.length || 1,
    aiGeneratedData.proposals?.length || 1
  );

  const [editedData, setEditedData] = useState<Partial<Case>>({
    title: aiGeneratedData.title || '',
    challenges: aiGeneratedData.challenges || Array(maxSets).fill(''),
    challengeSummaries: aiGeneratedData.challengeSummaries || Array(maxSets).fill(''),
    needs: aiGeneratedData.needs || Array(maxSets).fill(''),
    proposals: aiGeneratedData.proposals || Array(maxSets).fill(''),
    results: aiGeneratedData.results || [''],
    ...aiGeneratedData
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

  const addNewSet = () => {
    setEditedData(prev => ({
      ...prev,
      challenges: [...(prev.challenges || []), ''],
      challengeSummaries: [...(prev.challengeSummaries || []), ''],
      needs: [...(prev.needs || []), ''],
      proposals: [...(prev.proposals || []), '']
    }));
  };

  const removeSet = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      challenges: (prev.challenges || []).filter((_, i) => i !== index),
      challengeSummaries: (prev.challengeSummaries || []).filter((_, i) => i !== index),
      needs: (prev.needs || []).filter((_, i) => i !== index),
      proposals: (prev.proposals || []).filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onSave({
      ...editedData,
      // 基本情報を追加
      industry: basicInfo.mainIndustry,
      industries: basicInfo.industry,
      region: basicInfo.region,
      prefecture: basicInfo.prefecture,
      city: basicInfo.city,
      companySize: basicInfo.companySize,
      orderStatus: 'in_progress'
    });
  };

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '小規模（〜50名）';
      case 'medium': return '中規模（50-300名）';
      case 'large': return '大規模（300名〜）';
      default: return size;
    }
  };

  const currentSets = Math.max(1, editedData.challenges?.length || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* 基本情報表示 */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">企業名:</span>
                <span className="ml-2">{basicInfo.companyName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">メイン業種:</span>
                <span className="ml-2">{basicInfo.mainIndustry}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">地域:</span>
                <span className="ml-2">{basicInfo.prefecture} {basicInfo.city}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">規模:</span>
                <span className="ml-2">{getCompanySizeLabel(basicInfo.companySize)}</span>
              </div>
              {basicInfo.industry.length > 1 && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">その他業種:</span>
                  <span className="ml-2">{basicInfo.industry.filter(i => i !== basicInfo.mainIndustry).join('、')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
        </div>

        {/* 課題・ニーズ・提案セット */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">課題・ニーズ・提案</h2>
            <button
              type="button"
              onClick={addNewSet}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none border border-blue-300 rounded-md hover:bg-blue-50"
            >
              + 追加
            </button>
          </div>
          
          {Array.from({ length: currentSets }, (_, setIndex) => (
            <div key={setIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="space-y-4">
                {/* 課題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    課題
                  </label>
                  <textarea
                    value={(editedData.challenges || [])[setIndex] || ''}
                    onChange={(e) => handleSetFieldChange(setIndex, 'challenges', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="課題の詳細を入力してください"
                  />
                </div>

                {/* 課題要約 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    課題要約（カード見出し用）
                  </label>
                  <input
                    type="text"
                    value={(editedData.challengeSummaries || [])[setIndex] || ''}
                    onChange={(e) => handleSetFieldChange(setIndex, 'challengeSummaries', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="課題の要約を入力してください"
                  />
                </div>

                {/* ニーズ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ニーズ
                  </label>
                  <textarea
                    value={(editedData.needs || [])[setIndex] || ''}
                    onChange={(e) => handleSetFieldChange(setIndex, 'needs', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="ニーズの詳細を入力してください"
                  />
                </div>

                {/* 提案 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    提案
                  </label>
                  <textarea
                    value={(editedData.proposals || [])[setIndex] || ''}
                    onChange={(e) => handleSetFieldChange(setIndex, 'proposals', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="提案の詳細を入力してください"
                  />
                </div>

                {/* 削除ボタン */}
                {currentSets > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSet(setIndex)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none border border-red-300 rounded-md hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
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