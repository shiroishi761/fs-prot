# TypeScript型定義仕様書

## 概要
BRANU営業支援システムで使用する全TypeScript型定義。フロントエンド・バックエンド間で統一された型安全性を提供。

## 基本型・共通型

### 共通ユーティリティ型
```typescript
// 基本的なレスポンス型
interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

// ページネーション
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}


// 日時
type DateString = string; // ISO 8601 format
type TimestampString = string; // ISO 8601 format with timezone

// ID型
type UserId = string;
type CaseId = string;
type SessionId = string;
type FavoriteId = string;
```

## 事例関連型

### 基本情報型
```typescript
// 企業規模
type CompanySize = 'small' | 'medium' | 'large';

// 建設業許可業種（29業種）
type Industry = 
  | '土木一式工事業'
  | '建築一式工事業'
  | '大工工事業'
  | '左官工事業'
  | 'とび・土工工事業'
  | '石工事業'
  | '屋根工事業'
  | '電気工事業'
  | '管工事業'
  | 'タイル・れんが・ブロック工事業'
  | '鋼構造物工事業'
  | '鉄筋工事業'
  | '舗装工事業'
  | 'しゅんせつ工事業'
  | '板金工事業'
  | 'ガラス工事業'
  | '塗装工事業'
  | '防水工事業'
  | '内装仕上工事業'
  | '機械器具設置工事業'
  | '熱絶縁工事業'
  | '電気通信工事業'
  | '造園工事業'
  | 'さく井工事業'
  | '建具工事業'
  | '水道施設工事業'
  | '消防施設工事業'
  | '清掃施設工事業'
  | '解体工事業';

// 都道府県
type Prefecture = 
  | '北海道' | '青森県' | '岩手県' | '宮城県' | '秋田県' | '山形県' | '福島県'
  | '茨城県' | '栃木県' | '群馬県' | '埼玉県' | '千葉県' | '東京都' | '神奈川県'
  | '新潟県' | '富山県' | '石川県' | '福井県' | '山梨県' | '長野県' | '岐阜県'
  | '静岡県' | '愛知県' | '三重県' | '滋賀県' | '京都府' | '大阪府' | '兵庫県'
  | '奈良県' | '和歌山県' | '鳥取県' | '島根県' | '岡山県' | '広島県' | '山口県'
  | '徳島県' | '香川県' | '愛媛県' | '高知県' | '福岡県' | '佐賀県' | '長崎県'
  | '熊本県' | '大分県' | '宮崎県' | '鹿児島県' | '沖縄県';

// 企業基本情報
interface CaseBasicInfo {
  companyName: string;
  industries: Industry[];
  mainIndustry: Industry;
  prefecture: Prefecture;
  municipality?: string;
  companySize: CompanySize;
}
```

### 事例型
```typescript
// 事例ステータス
type CaseStatus = 'in_progress' | 'won' | 'lost';

// タグ
type CaseTag = 
  | '受注'
  | '失注' 
  | '進行中'
  | '季節変動対策'
  | '利益率改善'
  | '営業時間不足'
  | '取引先分散'
  | '人材不足解決';

// 事例セット
interface CaseSet {
  id?: string;
  title: string;
  tag: CaseTag;
  challenge: string;
  need: string;
  proposal: string;
}

// 事例作成者情報
interface CaseCreator {
  id: UserId;
  name: string;
  email?: string;
}

// メイン事例型
interface Case {
  id: CaseId;
  title: string;
  basicInfo: CaseBasicInfo;
  caseSets: CaseSet[];
  status: CaseStatus;
  tags: CaseTag[];
  isFavorite?: boolean;
  isOwner?: boolean;
  hearingSessionId?: SessionId;
  hearingExpiresAt?: DateString;
  createdAt: DateString;
  updatedAt: DateString;
  createdBy: CaseCreator;
}

// 事例作成・更新用型
interface CreateCaseRequest {
  title: string;
  basicInfo: CaseBasicInfo;
  caseSets: Omit<CaseSet, 'id'>[];
  status: CaseStatus;
}

interface UpdateCaseRequest extends Partial<CreateCaseRequest> {
  caseSets?: CaseSet[]; // 更新時はIDを含む
}
```

