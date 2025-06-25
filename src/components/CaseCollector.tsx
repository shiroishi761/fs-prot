import React, { useState, useRef, useEffect } from 'react';
import { Case } from '../types/case';
import { GeminiService } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationHistory {
  role: 'user' | 'model';
  parts: string;
}

interface CaseBasicInfo {
  companyName: string;
  industry: string[];
  mainIndustry: string;
  region: string;
  prefecture: string;
  city: string;
  companySize: 'small' | 'medium' | 'large';
}

interface CaseCollectorProps {
  onCaseCollected: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onReviewEdit: (aiData: Partial<Case>, messages: Message[], conversationHistory: ConversationHistory[]) => void; // 確認・編集画面へ
  onClose: () => void;
  basicInfo?: CaseBasicInfo; // 基本情報
  savedMessages?: Message[]; // 保存された会話履歴
  savedConversationHistory?: ConversationHistory[]; // 保存された会話履歴
  existingCaseData?: Partial<Case>; // 既存事例データ（ヒヤリング再開時）
}

export const CaseCollector: React.FC<CaseCollectorProps> = ({ onCaseCollected, onReviewEdit, onClose, basicInfo, savedMessages, savedConversationHistory, existingCaseData }) => {
  // 基本情報に基づいて初期メッセージを生成
  const getInitialMessage = () => {
    if (basicInfo) {
      return `こんにちは！基本情報を確認いたしました。
      
企業名: ${basicInfo.companyName}
業種: ${basicInfo.industry.join('、')}（メイン：${basicInfo.mainIndustry}）
地域: ${basicInfo.region} ${basicInfo.prefecture} ${basicInfo.city}
企業規模: ${basicInfo.companySize === 'small' ? '小規模（〜50名）' : basicInfo.companySize === 'medium' ? '中規模（50-300名）' : '大規模（300名〜）'}

それでは、この企業様との商談について詳しく教えてください。どのような課題やニーズをお持ちでしたか？`;
    }
    return 'こんにちは！今日の商談について教えてください。どんなお客様でしたか？';
  };

  const [messages, setMessages] = useState<Message[]>(
    savedMessages && savedMessages.length > 0 
      ? savedMessages 
      : [
          {
            id: '1',
            role: 'assistant',
            content: getInitialMessage(),
            timestamp: new Date()
          }
        ]
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>(
    savedConversationHistory || []
  );
  const [geminiService] = useState(() => new GeminiService());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // 保存された状態がある場合は完了状態をリセット
  React.useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      setIsCompleted(false);
      setShowConfirmation(false);
    }
  }, [savedMessages]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      // 非同期処理のクリーンアップ（状態更新は行わない）
      // setIsLoading(false);
      // setIsCompleted(true);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading || isCompleted || showConfirmation) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    
    // 入力をクリア（確実にクリアするため複数の方法で実行）
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    setIsLoading(true);

    try {
      // 会話履歴を先に更新
      const updatedHistory: ConversationHistory[] = [
        ...conversationHistory,
        { role: 'user' as const, parts: currentInput }
      ].slice(-10); // 最新の10件のみ保持

      // 事例登録の準備ができているかチェック
      const readyToSave = geminiService.checkIfReadyToSave(updatedHistory);
      
      // Gemini APIを呼び出し
      const result = await geminiService.continueConversation(
        conversationHistory,
        currentInput
      );

      // 会話履歴を更新
      setConversationHistory(prev => {
        const newHistory: ConversationHistory[] = [
          ...prev,
          { role: 'user' as const, parts: currentInput },
          { role: 'model' as const, parts: result.response }
        ];
        return newHistory.slice(-10);
      });

      // アシスタントのメッセージを追加
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // 事例登録準備ができている場合、情報を表示
      if (readyToSave && !result.structuredCase) {
        setTimeout(() => {
          const confirmMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: '十分な情報が集まりました。右下の「追加」ボタンから事例を追加できます。',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
        }, 1000);
      }

      setIsLoading(false);
      
      // 送信完了後に再度入力をクリア（念のため）
      setInput('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error:', error);
      
      // エラーメッセージを表示
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。APIキーが正しく設定されているか確認してください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
      
      // エラー時も入力をクリア
      setInput('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };



  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="h-[60vh] overflow-y-auto mb-4 p-4 bg-gray-50 rounded-t-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-3 rounded-lg max-w-xs lg:max-w-md ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg bg-white text-gray-800 border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={isCompleted}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || isCompleted}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  送信中...
                </>
              ) : (
                '送信'
              )}
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                // 基本的な事例データを生成
                const basicCaseData = {
                  title: `${basicInfo?.companyName || ''}との商談`,
                  companyName: basicInfo?.companyName || '',
                  industry: basicInfo?.mainIndustry || '',
                  industries: basicInfo?.industry || [],
                  region: basicInfo?.region || '',
                  prefecture: basicInfo?.prefecture || '',
                  city: basicInfo?.city || '',
                  companySize: basicInfo?.companySize || 'medium',
                  challenges: ['商談内容を整理中'],
                  challengeSummaries: ['商談内容整理中'],
                  needs: ['ニーズを整理中'],
                  proposals: ['提案内容を整理中'],
                  results: [],
                  tags: ['進行中'],
                  orderStatus: 'in_progress' as const
                };
                
                onCaseCollected(basicCaseData);
              }}
              disabled={isLoading || isCompleted}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              一時保存
            </button>
            <button
              onClick={() => {
                // AI生成データがある場合はそれを使用、なければ基本データを生成
                let caseData;
                if (conversationHistory.length >= 3) {
                  // 十分な会話がある場合はAI生成を試行（実際のAI呼び出しは省略してダミーデータ）
                  caseData = {
                    id: existingCaseData?.id, // 既存事例のIDを保持
                    title: `${basicInfo?.companyName || ''}との商談事例`,
                    companyName: basicInfo?.companyName || '',
                    industry: basicInfo?.mainIndustry || '',
                    industries: basicInfo?.industry || [],
                    region: basicInfo?.region || '',
                    prefecture: basicInfo?.prefecture || '',
                    city: basicInfo?.city || '',
                    companySize: basicInfo?.companySize || 'medium',
                    challenges: ['収益性の向上が必要', '業務効率化の課題'],
                    challengeSummaries: ['収益性向上', '業務効率化'],
                    needs: ['コスト削減の実現', '作業時間の短縮'],
                    proposals: ['システム導入による自動化', 'プロセス改善提案'],
                    results: [],
                    tags: ['進行中']
                    // orderStatus will be determined in final confirmation screen
                  };
                } else {
                  // 基本的な事例データを生成
                  caseData = {
                    id: existingCaseData?.id, // 既存事例のIDを保持
                    title: `${basicInfo?.companyName || ''}との商談`,
                    companyName: basicInfo?.companyName || '',
                    industry: basicInfo?.mainIndustry || '',
                    industries: basicInfo?.industry || [],
                    region: basicInfo?.region || '',
                    prefecture: basicInfo?.prefecture || '',
                    city: basicInfo?.city || '',
                    companySize: basicInfo?.companySize || 'medium',
                    challenges: ['商談内容を整理中'],
                    challengeSummaries: ['商談内容整理中'],
                    needs: ['ニーズを整理中'],
                    proposals: ['提案内容を整理中'],
                    results: [],
                    tags: ['進行中']
                    // orderStatus will be determined in final confirmation screen
                  };
                }
                
                onReviewEdit(caseData, messages, conversationHistory);
              }}
              disabled={isLoading || isCompleted}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};