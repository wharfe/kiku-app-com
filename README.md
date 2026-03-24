# kiku-app.com

Kiku Player / Kiku Studio のランディングページ。Astro + Cloudflare Pages。

**URL**: https://kiku-app.com

## 構成

```
src/
  layouts/Layout.astro    — 共通レイアウト（ナビ + フッター）
  pages/
    index.astro           — トップページ（ペルソナカード + 2アプリ紹介）
    player.astro          — Kiku Player 紹介ページ
    studio.astro          — Kiku Studio 紹介ページ
    privacy.astro         — プライバシーポリシー
  styles/global.css       — Warm Amber テーマ（ライト/ダーク対応）
public/
  icon-player.svg         — Noto Emoji ヘッドフォン（1F3A7）
  icon-studio.svg         — Noto Emoji スタジオマイク（1F399）
```

## 開発

```bash
npm install
npm run dev        # localhost:4321
npm run build      # dist/ にビルド
```

## デプロイ

Cloudflare Pages に手動デプロイ（Git 連携は未設定）。

```bash
npm run build
wrangler pages deploy dist/ --project-name=kiku-app-com --branch=main
```

> **Note**: `wrangler pages project create` で CLI から作成したため、Cloudflare Dashboard の Git 連携 UI がありません。Git 連携が必要な場合は Dashboard からプロジェクトを再作成してください（カスタムドメインの再設定が必要）。