## 認証関連型

### ユーザー型
```typescript
// ユーザー情報
interface User {
  id: UserId;
  email: string;
  name: string;
  picture?: string;
  createdAt: DateString;
  lastLoginAt?: DateString;
}

// 認証状態
interface AuthState {
  authenticated: boolean;
  user?: User;
  expiresAt?: DateString;
}

// ログイン応答
interface LoginResponse {
  user?: User;
  redirectTo?: string;
  error?: ApiError;
}

// OAuth コールバック
interface OAuthCallbackParams {
  code: string;
  state: string;
}
```

### セッション型
```typescript
// セッション情報
interface Session {
  id: string;
  userId: UserId;
  expiresAt: DateString;
  createdAt: DateString;
  lastAccessedAt: DateString;
}

// セッション設定
interface SessionConfig {
  rememberMe: boolean;
  ttlDays: number;
}
```

## AIヒヤリング関連型

### 会話型
```typescript
// 会話ロール
type ConversationRole = 'user' | 'assistant';

// 会話メッセージ
interface ConversationMessage {
  role: ConversationRole;
  content: string;
  timestamp: DateString;
}

// 会話履歴
type ConversationHistory = ConversationMessage[];
```

### ヒヤリングセッション型
```typescript
// ヒヤリングセッション
interface HearingSession {
  id: SessionId;
  userId: UserId;
  basicInfo: CaseBasicInfo;
  conversationHistory: ConversationHistory;
  caseSets: Omit<CaseSet, 'id'>[];
  canSave: boolean;
  createdAt: DateString;
  expiresAt: DateString;
  remainingDays: number;
}

// ヒヤリング開始リクエスト
interface StartHearingRequest {
  basicInfo: CaseBasicInfo;
}

// ヒヤリング開始レスポンス
interface StartHearingResponse {
  session_id: SessionId;
}

// 会話継続リクエスト
interface ContinueConversationRequest {
  session_id: SessionId;
  message: string;
}

// 会話継続レスポンス
interface ContinueConversationResponse {
  session_id: SessionId;
}

// ヒヤリング再開リクエスト
interface ResumeHearingRequest {
  caseId: CaseId;
}

```

## お気に入り関連型

### お気に入り型
```typescript
// お気に入り
interface Favorite {
  id: FavoriteId;
  userId: UserId;
  caseId: CaseId;
  createdAt: DateString;
  updatedAt: DateString;
}

// お気に入り状態
interface FavoriteStatus {
  isFavorite: boolean;
  addedAt?: DateString;
}

// お気に入り追加リクエスト
interface AddFavoriteRequest {
  caseId: CaseId;
}
```

## 検索・フィルタ関連型

### 検索パラメータ
```typescript
// 事例検索パラメータ
interface CaseSearchParams {
  keyword?: string;
  industries?: Industry[];
  prefecture?: Prefecture;
  municipality?: string;
  companySize?: CompanySize;
  tags?: CaseTag[];
  favoriteOnly?: boolean;
  page?: number;
  limit?: number;
}

// 自分の事例検索パラメータ
interface MyCasesParams {
  status?: 'all' | CaseStatus;
  page?: number;
  limit?: number;
}

// 検索結果
interface CaseSearchResult {
  cases: Case[];
  pagination: Pagination;
  filters: SearchFilters;
}

// 利用可能フィルター
interface SearchFilters {
  appliedFilters: Partial<CaseSearchParams>;
  availableFilters: {
    industries: Industry[];
    prefectures: Prefecture[];
    municipalities: string[];
    tags: CaseTag[];
  };
}
```

## UI状態管理型

### フォーム関連
```typescript
// フォーム状態
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// 基本情報フォーム
interface BasicInfoFormValues {
  companyName: string;
  industries: Industry[];
  mainIndustry: Industry | '';
  prefecture: Prefecture | '';
  municipality: string;
  companySize: CompanySize | '';
}

// 事例編集フォーム
interface CaseEditFormValues {
  title: string;
  basicInfo: BasicInfoFormValues;
  caseSets: Array<{
    id?: string;
    title: string;
    tag: CaseTag | '';
    challenge: string;
    need: string;
    proposal: string;
  }>;
  status: CaseStatus;
}
```

