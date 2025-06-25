import { GoogleGenerativeAI } from '@google/generative-ai';
import { Case } from '../types/case';

// Gemini APIキーの取得（環境変数から取得、なければ直接指定）
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyB4SaTlaJ5jBf9iGlotsXufRBfvqCUcB9U';

// デバッグ用ログ
console.log('Gemini API Key loaded:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
console.log('Using hardcoded key:', !process.env.REACT_APP_GEMINI_API_KEY);

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
      companySize: {
        type: 'string',
        description: '企業規模',
        enum: ['小規模（〜30名）', '中規模（30〜100名）', '大規模（100名〜）']
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
    required: ['title', 'industry', 'region', 'companySize', 'challenge', 'proposal', 'result', 'tags']
  }
};
*/

// システムプロンプト
const SYSTEM_PROMPT = `あなたは建設業界の営業支援AIアシスタントです。
営業担当者から商談内容を聞き出し、効果的な事例として整理することが役割です。

以下の情報を自然な会話で聞き出してください：
1. お客様の業種（建築、土木、設備工事など）
2. 地域（都道府県）
3. 企業規模（従業員数）
4. お客様が抱えていた課題
5. 提案した内容（CAREECONのどの機能をどのように活用するか）
6. 結果（契約、検討中、デモ予定など）

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
  private model;

  constructor() {
    // APIキーの検証
    if (!API_KEY) {
      console.error('Gemini API key is not set. Please check your .env file.');
      throw new Error('Gemini API key is missing');
    }

    // 利用可能なモデルを使用（最新のGemini 1.5 Flash）
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });
  }

  // 会話を続ける
  async continueConversation(
    conversationHistory: ConversationHistory[],
    userMessage: string
  ): Promise<{
    response: string;
    structuredCase?: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>;
  }> {
    try {
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

      // 最新のユーザーメッセージのみを送信
      console.log('Sending message to Gemini:', userMessage.substring(0, 100) + '...');
      const result = await chat.sendMessage(userMessage);
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
      
      // より詳細なエラーメッセージ
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('APIキーが無効です。Gemini APIキーを確認してください。');
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('APIキーの権限が不足しています。Gemini APIの設定を確認してください。');
      } else if (error.message?.includes('quota')) {
        throw new Error('APIの利用制限に達しました。しばらく待ってから再試行してください。');
      }
      
      throw new Error(`AIとの通信中にエラーが発生しました: ${error.message || 'Unknown error'}`);
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
      companySize: allText.includes('大手') || allText.includes('100人') ? 'large' : 
                   allText.includes('中小') || allText.includes('30') ? 'small' : 'medium',
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