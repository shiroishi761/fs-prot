import React, { useState, useRef, useEffect } from 'react';
import { Reflection, Case } from '../types/case';
import { GeminiService } from '../services/geminiService';
import { salesPatterns, keyInsights, stageAdvices } from '../data/salesKnowledge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedCases?: Case[]; // 関連する成功事例
}

interface ConversationHistory {
  role: 'user' | 'model';
  parts: string;
}

interface ReflectionAssistantProps {
  onReflectionComplete: (reflection: Omit<Reflection, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  cases: Case[]; // 成功事例のリスト
}

export const ReflectionAssistant: React.FC<ReflectionAssistantProps> = ({ 
  onReflectionComplete, 
  onClose,
  cases 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'お疲れ様でした。今日の商談について振り返りましょう。どんなお客様でしたか？（業種、規模など）',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [geminiService] = useState(() => new GeminiService());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSaveOption, setShowSaveOption] = useState(false);
  const [collectedInfo] = useState<Partial<Reflection>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 関連する成功事例を検索（ノウハウデータを含む）
  const findRelatedSuccessCases = (reflection: Partial<Reflection>): Case[] => {
    // 既存の成功事例
    const relatedCases = cases.filter(c => {
      const sameIndustry = c.industry === reflection.industry;
      const relatedContent = reflection.failurePoint && reflection.failurePoint.length > 0 && (
        // 新しいデータ構造と古いデータ構造の両方に対応
        (c.challenges?.some(challenge => challenge.includes(reflection.failurePoint!)) || 
         c.challenge?.includes(reflection.failurePoint) ||
         c.proposals?.some(proposal => proposal.includes(reflection.failurePoint!)) ||
         c.proposal?.includes(reflection.failurePoint))
      );
      
      return sameIndustry || relatedContent;
    }).slice(0, 2);

    return relatedCases;
  };

  // ノウハウベースのアドバイス生成
  const generateKnowledgeBasedAdvice = (industry: string, failureStage: string): string[] => {
    const advice: string[] = [];
    
    // 業界別のインサイト
    const insight = keyInsights.find(i => 
      i.industry === industry
    );
    
    if (insight) {
      advice.push(`【${industry}への効果的なアプローチ】`);
      insight.effectiveApproach.forEach(approach => {
        advice.push(`• ${approach}を重点的に訴求する`);
      });
    }

    // 類似失敗パターンからの学び
    const similarFailures = salesPatterns.filter(p => 
      p.type === 'failure' && 
      p.industry === industry
    );

    if (similarFailures.length > 0) {
      advice.push(`\n【同業界での注意点】`);
      similarFailures.forEach(failure => {
        advice.push(`• ${failure.keyPoint}`);
      });
    }

    // 成功パターンからの改善提案
    const successPatterns = salesPatterns.filter(p => 
      p.type === 'success' && 
      p.industry === industry
    );

    if (successPatterns.length > 0) {
      advice.push(`\n【成功パターンから学ぶ】`);
      successPatterns.slice(0, 2).forEach(success => {
        advice.push(`• ${success.keyPoint}：${success.action}`);
      });
    }

    // ステージ別のアドバイス
    const stageMap: { [key: string]: string } = {
      'アプローチ': 'approach',
      'ヒアリング': 'hearing', 
      '提案': 'proposal',
      'クロージング': 'closing'
    };

    const mappedStage = Object.entries(stageMap).find(([key]) => 
      failureStage.includes(key)
    )?.[1];

    if (mappedStage) {
      const stageAdvice = stageAdvices.find(s => s.stage === mappedStage);
      if (stageAdvice) {
        advice.push(`\n【${failureStage}段階での改善ポイント】`);
        stageAdvice.generalTips.slice(0, 2).forEach(tip => {
          advice.push(`• ${tip}`);
        });
      }
    }

    return advice;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || isCompleted) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const currentInput = input;
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    setIsLoading(true);

    try {
      // 振り返り専用のシステムプロンプトを設定
      const systemPrompt = `あなたは営業支援システムのAIアシスタントです。
営業担当者が失敗した商談について振り返りを行っています。
優しく共感的な態度で接し、建設的なアドバイスを提供してください。

以下の情報を段階的に収集してください：
1. 業種、地域、従業員人数
2. どの段階で難しさを感じたか（例：アプローチ、ヒアリング、提案、クロージング）
3. 顧客の具体的な反応
4. 何が原因だと思うか

情報が十分に集まったら、以下を含めて返答してください：
- 共感的なメッセージ
- 同様の状況での成功パターン（具体例を1-2個）
- 具体的な改善提案（2-3個）
- [REFLECTION_COMPLETE]というマーカー

回答は自然な日本語で、営業担当者を励ますトーンでお願いします。`;

      // 既存の会話履歴を振り返り用に調整
      const reflectionHistory: ConversationHistory[] = [
        { role: 'user' as const, parts: systemPrompt },
        { role: 'model' as const, parts: 'はい、理解しました。営業担当者の振り返りをサポートします。' },
        ...conversationHistory
      ];

      // GeminiServiceを使って対話
      const result = await geminiService.continueConversation(
        reflectionHistory,
        currentInput
      );

      const aiResponse = result.response;

      // 会話履歴を更新
      setConversationHistory(prev => [
        ...prev,
        { role: 'user' as const, parts: currentInput },
        { role: 'model' as const, parts: aiResponse }
      ].slice(-10));

      // 振り返り完了チェック
      if (aiResponse.includes('[REFLECTION_COMPLETE]')) {
        const cleanedResponse = aiResponse.replace('[REFLECTION_COMPLETE]', '').trim();
        
        // 関連する成功事例を検索
        const relatedCases = findRelatedSuccessCases(collectedInfo);
        
        // 会話内容から業界・規模・失敗段階を抽出
        const conversationText = conversationHistory.map(h => h.parts).join(' ');
        const industry = collectedInfo.industry || 
          ['建設業', '土木業', '電気工事業', '管工事業'].find(i => conversationText.includes(i)) || '建設業';
        const failureStage = ['アプローチ', 'ヒアリング', '提案', 'クロージング'].find(s => 
          conversationText.includes(s)
        ) || '提案';
        
        // ノウハウベースのアドバイスを生成
        const knowledgeAdvice = generateKnowledgeBasedAdvice(industry, failureStage);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: cleanedResponse,
          timestamp: new Date(),
          relatedCases: relatedCases
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // ノウハウベースのアドバイスを追加で表示
        if (knowledgeAdvice.length > 0) {
          setTimeout(() => {
            const knowledgeMessage: Message = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: `業界のノウハウから追加アドバイスをお伝えします：\n\n${knowledgeAdvice.join('\n')}`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, knowledgeMessage]);
          }, 1500);
        }
        
        // 保存オプションを表示
        setTimeout(() => {
          setShowSaveOption(true);
        }, 2500);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveReflection = () => {
    // 会話内容から振り返り情報を構築
    const reflection: Omit<Reflection, 'id' | 'createdAt'> = {
      industry: collectedInfo.industry || '',
      region: collectedInfo.region || '',
      situation: collectedInfo.situation || '',
      failurePoint: collectedInfo.failurePoint || '',
      customerReaction: collectedInfo.customerReaction || '',
      reflectionNotes: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
      improvementActions: collectedInfo.improvementActions || [],
      relatedSuccessCases: messages
        .flatMap(m => m.relatedCases?.map(c => c.id) || [])
    };

    onReflectionComplete(reflection);
    
    const successMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: '振り返り内容を保存しました。次回の商談に活かしてくださいね！',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMessage]);
    setIsCompleted(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleSkipSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">商談の振り返り</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* 関連する成功事例の表示 */}
              {message.relatedCases && message.relatedCases.length > 0 && (
                <div className="ml-4 mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800 mb-2">参考になる成功事例：</p>
                  {message.relatedCases.map((c, index) => (
                    <div key={c.id} className="mb-2 p-2 bg-white rounded border border-green-200">
                      <p className="text-sm font-medium text-gray-800">{index + 1}. {c.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{c.industry}</p>
                      <p className="text-xs text-gray-700 mt-1">提案: {
                        (c.proposals?.length ? c.proposals[0] : c.proposal || '情報なし').substring(0, 50)
                      }...</p>
                    </div>
                  ))}
                </div>
              )}
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

        {showSaveOption ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveReflection}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              振り返りを保存する
            </button>
            <button
              onClick={handleSkipSave}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              保存せずに閉じる
            </button>
          </div>
        ) : (
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              送信
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          <p>今日の商談を振り返って、次回に活かせるポイントを見つけましょう。</p>
          <p>失敗は成長のチャンスです。一緒に改善点を考えます。</p>
        </div>
      </div>
    </div>
  );
};