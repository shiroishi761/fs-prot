import React, { useState } from 'react';
import { Case, INDUSTRIES, REGIONS, AREA_HIERARCHY } from '../types/case';

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

  const [editedData, setEditedData] = useState<Partial<Case>>(() => {
    const defaultData = {
      orderStatus: 'won' as const, // Default to won (受注)
      title: aiGeneratedData.title || '',
      companyName: aiGeneratedData.companyName || basicInfo.companyName,
      industry: aiGeneratedData.industry || basicInfo.mainIndustry,
      region: aiGeneratedData.region || basicInfo.region,
      prefecture: aiGeneratedData.prefecture || basicInfo.prefecture,
      city: aiGeneratedData.city || basicInfo.city,
      companySize: aiGeneratedData.companySize || basicInfo.companySize,
      challenges: aiGeneratedData.challenges || Array(maxSets).fill(''),
      challengeSummaries: aiGeneratedData.challengeSummaries || Array(maxSets).fill(''),
      needs: aiGeneratedData.needs || Array(maxSets).fill(''),
      proposals: aiGeneratedData.proposals || Array(maxSets).fill(''),
      results: aiGeneratedData.results || ['']
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
      // Use edited basic info
      industry: editedData.industry || basicInfo.mainIndustry,
      industries: editedData.industry ? [editedData.industry] : basicInfo.industry,
      region: editedData.region || basicInfo.region,
      prefecture: editedData.prefecture || basicInfo.prefecture,
      city: editedData.city || basicInfo.city,
      companySize: editedData.companySize || basicInfo.companySize,
      companyName: editedData.companyName || basicInfo.companyName,
      // Ensure orderStatus is saved correctly
      orderStatus: editedData.orderStatus || 'won'
    });
  };


  const currentSets = Math.max(1, editedData.challenges?.length || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* 基本情報編集 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">基本情報</h2>
          
          {/* 一段目：企業名、業種、企業規模 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 企業名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">企業名</label>
              <input
                type="text"
                value={editedData.companyName || ''}
                onChange={(e) => handleFieldChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="企業名を入力してください"
              />
            </div>

            {/* 業種 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">業種</label>
              <select
                value={editedData.industry || ''}
                onChange={(e) => handleFieldChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">業種を選択してください</option>
                {INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            {/* 企業規模 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">企業規模</label>
              <select
                value={editedData.companySize || 'medium'}
                onChange={(e) => handleFieldChange('companySize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">小規模（〜50名）</option>
                <option value="medium">中規模（50-300名）</option>
                <option value="large">大規模（300名〜）</option>
              </select>
            </div>
          </div>

          {/* 二段目：地域、都道府県、市区町村 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 地域 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
              <select
                value={editedData.region || ''}
                onChange={(e) => {
                  handleFieldChange('region', e.target.value);
                  // 地域が変更されたら都道府県と市区町村をリセット
                  handleFieldChange('prefecture', '');
                  handleFieldChange('city', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">地域を選択してください</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* 都道府県 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">都道府県</label>
              <select
                value={editedData.prefecture || ''}
                onChange={(e) => {
                  handleFieldChange('prefecture', e.target.value);
                  // 都道府県が変更されたら市区町村をリセット
                  handleFieldChange('city', '');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!editedData.region}
              >
                <option value="">都道府県を選択してください</option>
                {editedData.region && AREA_HIERARCHY[editedData.region as keyof typeof AREA_HIERARCHY] && 
                  Object.keys(AREA_HIERARCHY[editedData.region as keyof typeof AREA_HIERARCHY]).map(prefecture => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))
                }
              </select>
            </div>

            {/* 市区町村 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">市区町村</label>
              <input
                type="text"
                value={editedData.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="市区町村を入力してください"
              />
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
                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <textarea
                    value={(editedData.challengeSummaries || [])[setIndex] || ''}
                    onChange={(e) => handleSetFieldChange(setIndex, 'challengeSummaries', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="課題の要約・タイトルを入力してください"
                  />
                </div>

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