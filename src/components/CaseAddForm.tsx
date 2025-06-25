import React, { useState } from 'react';
import { INDUSTRIES, REGIONS, AREA_HIERARCHY } from '../types/case';

interface CaseBasicInfo {
  companyName: string;
  industry: string[];
  mainIndustry: string;
  region: string;
  prefecture: string;
  city: string;
  companySize: 'small' | 'medium' | 'large';
}

interface CaseAddFormProps {
  onStartInterview: (basicInfo: CaseBasicInfo) => void;
  onClose: () => void;
}

export const CaseAddForm: React.FC<CaseAddFormProps> = ({ onStartInterview, onClose }) => {
  const [formData, setFormData] = useState<CaseBasicInfo>({
    companyName: '',
    industry: [],
    mainIndustry: '',
    region: '',
    prefecture: '',
    city: '',
    companySize: 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 業種の選択・解除を管理
  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => {
      const isRemoving = prev.industry.includes(industry);
      const newIndustries = isRemoving
        ? prev.industry.filter(item => item !== industry)
        : [...prev.industry, industry];
      
      // メイン業種の処理
      let newMainIndustry = prev.mainIndustry;
      if (isRemoving && prev.mainIndustry === industry) {
        // メイン業種を削除する場合、別の業種があればそれをメインにする
        newMainIndustry = newIndustries.length > 0 ? newIndustries[0] : '';
      } else if (!isRemoving && prev.mainIndustry === '') {
        // 初回選択時は自動的にメイン業種に設定
        newMainIndustry = industry;
      }
      
      return {
        ...prev,
        industry: newIndustries,
        mainIndustry: newMainIndustry
      };
    });

    // エラーをクリア
    if (errors.industry || errors.mainIndustry) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.industry;
        delete newErrors.mainIndustry;
        return newErrors;
      });
    }
  };

  // メイン業種の設定
  const handleMainIndustryChange = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      mainIndustry: industry
    }));
  };

  // 地域選択時に都道府県をリセット
  const handleRegionChange = (region: string) => {
    setFormData(prev => ({
      ...prev,
      region,
      prefecture: '',
      city: ''
    }));

    // エラーをクリア
    if (errors.region) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.region;
        return newErrors;
      });
    }
  };

  // 都道府県選択時に市区町村をリセット
  const handlePrefectureChange = (prefecture: string) => {
    setFormData(prev => ({
      ...prev,
      prefecture,
      city: ''
    }));

    // エラーをクリア
    if (errors.prefecture) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.prefecture;
        return newErrors;
      });
    }
  };

  // フォームバリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '企業名は必須です';
    }
    if (formData.industry.length === 0) {
      newErrors.industry = '業種を1つ以上選択してください';
    }
    if (formData.industry.length > 0 && !formData.mainIndustry) {
      newErrors.mainIndustry = 'メイン業種を選択してください';
    }
    if (!formData.region) {
      newErrors.region = '地域は必須です';
    }
    if (!formData.prefecture) {
      newErrors.prefecture = '都道府県は必須です';
    }
    if (!formData.city) {
      newErrors.city = '市区町村は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onStartInterview(formData);
    }
  };

  const getCompanySizeLabel = (size: string) => {
    switch (size) {
      case 'small': return '小規模（〜50名）';
      case 'medium': return '中規模（50-300名）';
      case 'large': return '大規模（300名〜）';
      default: return size;
    }
  };

  // 選択された地域の都道府県一覧
  const prefectures = formData.region ? Object.keys(AREA_HIERARCHY[formData.region as keyof typeof AREA_HIERARCHY] || {}) : [];

  return (
    <div className="max-w-2xl mx-auto mt-6">
      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 企業名 */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
              企業名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="companyName"
              value={formData.companyName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, companyName: e.target.value }));
                if (errors.companyName) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.companyName;
                    return newErrors;
                  });
                }
              }}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.companyName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="株式会社○○建設"
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* 業種 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              業種 <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">（複数選択可能）</span>
            </label>
            <div className={`border rounded-md ${
              errors.industry ? 'border-red-500' : 'border-gray-300'
            }`}>
              <div className="grid grid-cols-2 gap-3 p-4 max-h-48 overflow-y-auto">
                {INDUSTRIES.map(industry => (
                  <label
                    key={industry}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.industry.includes(industry)}
                      onChange={() => handleIndustryToggle(industry)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{industry}</span>
                  </label>
                ))}
              </div>
            </div>
            {formData.industry.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-2">選択中の業種:</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {formData.industry.map(industry => (
                    <span
                      key={industry}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        industry === formData.mainIndustry
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {industry === formData.mainIndustry && '★ '}
                      {industry}
                      <button
                        type="button"
                        onClick={() => handleIndustryToggle(industry)}
                        className={`ml-1 ${
                          industry === formData.mainIndustry
                            ? 'text-green-600 hover:text-green-800'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                {formData.industry.length > 1 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">メイン業種を選択:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.industry.map(industry => (
                        <label
                          key={`main-${industry}`}
                          className="flex items-center space-x-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="mainIndustry"
                            value={industry}
                            checked={formData.mainIndustry === industry}
                            onChange={() => handleMainIndustryChange(industry)}
                            className="w-3 h-3 text-green-600 border-gray-300 focus:ring-green-500"
                          />
                          <span className="text-xs text-gray-700">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.industry && (
              <p className="mt-1 text-sm text-red-500">{errors.industry}</p>
            )}
            {errors.mainIndustry && (
              <p className="mt-1 text-sm text-red-500">{errors.mainIndustry}</p>
            )}
          </div>

          {/* 地域選択 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 地域 */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                地域 <span className="text-red-500">*</span>
              </label>
              <select
                id="region"
                value={formData.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.region ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                {REGIONS.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              {errors.region && (
                <p className="mt-1 text-sm text-red-500">{errors.region}</p>
              )}
            </div>

            {/* 都道府県 */}
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                都道府県 <span className="text-red-500">*</span>
              </label>
              <select
                id="prefecture"
                value={formData.prefecture}
                onChange={(e) => handlePrefectureChange(e.target.value)}
                disabled={!formData.region}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.prefecture ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                {prefectures.map(prefecture => (
                  <option key={prefecture} value={prefecture}>{prefecture}</option>
                ))}
              </select>
              {errors.prefecture && (
                <p className="mt-1 text-sm text-red-500">{errors.prefecture}</p>
              )}
            </div>

            {/* 市区町村 */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                市区町村 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, city: e.target.value }));
                  if (errors.city) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.city;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例：千代田区"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>
          </div>

          {/* 企業規模 */}
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
              企業規模 <span className="text-red-500">*</span>
            </label>
            <select
              id="companySize"
              value={formData.companySize}
              onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value as 'small' | 'medium' | 'large' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">{getCompanySizeLabel('small')}</option>
              <option value="medium">{getCompanySizeLabel('medium')}</option>
              <option value="large">{getCompanySizeLabel('large')}</option>
            </select>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              AIヒヤリング開始
            </button>
          </div>
        </form>
        
        {/* Form Note */}
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-600">
            <span className="text-red-500">*</span> 基本情報を入力してAIヒヤリングを開始してください。全ての項目が必須です。
          </p>
        </div>
      </div>
    </div>
  );
};