FROM nginx:latest

# 証明書と秘密鍵をコンテナ内にコピー
COPY ssl /etc/nginx/ssl

# Nginxの設定ファイルをコピー
COPY default.conf /etc/nginx/conf.d/default.conf