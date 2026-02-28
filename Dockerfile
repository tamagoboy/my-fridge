FROM node:22-alpine

WORKDIR /app

# 依存関係のインストール（キャッシュ活用）
COPY package.json package-lock.json ./
RUN npm ci

# Prisma Client 生成
COPY prisma ./prisma/
RUN npx prisma generate

# ソースコードのコピー
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
