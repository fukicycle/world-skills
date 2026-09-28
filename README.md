# TECH ATHLETES — WorldSkills Portal

技能五輪国際大会（WorldSkills Competition, WSC）の入賞者と、大会・国別のメダル推移を公式データで振り返るサイトです。

公開先: https://fukicycle.github.io/world-skills/

## 画面

| タブ | 内容 |
|---|---|
| 栄誉殿堂 | 大会・部門・国・選手名で絞り込み、職種ごとに金・銀・銅の入賞者カードを表示 |
| 栄誉の壁 | 全大会のメダリストを一覧表示（メダル種別・国で絞り込み） |
| 技術分析 | 大会ごとのメダル推移、出場国・地域数の推移、国・地域別の推移（折れ線・ヒートマップ）、大会別メダルテーブル |
| 職種 | 部門別の職種一覧と、職種ごとの入賞者 |

入賞者カードは `?competitorId=<person_id>` 付きの URL で共有できます。

## データ

バックエンドは持たず、ブラウザから [WorldSkills API](https://api.worldskills.org) を直接呼び出しています。

- `GET /events` — コードが `WSC` で始まる、開催済みの大会のみを対象にします
- `GET /results?event=<id>` — 1大会で1,000件を超えるため、`offset` でページングして全件取得します
- 取得結果はページ内でキャッシュし、同じ大会を二度取得しません。全大会の結果は「栄誉の壁」「技術分析」を開いたとき（または共有リンクから開いたとき）に初めて読み込みます
- 敢闘賞は API 上 `MFE` / `MFE2` / `DIPLOMA`（2003年以前）と表記が異なるため、同じ区分として扱います
- 国・地域名は `Intl.DisplayNames` で日本語化し、WorldSkills 独自の表記（チャイニーズ・タイペイなど）のみ `src/data/worldskills.ts` で上書きしています
- 職種の日本語名と部門は `src/data/skillCatalog.ts` に英語の職種名をキーとして定義しています。未登録の職種は英語名のまま表示されます

## 開発

```bash
npm ci
npm run dev      # 開発サーバー (http://localhost:5173/world-skills/)
npm run build    # 型チェック + 本番ビルド (dist/)
npm run lint     # oxlint
npm run preview  # ビルド結果の確認
```

## 構成

```
src/
  App.tsx                     画面全体（ナビゲーション・各タブ）
  i18n.ts                     日本語 / 英語の文言
  data/
    worldskills.ts            API クライアント・型・名称の解決
    skillCatalog.ts           職種名の日本語訳と部門
    analytics.ts              メダルテーブル・推移の集計
  components/
    AnalyticsView.tsx         技術分析タブ
    charts/                   SVG チャート（積み上げ縦棒・折れ線・ヒートマップ）
public/
  404.html                    GitHub Pages で SPA を動かすためのリダイレクト
  ogp-image.png               SNS 共有用画像
```

## デプロイ

`main` ブランチへの push で GitHub Actions（`.github/workflows/deploy.yml`）がビルドし、GitHub Pages に公開します。
