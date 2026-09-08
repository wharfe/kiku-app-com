# Play Store 掲載アセットの生成

Play Console に載せる feature graphic とスクリーンショットをここで作る。
LP のビルドとは無関係なので、依存はサイト側の `package.json` ではなくこのディレクトリで持つ
（サイトの依存に playwright を入れると、Cloudflare Pages のデプロイのたびに
Chromium が落ちてくるため）。

## セットアップ

```bash
cd feature-graphics
npm install            # playwright + sharp
npx playwright install chromium
```

Figma からの書き出しには token が要る。`feature-graphics/.env` に置く（gitignore 済み）:

```
FIGMA_PERSONAL_ACCESS_TOKEN=<token>
```

## スクリプト

| スクリプト | 何をするか | 出力 |
|---|---|---|
| `export-figma-screenshots.mjs` | Figma の KIKU ファイルから全スクショフレームを PNG 書き出し | `screenshots/<page>/*.png` |
| `generate-tablet-screenshots.mjs` | 上のスマホ用スクショをタブレット比率のキャンバスに載せ、余白を琥珀グラデで埋める | `tablet-screenshots/{7,10}-inch/<page>/*.png` |

```bash
node export-figma-screenshots.mjs
node generate-tablet-screenshots.mjs
```

出力先の 2 ディレクトリは生成物なので gitignore してある（再生成できる）。

## feature graphic

`player.html` / `studio.html` が 1024x500 の feature graphic のソース。
ブラウザで開いてスクリーンショットを撮り、`feature-graphic-{player,studio}.png` として保存する。
