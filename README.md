# オンライン院試塾 esma — ランディングページ

GitHub Pages でそのまま公開できる、依存ライブラリなしの単一HTML LPです。

- `index.html` … LP本体（CSS/JS内包。外部依存は Google Fonts と Google フォーム埋め込みのみ）
- `.nojekyll` … GitHub Pages の Jekyll 処理を無効化（そのまま静的配信）

## 公開手順（GitHub Pages）

1. GitHub でリポジトリを作成し、このフォルダの内容をプッシュする
2. リポジトリの **Settings → Pages** を開く
3. **Build and deployment → Source** を「Deploy from a branch」、Branch を `main` / `/ (root)` にして Save
4. 数分後に公開URLが表示される

## 「ESMAっぽいURL」にする選択肢

現在の GitHub アカウントは `esma-dev-studio` のため、追加費用なしで次のURLが使えます。

| 方法 | URL | 手順 |
|---|---|---|
| ユーザーサイト（おすすめ） | `https://esma-dev-studio.github.io/` | リポジトリ名を **`esma-dev-studio.github.io`** にする |
| プロジェクトサイト(採用) | `https://esma-dev-studio.github.io/esma/` | リポジトリ名 `esma`(現在の公開URL) |
| 独自ドメイン | `https://esma-online.jp/` など | ドメインを取得し、Settings → Pages → Custom domain に設定。DNS に CNAME(`esma-dev-studio.github.io`) を追加。`CNAME` ファイルがリポジトリ直下に自動生成される |

ユーザーサイトは1アカウントに1つだけ作れます。将来ほかのページを公開する場合は、プロジェクトサイトとして `https://esma-dev-studio.github.io/<リポジトリ名>/` に並べられます。

## 更新のしかた

`index.html` を編集して `main` にプッシュするだけで、1〜2分で反映されます。

- 料金・キャンペーン文言 … `<!-- ===== Price ===== -->` セクション
- 申込フォーム … `<!-- ===== Form ===== -->` の iframe の `src`（Google フォームの埋め込みURL）
- 色 … `<style>` 冒頭の `:root` 変数（`--teal`, `--pink` など）

## Netlify での公開(現在のメイン公開URL)

- 公開URL: https://esma-inshi.netlify.app/
- Netlify サイト名: `esma-inshi`(Netlifyアカウント: 2016.kkg.ynu@gmail.com)
- `esma.netlify.app` は他ユーザーが使用中のため取得不可

### 更新手順(Netlify CLI)

`index.html` を編集したら、このフォルダで次を実行する(ログイン済みのPCで動く)。

```bash
npx --yes netlify-cli@latest deploy --prod --dir . --site d8613ec3-4ad3-4679-9167-8c914a9f230c
```

GitHub にプッシュしただけで自動更新したい場合は、Netlify のダッシュボード(Site configuration → Build & deploy → Link repository)で `esma-dev-studio/esma` を連携する。

## アクセス解析(GA4)

- `index.html` 冒頭の `window.ESMA_GA_ID = '';` に GA4 の測定ID(`G-XXXXXXXXXX`)を入れると計測が始まる。空のままなら GA のスクリプトは読み込まれない
- 送信イベント: `cta_click`(cta_location: header / hero / sticky / self_check / cta-band など)、`self_check_answer`、`self_check_complete`、`section_view`(results / price / faq / form)、`form_reached`、`form_open_external`、`blog_referral`(ESCAPEブログ経由)
- GA4 側では `form_reached` と `self_check_complete` を「キーイベント(コンバージョン)」に設定するとレポートで見やすい
- 申込の実数は Google フォームの回答一覧で確認する(iframe 内の送信は GA4 では取れない)
