# ステージ1: ビルド用ステージ（不要なファイルを最終イメージに含めない）
FROM golang:1.22 AS builder

# ワークディレクトリ作成
WORKDIR /api

# Go モジュールをコピー & ダウンロード
COPY go.mod go.sum ./

# アプリケーションのソースコードをコピー
COPY . .

# ビルド（バイナリ生成）
RUN go build -o api

# ステージ2: 実行用ステージ（最小の軽量イメージ）
FROM debian:bookworm-slim


# ビルドされたバイナリをコピー
COPY --from=builder /api/api .

# ポートを公開（必要に応じて）
EXPOSE 3000

# 実行コマンド
CMD ["./api"]

