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

interface CaseCollectorProps {
  onCaseCollected: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const CaseCollector: React.FC<CaseCollectorProps> = ({ onCaseCollected, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'こんにちは！今日の商談について教えてください。どんなお客様でしたか？',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([]);
  const [geminiService] = useState(() => new GeminiService());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCase, setPendingCase] = useState<Omit<Case, 'id' | 'createdAt' | 'updatedAt'> | null>(null);
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

      // 事例登録準備ができている場合、ユーザーに確認
      if (readyToSave && !result.structuredCase) {
        setTimeout(() => {
          const confirmMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: '十分な情報が集まりました。この商談内容を事例として登録しますか？',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
          setShowConfirmation(true);
        }, 1000);
      }

      // 構造化された事例が返ってきた場合（確認後）
      if (result.structuredCase) {
        setIsCompleted(true);
        onCaseCollected(result.structuredCase);
        
        // 成功メッセージを表示してから閉じる
        setTimeout(() => {
          const successMessage: Message = {
            id: (Date.now() + 3).toString(),
            role: 'assistant',
            content: '事例を登録しました！ありがとうございました。',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
          
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 500);
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

  // 事例登録確認の処理
  const handleConfirmSave = async () => {
    setShowConfirmation(false);
    setIsLoading(true);

    try {
      // 明示的な保存確認をGeminiに送信
      const result = await geminiService.continueConversation(
        conversationHistory,
        '[CONFIRM_SAVE]'
      );

      if (result.structuredCase) {
        setIsCompleted(true);
        onCaseCollected(result.structuredCase);
        
        const successMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '事例を登録しました！ありがとうございました。',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, successMessage]);
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving case:', error);
    }
    
    setIsLoading(false);
  };

  const handleDeclineSave = () => {
    setShowConfirmation(false);
    const declineMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'わかりました。他に聞きたいことがあれば続けてください。',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, declineMessage]);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">事例を聞かせてください</h3>
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
            <div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
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

        {showConfirmation ? (
          <div className="flex space-x-2">
            <button
              onClick={handleConfirmSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              はい、登録します
            </button>
            <button
              onClick={handleDeclineSave}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              いいえ、続けます
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
          <p>AIアシスタントが質問しながら、事例を整理していきます。</p>
          <p>会話が終わったら、事例が自動的に保存されます。</p>
        </div>
      </div>
    </div>
  );
};