### コンポーネントProps型
```typescript
// 事例カードProps
interface CaseCardProps {
  case: Case;
  showActions?: boolean;
  onEdit?: (caseId: CaseId) => void;
  onDelete?: (caseId: CaseId) => void;
  onResumeHearing?: (caseId: CaseId) => void;
  onToggleFavorite?: (caseId: CaseId, isFavorite: boolean) => void;
  onClick?: (caseId: CaseId) => void;
}

// 事例一覧Props
interface CaseListProps {
  cases: Case[];
  loading?: boolean;
  pagination?: Pagination;
  showActions?: boolean;
  onPageChange?: (page: number) => void;
  onCaseClick?: (caseId: CaseId) => void;
  onEdit?: (caseId: CaseId) => void;
  onDelete?: (caseId: CaseId) => void;
  onResumeHearing?: (caseId: CaseId) => void;
  onToggleFavorite?: (caseId: CaseId, isFavorite: boolean) => void;
}

// 検索ボックスProps
interface SearchBoxProps {
  searchParams: CaseSearchParams;
  availableFilters: SearchFilters['availableFilters'];
  onSearchChange: (params: Partial<CaseSearchParams>) => void;
  onReset: () => void;
  loading?: boolean;
}

// サイドバーProps
interface SidebarProps {
  currentPath: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate: (path: string) => void;
}

// ポップアップProps
interface CaseDetailPopupProps {
  case: Case | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  showFavorite?: boolean;
  onToggleFavorite?: (caseId: CaseId, isFavorite: boolean) => void;
}
```

### 状態管理型
```typescript
// アプリケーション状態
interface AppState {
  auth: AuthState;
  cases: CasesState;
  hearing: HearingState;
  favorites: FavoritesState;
  ui: UIState;
}

// 事例状態
interface CasesState {
  searchResults: Case[];
  myCases: Case[];
  currentCase: Case | null;
  searchParams: CaseSearchParams;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

// ヒヤリング状態
interface HearingState {
  currentSession: HearingSession | null;
  loading: boolean;
  error: string | null;
}

// お気に入り状態
interface FavoritesState {
  favorites: Record<CaseId, FavoriteStatus>;
  loading: boolean;
  error: string | null;
}

// UI状態
interface UIState {
  sidebarCollapsed: boolean;
  currentPopup: {
    type: 'case-detail' | 'case-edit' | null;
    data: any;
  };
  notifications: Notification[];
  loading: {
    global: boolean;
    search: boolean;
    save: boolean;
  };
}

// 通知
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  createdAt: DateString;
}
```

## API関連型

### リクエスト・レスポンス型
```typescript
// 事例API
namespace CasesAPI {
  // GET /api/cases
  interface SearchRequest extends CaseSearchParams {}
  interface SearchResponse extends ApiResponse<CaseSearchResult> {}
  
  // GET /api/cases/my-cases
  interface MyCasesRequest extends MyCasesParams {}
  interface MyCasesResponse extends ApiResponse<{
    cases: Case[];
    pagination: Pagination;
  }> {}
  
  // GET /api/cases/{caseId}
  interface GetDetailResponse extends ApiResponse<{ case: Case }> {}
  
  // POST /api/cases
  interface CreateRequest extends CreateCaseRequest {}
  interface CreateResponse extends ApiResponse<{
    case: Pick<Case, 'id' | 'title' | 'status' | 'createdAt'>;
  }> {}
  
  // PUT /api/cases/{caseId}
  interface UpdateRequest extends UpdateCaseRequest {}
  interface UpdateResponse extends ApiResponse<{
    case: Pick<Case, 'id' | 'title' | 'updatedAt'>;
  }> {}
  
  // DELETE /api/cases/{caseId}
  interface DeleteResponse extends ApiResponse<{ message: string }> {}
}

// AIヒヤリングAPI
namespace HearingAPI {
  // POST /api/ai-hearing/start
  interface StartRequest extends StartHearingRequest {}
  interface StartResponse extends ApiResponse<StartHearingResponse> {}
  
  // POST /api/ai-hearing/continue
  interface ContinueRequest extends ContinueConversationRequest {}
  interface ContinueResponse extends ApiResponse<ContinueConversationResponse> {}
  
  // GET /api/ai-hearing/session/{sessionId}
  interface GetSessionResponse extends ApiResponse<{ session: HearingSession }> {}
  
  // POST /api/ai-hearing/resume
  interface ResumeRequest extends ResumeHearingRequest {}
  interface ResumeResponse extends ApiResponse<StartHearingResponse> {}
  
}

// お気に入りAPI
namespace FavoritesAPI {
  // POST /api/favorites
  interface AddRequest extends AddFavoriteRequest {}
  interface AddResponse extends ApiResponse<{
    case_id: CaseId;
    is_favorite: true;
    added_at: DateString;
  }> {}
  
  // DELETE /api/favorites/{caseId}
  interface RemoveResponse extends ApiResponse<{
    case_id: CaseId;
    is_favorite: false;
    removed_at: DateString;
  }> {}
  
  // GET /api/favorites/{caseId}
  interface GetStatusResponse extends ApiResponse<{
    case_id: CaseId;
    is_favorite: boolean;
    added_at?: DateString;
  }> {}
  
  // GET /api/favorites
  interface GetListResponse extends ApiResponse<{
    favorites: Array<{
      case_id: CaseId;
      added_at: DateString;
      case: Case;
    }>;
    pagination: Pagination;
  }> {}
  
}
```

