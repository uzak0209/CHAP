# CHAP Application

現在のデプロイ先: https://uzak0209.github.io/CHAP/

## アーキテクチャ図

### AWS インフラストラクチャ

#### 1. 詳細インフラストラクチャ図
- **ファイル:** `docs/aws-infrastructure.puml`
- **内容:** AWS VPC、EC2、RDS、セキュリティグループの詳細構成

#### 2. シンプルインフラストラクチャ図
- **ファイル:** `docs/simple-infrastructure.puml`
- **内容:** インフラストラクチャの概要とコンポーネント関係

#### 3. フルスタックアーキテクチャ図
- **ファイル:** `docs/full-architecture.puml`
- **内容:** フロントエンド、バックエンド、データベース、外部サービスの全体構成

#### 4. データフロー図
- **ファイル:** `docs/data-flow.puml`
- **内容:** 認証、CRUD操作、エラーハンドリングのデータフロー

## 現在のインフラストラクチャ

### AWS リソース
- **VPC:** vpc-0424a6dde1f0399ba (10.0.0.0/16)
- **EC2:** i-08e28edd6391df734 (t2.micro, 56.155.98.63)
- **RDS:** PostgreSQL 17.2 (db.t3.micro)
- **リージョン:** ap-northeast-3 (Asia Pacific - Osaka)

### エンドポイント
- **API Server:** http://56.155.98.63:8080
- **Database:** terraform-20250725215706850000000002.cta6geu24oet.ap-northeast-3.rds.amazonaws.com:5432

## 技術スタック

### バックエンド
- **言語:** Go 1.23
- **フレームワーク:** Gin Web Framework
- **ORM:** GORM v2
- **データベース:** PostgreSQL 17.2
- **認証:** JWT (JSON Web Tokens)

### フロントエンド
- **フレームワーク:** Next.js 13+ (App Router)
- **言語:** TypeScript
- **状態管理:** Redux Toolkit
- **スタイリング:** Tailwind CSS
- **UIコンポーネント:** shadcn/ui

### インフラストラクチャ
- **クラウド:** AWS
- **プロビジョニング:** Terraform
- **コンテナ:** Docker (開発環境)
- **プロキシ:** Nginx, Cloudflare
