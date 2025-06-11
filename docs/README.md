# CAREECO Documentation

## 概要
建設業界向け営業支援システム「CAREECO」の技術ドキュメント集。
AI駆動開発のためのファイル構造と実装詳細を記載。

## ドキュメント構造

### Components
- [`App.md`](./src/App.md) - メインアプリケーションコンポーネント
- [`CaseCollector.md`](./src/components/CaseCollector.md) - AI事例収集モーダル  
- [`CaseList.md`](./src/components/CaseList.md) - 事例一覧表示
- [`SearchBox.md`](./src/components/SearchBox.md) - 検索インターフェース

### Services  
- [`geminiService.md`](./src/services/geminiService.md) - Gemini API連携サービス

### Utils
- [`search.md`](./src/utils/search.md) - 事例検索ユーティリティ

### Types
- [`case.md`](./src/types/case.md) - 事例データ型定義

### Data
- [`mockCases.md`](./src/data/mockCases.md) - テスト用モックデータ

## AI駆動開発での活用方法

### 1. 実装前の参照フロー
```
1. 修正対象の特定 → 対応するドキュメント確認
2. 依存関係の把握 → 関連ファイルの洗い出し  
3. 実装パターンの理解 → 適切な修正方針決定
4. コード実装 → ドキュメント記載の注意点考慮
```

### 2. ドキュメント駆動開発
- 新機能追加時は先にドキュメント更新
- 実装後にドキュメントと実装の整合性確認
- リファクタリング時のドキュメント同期更新

### 3. 効率的なコード理解
- 全ファイル探索ではなく関連ドキュメントから開始
- 依存関係の明示による影響範囲の把握
- 実装パターンの統一による保守性向上

## システム構成

### フロントエンド
- **React 19.1.0** - UIライブラリ
- **TypeScript 4.9.5** - 型安全性
- **Tailwind CSS 3.4.17** - スタイリング

### AI/API
- **Google Gemini 1.5 Flash** - 対話型AI
- **Gemini Chat API** - 会話管理

### 開発ツール
- **React Scripts 5.0.1** - ビルドツール
- **Firebase Hosting** - デプロイ環境

## 重要な設計方針

### 状態管理
- React hooksベースの軽量な状態管理
- コンポーネント間のprops受け渡し
- 必要最小限のstate設計

### API統合
- Gemini Chat APIの適切な活用
- エラーハンドリングの統一
- レスポンスタイムアウト対応

### UX設計
- モーダルベースの操作フロー
- リアルタイムフィードバック
- アクセシビリティ対応

## 開発時の注意点
- ドキュメントと実装の同期維持
- 型安全性の確保
- パフォーマンス最適化
- セキュリティ考慮（APIキー管理）