# Prisma x Pothos GraphQL

Pothos GraphQLを使ってみたサンプルです。

Zennに記事を書いてみたからよかったら見てね。<br>
:point_right: https://zenn.dev/poyochan/articles/9f22799853784d

## 立ち上げ手順

### 1. git clone

```sh
git clone git@github.com:akhrszk/prisma-pothos-example.git
```

### 2. .env

```sh
cp .env.dev .env
```

### 3. 依存関係のインストール

```sh
pnpm i
```

### 4. PostgreSQL立ち上げ

どんな方法でも良いですが、Dockerを使う例

```sh
docker run --rm -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -p 5432:5432 -v $(pwd)/postgres/data:/var/lib/postgresql/data postgres:15.3
```

### 5. Seedデータを入れる

```sh
pnpm prisma db seed
```

Prisma StudioでDBを確認

```sh
pnpm prisma studio
```
http://localhost:5555/ をブラウザで開く

### 6. GraphQLサーバー立ち上げ

```sh
pnpm dev
```
http://localhost:3000/graphql をブラウザで開く
