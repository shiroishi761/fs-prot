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

      // プロンプトの作成
      const prompt = this.createPrompt(updatedHistory);

      // Gemini APIを呼び出し（シンプルな形式）
      console.log('Sending prompt to Gemini:', prompt.substring(0, 100) + '...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text.substring(0, 100) + '...');

      // Function Callingのチェック（簡易実装）
      // 実際の実装では、Gemini APIのFunction Calling機能を使用します
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

  // プロンプトを作成
  private createPrompt(conversationHistory: ConversationHistory[]): string {
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    // 会話履歴を追加
    conversationHistory.forEach(entry => {
      if (entry.role === 'user') {
        prompt += `営業担当者: ${entry.parts}\n`;
      } else {
        prompt += `アシスタント: ${entry.parts}\n`;
      }
    });

    return prompt;
  }

  // レスポンスをクリーンアップ
  private cleanResponse(text: string): string {
    // Function Calling関連の記述を削除
    return text.replace(/\[SAVE_CASE:.*?\]/g, '').trim();
  }

  // 構造化された事例を抽出（簡易実装）
  private extractStructuredCase(
    text: string,
    conversationHistory: ConversationHistory[]
  ): Omit<Case, 'id' | 'createdAt' | 'updatedAt'> | undefined {
    // 実際の実装では、Gemini APIのFunction Callingレスポンスから抽出します
    // ここでは会話履歴から情報を推測する簡易実装
    
    // レスポンスに保存指示が含まれているかチェック
    if (!text.includes('事例を保存') && !text.includes('登録完了')) {
      return undefined;
    }

    // 会話履歴から情報を抽出（簡易実装）
    // const allText = conversationHistory.map(h => h.parts).join(' ');
    
    // デフォルト値
    const defaultCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'> = {
      title: '新規事例',
      industry: '建設業',
      region: '東京都',
      companySize: 'medium',
      challenge: '',
      proposal: '',
      result: '',
      tags: []
    };

    // 実際の実装では、より高度な情報抽出を行います
    return defaultCase;
  }

  // 初回メッセージを生成
  async generateInitialMessage(): Promise<string> {
    return 'こんにちは！今日の商談について教えてください。どんなお客様でしたか？';
  }
}