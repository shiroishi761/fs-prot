# データベーススキーマ仕様書

## 概要
BRANU営業支援システムのデータベース設計。MySQL 8.0 を想定した正規化されたリレーショナルデータベース構造。

## 全体設計方針
- **UUID使用**: 全テーブルでUUIDを主キーとして使用
- **論理削除**: 重要データは論理削除で対応
- **タイムスタンプ**: 作成日時・更新日時を全テーブルで管理
- **外部キー制約**: データ整合性を保証
- **インデックス最適化**: 検索・結合性能を考慮

## テーブル設計

### **users（ユーザー）**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  cognito_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'AWS Cognito ID',
  name VARCHAR(100) NOT NULL COMMENT 'ユーザー名',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'メールアドレス',
  picture_url VARCHAR(500) NULL COMMENT 'プロフィール画像URL',
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user' COMMENT 'ユーザーロール',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'アクティブフラグ',
  last_login_at TIMESTAMP NULL COMMENT '最終ログイン日時',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_cognito_id (cognito_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) COMMENT='ユーザー情報';
```

### **company_sizes（会社規模マスター）**
```sql
CREATE TABLE company_sizes (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  code VARCHAR(20) UNIQUE NOT NULL COMMENT '規模コード',
  name VARCHAR(50) NOT NULL COMMENT '規模名称',
  description VARCHAR(200) NULL COMMENT '規模説明',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'アクティブフラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_code (code),
  INDEX idx_sort_order (sort_order)
) COMMENT='会社規模マスター';

-- 初期データ
INSERT INTO company_sizes (id, code, name, description, sort_order) VALUES
('cs-001', 'small', '小規模', '従業員数〜50名', 1),
('cs-002', 'medium', '中規模', '従業員数50-300名', 2),
('cs-003', 'large', '大規模', '従業員数300名〜', 3);
```

### **regions（地域マスター）**
```sql
CREATE TABLE regions (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  code VARCHAR(10) UNIQUE NOT NULL COMMENT '地域コード',
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '地域名',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_code (code),
  INDEX idx_sort_order (sort_order)
) COMMENT='地域マスター';
```

### **prefectures（都道府県マスター）**
```sql
CREATE TABLE prefectures (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  region_id VARCHAR(36) NOT NULL COMMENT '地域ID',
  code VARCHAR(10) UNIQUE NOT NULL COMMENT '都道府県コード',
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '都道府県名',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_region_id (region_id),
  INDEX idx_code (code),
  INDEX idx_sort_order (sort_order),
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT
) COMMENT='都道府県マスター';
```

### **cities（市区町村マスター）**
```sql
CREATE TABLE cities (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  prefecture_id VARCHAR(36) NOT NULL COMMENT '都道府県ID',
  code VARCHAR(10) COMMENT '市区町村コード',
  name VARCHAR(50) NOT NULL COMMENT '市区町村名',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_prefecture_id (prefecture_id),
  INDEX idx_code (code),
  INDEX idx_name (name),
  INDEX idx_sort_order (sort_order),
  UNIQUE KEY unique_prefecture_name (prefecture_id, name),
  FOREIGN KEY (prefecture_id) REFERENCES prefectures(id) ON DELETE RESTRICT
) COMMENT='市区町村マスター';
```

### **industries（業種マスター）**
```sql
CREATE TABLE industries (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  name VARCHAR(100) UNIQUE NOT NULL COMMENT '業種名',
  category ENUM('一式工事業', '専門工事業') NOT NULL COMMENT '業種カテゴリ',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'アクティブフラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_sort_order (sort_order)
) COMMENT='業種マスター';

-- 初期データ（建設業許可業種29業種）
INSERT INTO industries (id, name, category, sort_order) VALUES
-- 一式工事業
('ind-001', '土木一式工事業', '一式工事業', 1),
('ind-002', '建築一式工事業', '一式工事業', 2),
-- 専門工事業
('ind-003', '大工工事業', '専門工事業', 3),
('ind-004', '左官工事業', '専門工事業', 4),
('ind-005', 'とび・土工工事業', '専門工事業', 5),
-- ... 他の業種も同様に定義
;
```

### **tags（タグマスター）**
```sql
CREATE TABLE tags (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  name VARCHAR(50) UNIQUE NOT NULL COMMENT 'タグ名',
  type ENUM('status', 'category') NOT NULL COMMENT 'タグタイプ',
  color VARCHAR(7) NULL COMMENT '表示色（HEX）',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'アクティブフラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_name (name),
  INDEX idx_type (type),
  INDEX idx_sort_order (sort_order)
) COMMENT='タグマスター';

