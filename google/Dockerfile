# ステージ1: ビルド用ステージ
FROM golang:1.23 AS builder

WORKDIR /google

# Goモジュールをコピー & 依存解決
COPY go.mod go.sum ./
RUN go mod download

# アプリケーションのソースコードをコピー
COPY . .

# ビルド（バイナリ生成）
RUN go build -o api

# ステージ2: 実行用ステージ（軽量）
FROM debian:bookworm-slim

# 必要に応じてSSLやCA証明書をインストール（httpsリクエスト使うなら）
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# バイナリをコピー
COPY --from=builder /google/api .

# ポートを公開（Goアプリが使うポート）
EXPOSE 1112

# 実行コマンド
CMD ["./api"]
