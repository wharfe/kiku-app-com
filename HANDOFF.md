# HANDOFF

- 更新: 2026-09-09 00:05
- ブランチ: `main`（origin と同期済み）

## ゴール

LP が効いているかを数字で判断できる状態にする。公開（2026-05-13）から4か月、
この repo には計測が1つも入っておらず、流入もインストール経路も記録が無かった。

## 現在地

計測は3つとも本番で動いている。

| | 状態 |
|---|---|
| GA4 | プロパティ **kiku-app** (553151235)、測定 ID は `src/lib/analytics.ts:11`。実ブラウザで `page_view` と `click_play_badge` の送信を確認済み |
| Search Console | `sc-domain:kiku-app.com` 登録済み。サービスアカウント `my-mcp@general-495213.iam.gserviceaccount.com` をフル権限で追加済みなので MCP からも読める |
| Play referrer | `src/lib/playstore.ts` が組み立て。`/player` `/studio` の本番 HTML で確認済み |

`npm run verify`（`scripts/verify-build.mjs`）がビルド出力を検算する。CI には**まだ入れていない**
（`.github/workflows/deploy.yml` は build → deploy のみ）。

## 次の一手

1. **数日おいて Play Console の「ユーザーの獲得」で `utm_source=kiku-app.com` の到着を確認する。**
   到着していれば kiku-app-com#10 をクローズ。両アプリともインストールが日次2〜13件と少ないので、
   数日ゼロでも即「壊れている」と判断しない
2. **1〜2週間後、GA4 の国別セッションと Play の国別インストールを突き合わせる。**
   Play 側は日本が主力ではない（2026-08-22 時点: インドネシア20 / 日本18 / トルコ17 / 米国7、
   ただし上位5カ国で全体151のうち62しかカバーしない）。LP に来る国とインストールされる国が
   ズレていれば、ストア内検索が主流入という判断材料になる
3. `npm run verify` を `.github/workflows/deploy.yml` の build と deploy の間に挟むか決める
   （今は人が手で走らせる前提）

## 注意（あれば）

- **測定 ID を secret にしない。** 公開識別子なので `analytics.ts` 直書きが正解。環境変数にすると
  GitHub Secret + ワークフロー定義の変更が要り、CI 定義を触るゲートが発火する
- **`feature-graphics/` の依存をサイトの `package.json` に足さない。** playwright は
  `hasInstallScript: true` を持ち、`npm ci` するデプロイのたびに Chromium を落とす。
  依存は `feature-graphics/package.json` 側で持つ（一度そうなっていたのを剥がした）
- **本番確認の curl には `-L` を付ける。** `/player` は `/player/` へ 301 するので、
  付け忘れると空ボディを見て「反映されていない」と誤読する（今回1度やった）
- GA4 の `kiku-studio` プロパティは名前に反して Player と Studio **両方**のアプリを持つ