-- 初期データ
INSERT INTO tags (id, name, type, color, sort_order) VALUES
('tag-001', '受注', 'status', '#10B981', 1),
('tag-002', '失注', 'status', '#EF4444', 2),
('tag-003', '進行中', 'status', '#F59E0B', 3),
('tag-004', '季節変動対策', 'category', '#3B82F6', 4),
('tag-005', '利益率改善', 'category', '#8B5CF6', 5),
('tag-006', '営業時間不足', 'category', '#EC4899', 6),
('tag-007', '取引先分散', 'category', '#06B6D4', 7),
('tag-008', '人材不足解決', 'category', '#84CC16', 8);
```

### **companies（会社）**
```sql
CREATE TABLE companies (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  name VARCHAR(255) NOT NULL COMMENT '会社名',
  size_id VARCHAR(36) NOT NULL COMMENT '規模ID',
  prefecture_id VARCHAR(36) NOT NULL COMMENT '都道府県ID',
  city_id VARCHAR(36) NULL COMMENT '市区町村ID',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '論理削除フラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_name (name),
  INDEX idx_size_id (size_id),
  INDEX idx_prefecture_id (prefecture_id),
  INDEX idx_city_id (city_id),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  UNIQUE KEY unique_company_name_prefecture (name, prefecture_id),
  FOREIGN KEY (size_id) REFERENCES company_sizes(id) ON DELETE RESTRICT,
  FOREIGN KEY (prefecture_id) REFERENCES prefectures(id) ON DELETE RESTRICT,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL
) COMMENT='会社情報';
```

### **company_industries（会社業種関連）**
```sql
CREATE TABLE company_industries (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  company_id VARCHAR(36) NOT NULL COMMENT '会社ID',
  industry_id VARCHAR(36) NOT NULL COMMENT '業種ID',
  is_main BOOLEAN NOT NULL DEFAULT FALSE COMMENT '主要業種フラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_company_id (company_id),
  INDEX idx_industry_id (industry_id),
  INDEX idx_is_main (is_main),
  UNIQUE KEY unique_company_industry (company_id, industry_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (industry_id) REFERENCES industries(id) ON DELETE RESTRICT
) COMMENT='会社業種関連';
```

### **deals（商談）**
```sql
CREATE TABLE deals (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  title VARCHAR(255) NOT NULL COMMENT '商談タイトル',
  company_id VARCHAR(36) NOT NULL COMMENT '会社ID',
  user_id VARCHAR(36) NOT NULL COMMENT '作成者ID',
  status ENUM('in_progress', 'won', 'lost') NOT NULL DEFAULT 'in_progress' COMMENT '商談ステータス',
  hearing_session_id VARCHAR(255) NULL COMMENT 'AIヒヤリングセッションID',
  hearing_expires_at TIMESTAMP NULL COMMENT 'ヒヤリング期限',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '論理削除フラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_company_id (company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_hearing_session_id (hearing_session_id),
  INDEX idx_hearing_expires_at (hearing_expires_at),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) COMMENT='商談情報';
```

### **cases（事例）** - **修正版**
```sql
CREATE TABLE cases (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  deal_id VARCHAR(36) NOT NULL COMMENT '商談ID',
  title VARCHAR(255) NOT NULL COMMENT '事例タイトル',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '論理削除フラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_deal_id (deal_id),
  INDEX idx_title (title),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  INDEX idx_updated_at (updated_at),
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
) COMMENT='事例情報';
```

### **case_sets（事例セット）** - **新規追加**
```sql
CREATE TABLE case_sets (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  case_id VARCHAR(36) NOT NULL COMMENT '事例ID',
  title VARCHAR(255) NOT NULL COMMENT 'セットタイトル',
  tag_id VARCHAR(36) NOT NULL COMMENT 'タグID',
  challenge TEXT NOT NULL COMMENT '課題内容',
  need TEXT NOT NULL COMMENT 'ニーズ内容',
  proposal TEXT NOT NULL COMMENT '提案内容',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '表示順',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE COMMENT '論理削除フラグ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_case_id (case_id),
  INDEX idx_tag_id (tag_id),
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_deleted (is_deleted),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE RESTRICT
) COMMENT='事例セット（課題・ニーズ・提案のセット）';
```

### **case_challenges（事例課題）** - **削除予定**
```sql
-- 注意: case_setsテーブルに統合されるため、このテーブルは削除予定
-- 移行スクリプトでデータをcase_setsに移行後、削除
```

### **case_needs（事例ニーズ）** - **削除予定**
```sql
-- 注意: case_setsテーブルに統合されるため、このテーブルは削除予定
```

### **case_proposals（事例提案）** - **削除予定**
```sql
-- 注意: case_setsテーブルに統合されるため、このテーブルは削除予定
```

### **case_tags（事例タグ関連）** - **修正版**
```sql
CREATE TABLE case_tags (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  case_id VARCHAR(36) NOT NULL COMMENT '事例ID',
  tag_id VARCHAR(36) NOT NULL COMMENT 'タグID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  
  INDEX idx_case_id (case_id),
  INDEX idx_tag_id (tag_id),
  UNIQUE KEY unique_case_tag (case_id, tag_id),
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) COMMENT='事例タグ関連';
```

### **user_favorites（お気に入り）** - **修正版**
```sql
CREATE TABLE user_favorites (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id VARCHAR(36) NOT NULL COMMENT 'ユーザーID',
  case_id VARCHAR(36) NOT NULL COMMENT '事例ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新日時',
  
  INDEX idx_user_id (user_id),
  INDEX idx_case_id (case_id),
  INDEX idx_created_at (created_at),
  UNIQUE KEY unique_user_case (user_id, case_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
) COMMENT='ユーザーお気に入り';
```

### **conversation_history（会話履歴）** - **新規追加**
```sql
CREATE TABLE conversation_history (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  deal_id VARCHAR(36) NOT NULL COMMENT '商談ID',
  role ENUM('user', 'assistant') NOT NULL COMMENT '発言者（user/assistant）',
  content TEXT NOT NULL COMMENT '会話内容',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  
  INDEX idx_deal_id (deal_id),
  INDEX idx_created_at (created_at),
  INDEX idx_deal_created (deal_id, created_at),
  FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
) COMMENT='AIヒヤリング会話履歴';
```

## ビュー定義

### **case_details_view（事例詳細ビュー）**
```sql
CREATE VIEW case_details_view AS
SELECT 
  c.id AS case_id,
  c.title AS case_title,
  c.created_at AS case_created_at,
  c.updated_at AS case_updated_at,
  -- 商談情報
  d.id AS deal_id,
  d.status AS deal_status,
  d.user_id AS creator_id,
  d.hearing_session_id,
  d.hearing_expires_at,
  -- 会社情報
  comp.id AS company_id,
  comp.name AS company_name,
  -- 会社規模
  cs.code AS company_size_code,
  cs.name AS company_size_name,
  -- 都道府県
  pref.name AS prefecture_name,
  -- 市区町村
  city.name AS city_name,
  -- 作成者情報
  u.name AS creator_name,
  u.email AS creator_email
FROM cases c
  INNER JOIN deals d ON c.deal_id = d.id
  INNER JOIN companies comp ON d.company_id = comp.id
  INNER JOIN company_sizes cs ON comp.size_id = cs.id
  INNER JOIN prefectures pref ON comp.prefecture_id = pref.id
  LEFT JOIN cities city ON comp.city_id = city.id
  INNER JOIN users u ON d.user_id = u.id
WHERE c.is_deleted = FALSE 
  AND d.is_deleted = FALSE 
  AND comp.is_deleted = FALSE;
```

### **public_cases_view（公開事例ビュー）**
```sql
CREATE VIEW public_cases_view AS
SELECT *
FROM case_details_view
WHERE deal_status IN ('won', 'lost');
```

### **my_cases_view（マイ事例ビュー）**
```sql
-- 使用時にuser_idでフィルタリング
CREATE VIEW my_cases_view AS
SELECT *
FROM case_details_view;
```

## インデックス戦略

### **検索性能最適化**
```sql
-- 事例検索用複合インデックス
CREATE INDEX idx_deals_status_created_at ON deals(status, created_at DESC);
CREATE INDEX idx_companies_prefecture_size ON companies(prefecture_id, size_id);

-- 全文検索インデックス
CREATE FULLTEXT INDEX ft_case_title ON cases(title);
CREATE FULLTEXT INDEX ft_case_sets_content ON case_sets(challenge, need, proposal);

-- お気に入り検索用インデックス
CREATE INDEX idx_favorites_user_created ON user_favorites(user_id, created_at DESC);
```

### **結合性能最適化**
```sql
-- 外部キー結合用インデックス（既に定義済み）
-- 追加の複合インデックス
CREATE INDEX idx_company_industries_main ON company_industries(company_id, is_main);
CREATE INDEX idx_case_tags_case_tag ON case_tags(case_id, tag_id);
```

## データ整合性制約

### **チェック制約**
```sql
-- 会社規模の1社につき1つのメイン業種
ALTER TABLE company_industries 
ADD CONSTRAINT chk_one_main_industry_per_company 
CHECK (
  (SELECT COUNT(*) FROM company_industries ci2 
   WHERE ci2.company_id = company_id AND ci2.is_main = TRUE) <= 1
);

-- 事例セットの表示順は正の整数
ALTER TABLE case_sets 
ADD CONSTRAINT chk_sort_order_positive 
CHECK (sort_order >= 0);
```

### **トリガー**
```sql
-- 商談ステータス変更時の自動タグ更新
DELIMITER $$
CREATE TRIGGER trg_deal_status_update_tags
AFTER UPDATE ON deals
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    -- 古いステータスタグを削除
    DELETE ct FROM case_tags ct
    INNER JOIN cases c ON ct.case_id = c.id
    INNER JOIN tags t ON ct.tag_id = t.id
    WHERE c.deal_id = NEW.id AND t.type = 'status';
    
    -- 新しいステータスタグを追加
    INSERT INTO case_tags (id, case_id, tag_id)
    SELECT 
      UUID(),
      c.id,
      t.id
    FROM cases c
    CROSS JOIN tags t
    WHERE c.deal_id = NEW.id 
      AND t.type = 'status'
      AND t.name = CASE 
        WHEN NEW.status = 'won' THEN '受注'
        WHEN NEW.status = 'lost' THEN '失注'
        WHEN NEW.status = 'in_progress' THEN '進行中'
      END;
  END IF;
END$$
DELIMITER ;
```

## データ移行スクリプト

### **既存データの移行**
```sql
-- case_challenges, case_needs, case_proposalsからcase_setsへの移行
INSERT INTO case_sets (id, case_id, title, tag_id, challenge, need, proposal, sort_order)
SELECT 
  UUID() as id,
  ch.case_id,
  CONCAT('事例セット', ROW_NUMBER() OVER (PARTITION BY ch.case_id ORDER BY ch.id)) as title,
  (SELECT id FROM tags WHERE name = '利益率改善' LIMIT 1) as tag_id, -- デフォルトタグ
  ch.content as challenge,
  COALESCE(n.content, '') as need,
  COALESCE(p.content, '') as proposal,
  ROW_NUMBER() OVER (PARTITION BY ch.case_id ORDER BY ch.id) - 1 as sort_order
FROM case_challenges ch
LEFT JOIN case_needs n ON ch.case_id = n.case_id
LEFT JOIN case_proposals p ON ch.case_id = p.case_id;
```

## パフォーマンス監視

### **監視すべきクエリ**
```sql
-- 事例検索性能
EXPLAIN SELECT * FROM public_cases_view 
WHERE prefecture_name = '東京都' 
ORDER BY case_created_at DESC LIMIT 10;

-- お気に入り一覧性能
EXPLAIN SELECT * FROM user_favorites uf
INNER JOIN case_details_view cdv ON uf.case_id = cdv.case_id
WHERE uf.user_id = 'user-123'
ORDER BY uf.created_at DESC;

-- 全文検索性能
EXPLAIN SELECT * FROM cases c
INNER JOIN case_sets cs ON c.id = cs.case_id
WHERE MATCH(cs.challenge, cs.need, cs.proposal) AGAINST('安全管理' IN NATURAL LANGUAGE MODE);
```

## バックアップ戦略

### **定期バックアップ**
```bash
# 毎日のフルバックアップ
mysqldump --single-transaction --routines --triggers branu_db > backup_$(date +%Y%m%d).sql

# バイナリログによる増分バックアップ
mysqladmin flush-logs
```

### **災害復旧計画**
- **RPO（目標復旧時点）**: 1時間以内
- **RTO（目標復旧時間）**: 4時間以内
- **レプリケーション**: マスター・スレーブ構成
- **地理的分散**: 異なるAZでのバックアップ保管