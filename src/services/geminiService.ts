import { GoogleGenerativeAI } from '@google/generative-ai';
import { Case } from '../types/case';

// Gemini APIキーの取得（環境変数から取得、なければ直接指定）
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyBkHgx1X6T8qNn2SVbcviLVtgkUmeyr6jg';

// デバッグ用ログ
console.log('Gemini API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('Using hardcoded key:', !process.env.REACT_APP_GEMINI_API_KEY);
console.log('Environment variable value:', process.env.REACT_APP_GEMINI_API_KEY ? `${process.env.REACT_APP_GEMINI_API_KEY.substring(0, 10)}...` : 'NOT SET');

// Gemini クライアントの初期化
const genAI = new GoogleGenerativeAI(API_KEY);

// Function Callingで使用する関数定義（将来の実装用）
/*
const saveCaseFunction = {
  name: 'save_case',
  description: '営業事例を構造化して保存する',
  parameters: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: '事例のタイトル'
      },
      industry: {
        type: 'string',
        description: '業種'
      },
      region: {
        type: 'string',
        description: '地域'
      },
      challenge: {
        type: 'string',
        description: '顧客の課題'
      },
      proposal: {
        type: 'string',
        description: '提案内容'
      },
      result: {
        type: 'string',
        description: '結果'
      },
      tags: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'タグのリスト'
      }
    },
    required: ['title', 'industry', 'region', 'challenge', 'proposal', 'result', 'tags']
  }
};
*/

// システムプロンプト
const SYSTEM_PROMPT = `あなたは建設業界の営業支援AIアシスタントです。
営業担当者から商談内容を聞き出し、効果的な事例として整理することが役割です。

以下の情報を自然な会話で聞き出してください：
1. お客様の業種（建築、土木、設備工事など）
2. 地域（都道府県）
3. お客様が抱えていた課題
4. 提案した内容（CAREECONのどの機能をどのように活用するか）
5. 結果（契約、検討中、デモ予定など）

会話は親しみやすく、営業担当者が話しやすい雰囲気を作ってください。
必要な情報が揃ったら、save_case関数を使って事例を保存してください。

重要：
- 営業担当者の話し方に合わせて、カジュアルに対応してください
- 一度に多くの質問をせず、自然な流れで情報を聞き出してください
- 曖昧な情報は確認の質問で明確にしてください`;

// 会話履歴の型定義
interface ConversationHistory {
  role: 'user' | 'model';
  parts: string;
}

export class GeminiService {
  private model: any | null;
  private isProductionMode: boolean;

  constructor() {
    // 開発環境ではモック、本番環境では実際のAPI
    this.isProductionMode = process.env.NODE_ENV === 'production';
    
    if (this.isProductionMode) {
      // APIキーの検証
      if (!API_KEY) {
        console.error('Gemini API key is not set. Please check your .env file.');
        throw new Error('Gemini API key is missing');
      }

      // より安定したモデルを使用（Gemini Pro）
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });
    } else {
      console.log('開発モード: Gemini APIのモック実装を使用');
      this.model = null; // 開発環境ではモックを使用
    }
  }

  // リトライ機能付きAPI呼び出し
  private async callWithRetry(chat: any, message: string, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`API呼び出し試行 ${attempt}/${maxRetries}:`, message.substring(0, 50) + '...');
        const result = await chat.sendMessage(message);
        console.log(`試行 ${attempt} 成功`);
        return result;
      } catch (error: any) {
        console.error(`試行 ${attempt} 失敗:`, error.message);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // 過負荷エラーの場合は少し待ってリトライ
        if (error.message?.includes('overloaded') || error.message?.includes('503')) {
          const waitTime = attempt * 2000; // 2秒、4秒、6秒と待機時間を増加
          console.log(`${waitTime/1000}秒待機してリトライします...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // その他のエラーの場合は短い待機
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  // モック応答を生成（開発環境用）
  private generateMockResponse(userMessage: string, conversationHistory: ConversationHistory[]): string {
    const mockResponses = [
      'ありがとうございます。詳しく教えてください。どのような具体的な課題がありましたか？',
      'なるほど、とても興味深いですね。その課題に対してどのようなアプローチを考えられましたか？',
      'そのソリューションは素晴らしいですね。お客様の反応はいかがでしたか？',
      '事例情報が整理されました！保存ボタンから事例を保存できます。[CONFIRM_SAVE]'
    ];
    
    const responseIndex = Math.min(conversationHistory.length % mockResponses.length, mockResponses.length - 1);
    return mockResponses[responseIndex];
  }

  // 会話を続ける
  async continueConversation(
    conversationHistory: ConversationHistory[],
    userMessage: string
  ): Promise<{
    response: string;
    structuredCase?: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>;
  }> {
    // 開発環境ではモック応答を返す
    if (!this.isProductionMode) {
      console.log('モック応答を生成中...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒の遅延をシミュレート
      
      const mockResponse = this.generateMockResponse(userMessage, conversationHistory);
      const updatedHistory = [...conversationHistory, { role: 'user' as const, parts: userMessage }];
      
      return {
        response: mockResponse,
        structuredCase: mockResponse.includes('[CONFIRM_SAVE]') ? this.extractStructuredCase(mockResponse, updatedHistory) : undefined
      };
    }

    try {
      // 本番環境でのnullチェック
      if (!this.model) {
        throw new Error('Gemini API model is not initialized');
      }

      // 会話履歴にユーザーのメッセージを追加
      const updatedHistory: ConversationHistory[] = [
        ...conversationHistory,
        { role: 'user', parts: userMessage }
      ];

      // Chat APIを使用して会話を管理
      const chatHistory = this.convertToChatHistory(updatedHistory);
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });

      // リトライ機能付きでメッセージを送信
      const result = await this.callWithRetry(chat, userMessage);
      const response = result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text.substring(0, 100) + '...');

      // Function Callingのチェック（簡易実装）
      const structuredCase = this.extractStructuredCase(text, updatedHistory);

      return {
        response: this.cleanResponse(text),
        structuredCase
      };
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        stack: error.stack
      });
      
      // より詳細なエラーメッセージ
      if (error.message?.includes('API_KEY_INVALID') || error.status === 400) {
        throw new Error('APIキーが無効です。Gemini APIキーを確認してください。');
      } else if (error.message?.includes('PERMISSION_DENIED') || error.status === 403) {
        throw new Error('APIキーの権限が不足しています。Gemini APIの設定を確認してください。');
      } else if (error.message?.includes('quota') || error.status === 429) {
        throw new Error('APIの利用制限に達しました。しばらく待ってから再試行してください。');
      } else if (error.message?.includes('overloaded') || error.message?.includes('503')) {
        throw new Error('AIサービスが一時的に過負荷状態です。少し時間をおいて再試行してください。');
      } else if (error.message?.includes('CORS')) {
        throw new Error('CORS エラーが発生しました。開発サーバーを再起動してください。');
      } else if (error.message?.includes('fetch')) {
        throw new Error('ネットワークエラーが発生しました。インターネット接続を確認してください。');
      }
      
      throw new Error(`AIとの通信中にエラーが発生しました: ${error.message || 'Unknown error'}`);
      
    } finally {
      // リソースのクリーンアップ（必要に応じて）
      console.log('API呼び出し完了');
    }
  }

  // 会話履歴をGemini Chat API形式に変換
  private convertToChatHistory(conversationHistory: ConversationHistory[]) {
    // システムプロンプトを最初のメッセージとして追加
    const chatHistory = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model', 
        parts: [{ text: 'わかりました。営業支援AIアシスタントとして、商談内容を聞き出し事例として整理いたします。' }]
      }
    ];

    // 会話履歴を変換（最新のユーザーメッセージは除く）
    const historyToConvert = conversationHistory.slice(0, -1);
    
    historyToConvert.forEach(entry => {
      chatHistory.push({
        role: entry.role,
        parts: [{ text: entry.parts }]
      });
    });

    return chatHistory;
  }


  // レスポンスをクリーンアップ
  private cleanResponse(text: string): string {
    // Function Calling関連の記述を削除
    return text.replace(/\[SAVE_CASE:.*?\]/g, '').trim();
  }

  // 事例登録の準備ができているかチェック
  checkIfReadyToSave(conversationHistory: ConversationHistory[]): boolean {
    // 最低限の情報が揃っているかチェック
    const allText = conversationHistory.map(h => h.parts).join(' ');
    
    // 業種、地域、課題、提案が含まれているかチェック
    const hasIndustry = allText.includes('建築') || allText.includes('土木') || allText.includes('設備');
    const hasRegion = allText.includes('県') || allText.includes('都') || allText.includes('府');
    const hasChallenge = allText.includes('課題') || allText.includes('問題') || allText.includes('困');
    const hasProposal = allText.includes('提案') || allText.includes('CAREECO') || allText.includes('解決');
    
    // 最低3つの情報が揃っていて、かつ十分な会話量がある場合のみ
    return [hasIndustry, hasRegion, hasChallenge, hasProposal].filter(Boolean).length >= 3 
           && conversationHistory.length >= 4; // 最低2往復の会話
  }

  // 構造化された事例を抽出（簡易実装）
  private extractStructuredCase(
    text: string,
    conversationHistory: ConversationHistory[]
  ): Omit<Case, 'id' | 'createdAt' | 'updatedAt'> | undefined {
    // 明示的な保存確認が返ってきた場合のみ事例を生成
    if (!text.includes('[CONFIRM_SAVE]')) {
      return undefined;
    }

    // 会話履歴から情報を抽出
    const allText = conversationHistory.map(h => h.parts).join(' ');
    
    // より詳細な情報抽出
    const extractInfo = (keywords: string[], defaultValue: string) => {
      for (const keyword of keywords) {
        const regex = new RegExp(`${keyword}[：:]?\\s*([^。\\n]{1,20})`, 'i');
        const match = allText.match(regex);
        if (match) return match[1].trim();
      }
      return defaultValue;
    };

    const caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'> = {
      title: extractInfo(['タイトル', '案件'], '営業事例'),
      industry: extractInfo(['業種', '業界'], allText.includes('建築') ? '建築業' : '建設業'),
      region: extractInfo(['地域', '都道府県'], '東京都'),
      orderStatus: allText.includes('失注') || allText.includes('断られ') || allText.includes('見送り') ? 'lost' : 'won',
      challenge: extractInfo(['課題', '問題', '困っている'], '業務効率化の課題'),
      proposal: extractInfo(['提案', '解決策'], 'CAREECONを活用した解決策'),
      result: extractInfo(['結果', '成果'], '検討中'),
      tags: []
    };

    return caseData;
  }

  // 初回メッセージを生成
  async generateInitialMessage(): Promise<string> {
    return 'こんにちは！今日の商談について教えてください。どんなお客様でしたか？';
  }
}