## カスタムフック型

### React Hooks型
```typescript
// 事例検索フック
interface UseCaseSearchResult {
  cases: Case[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  searchParams: CaseSearchParams;
  setSearchParams: (params: Partial<CaseSearchParams>) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

// お気に入りフック
interface UseFavoritesResult {
  favorites: Record<CaseId, FavoriteStatus>;
  addFavorite: (caseId: CaseId) => Promise<void>;
  removeFavorite: (caseId: CaseId) => Promise<void>;
  toggleFavorite: (caseId: CaseId) => Promise<void>;
  isFavorite: (caseId: CaseId) => boolean;
  loading: boolean;
  error: string | null;
}

// ヒヤリングフック
interface UseHearingResult {
  session: HearingSession | null;
  sendMessage: (message: string) => Promise<void>;
  startHearing: (basicInfo: CaseBasicInfo) => Promise<SessionId>;
  resumeHearing: (caseId: CaseId) => Promise<SessionId>;
  saveTemporary: () => Promise<CaseId>;
  loading: boolean;
  error: string | null;
}
```

## エクスポート型定義

```typescript
// 主要な型をまとめてエクスポート
export type {
  // 基本型
  ApiResponse,
  ApiError,
  ValidationError,
  Pagination,
  DateString,
  TimestampString,
  UserId,
  CaseId,
  SessionId,
  FavoriteId,
  
  // 事例関連
  CompanySize,
  Industry,
  Prefecture,
  CaseBasicInfo,
  CaseStatus,
  CaseTag,
  CaseSet,
  CaseCreator,
  Case,
  CreateCaseRequest,
  UpdateCaseRequest,
  
  // 認証関連
  User,
  AuthState,
  LoginResponse,
  OAuthCallbackParams,
  Session,
  SessionConfig,
  
  // ヒヤリング関連
  ConversationRole,
  ConversationMessage,
  ConversationHistory,
  HearingSession,
  StartHearingRequest,
  StartHearingResponse,
  ContinueConversationRequest,
  ContinueConversationResponse,
  ResumeHearingRequest,
  
  // お気に入り関連
  Favorite,
  FavoriteStatus,
  AddFavoriteRequest,
  
  // 検索関連
  CaseSearchParams,
  MyCasesParams,
  CaseSearchResult,
  SearchFilters,
  
  // UI関連
  FormState,
  BasicInfoFormValues,
  CaseEditFormValues,
  CaseCardProps,
  CaseListProps,
  SearchBoxProps,
  SidebarProps,
  CaseDetailPopupProps,
  AppState,
  CasesState,
  HearingState,
  FavoritesState,
  UIState,
  Notification,
  
  // API関連
  CasesAPI,
  HearingAPI,
  FavoritesAPI,
  
  // フック関連
  UseCaseSearchResult,
  UseFavoritesResult,
  UseHearingResult,
};
```