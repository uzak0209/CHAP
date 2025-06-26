FROM node:20-alpine

# 作業ディレクトリを作成
WORKDIR /web

# package.jsonとpackage-lock.jsonを先にコピー（キャッシュ利用のため）
COPY package*.json ./

# 依存関係のインストール
RUN npm install

# 残りのソースコードをコピー
COPY . .

# Next.jsのビルド
RUN npm run build

# ポート番号（Next.jsのデフォルトは3000）
EXPOSE 3000

# 本番サーバー起動（Next.jsのstartコマンド）
CMD ["npm", "start"]