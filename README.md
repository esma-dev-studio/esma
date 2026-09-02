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
