# kiku-app.com

KIKU Player / KIKU Studio のランディングページ。Astro + Cloudflare Pages。

**URL**: https://kiku-app.com

## 構成

```
src/
  layouts/Layout.astro    — 共通レイアウト（ナビ + フッター + GA4）
  lib/
    analytics.ts          — GA4 測定 ID（プロパティ kiku-app）
    playstore.ts          — Play ストアへのリンク（install referrer を組み立てる）
  pages/
    index.astro           — トップページ（ペルソナカード + 2アプリ紹介）
    player.astro          — KIKU Player 紹介ページ
    studio.astro          — KIKU Studio 紹介ページ
    privacy.astro         — プライバシーポリシー
  styles/global.css       — Warm Amber テーマ（ライト/ダーク対応）
public/
  icon-player.svg         — Noto Emoji ヘッドフォン（1F3A7）
  icon-studio.svg         — Noto Emoji スタジオマイク（1F399）
scripts/
  verify-build.mjs        — ビルド出力の検算（`npm run verify`）
feature-graphics/         — Play ストア掲載アセットの生成（依存はこのディレクトリで持つ）
```

## 開発

```bash
npm install
npm run dev        # localhost:4321
npm run build      # dist/ にビルド
npm run verify     # ビルド出力を検算（build の後に走らせる）
```

`npm run verify` が見るもの:

- Play リンクの package id と、二重エンコードを解いた `utm_source` / `utm_medium` / `utm_campaign`
- GA4 スニペットが「測定 ID が設定されているときだけ」出ていること
- `data-campaign`（GA4 イベント）と referrer の `utm_campaign` が同じ名前であること
  — この2つは別々に書かれているので、片方だけ直すと静かにズレる

## 計測

| | どこ |
|---|---|
| GA4 | プロパティ **kiku-app**（web 専用）。測定 ID は `src/lib/analytics.ts` に直書き（公開識別子なので secret にしない） |
| Search Console | `sc-domain:kiku-app.com` |
| Play インストールの帰属 | CTA の Play リンクが `referrer=utm_source%3Dkiku-app.com...` を持つ |

アプリ側の GA4 プロパティ **kiku-studio** は名前に反して Player と Studio **両方**の Android
ストリームを持つ。LP のプロパティと混同しないこと。

## デプロイ

`main` への push で GitHub Actions が Cloudflare Pages へ自動デプロイする
（`.github/workflows/deploy.yml`、所要 30〜60 秒）。手動デプロイは通常不要。

Cloudflare Dashboard の Git 連携 UI は無い（`wrangler pages project create` で CLI から
作成したため）。デプロイは Actions が `wrangler-action` 経由で行っている。
