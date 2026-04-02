---
status: draft
tags: Next.js, React, 初心者, CSR, ISR
twitter: |
  Next.jsのCSR・SSR・ISRの違いを手を動かして学んだので整理しました。
  レストランに例えると一発で分かります。
  #Nextjs #React #初心者 #個人開発
  [ここにQiitaのURLを貼る]
---

# Next.jsのCSR・SSR・ISRの違いを手を動かして整理してみた

## はじめに

先日、Next.jsのチュートリアル記事を見ながら
テックブログアプリを実際に手を動かして作ってみました。

その中で一番「なるほど！」となったのが、
**CSR・SSR・ISRというレンダリング戦略の違い**です。

最初は「全部ページを表示するんでしょ？何が違うの？」という状態でしたが、
実際に3パターンとも書いてみたら違いがハッキリ分かったので、
自分なりの理解を整理します。

---

## ひとことで言うと「HTMLをどこで・いつ作るか」の違い

レストランに例えるとスッキリ理解できました。

| 方式 | レストランで言うと |
|---|---|
| CSR | お客さんに材料を渡して「自分で作ってね」 |
| SSR | 注文が入るたびにシェフが1から作る |
| ISR | 作り置きして、定期的に新しく作り直す |

以下、それぞれ実際に書いてみて気づいたことを書きます。

---

## CSR（クライアントサイドレンダリング）

`"use client"` をファイルの先頭に書くとCSRになります。

```tsx
"use client";

import { useEffect, useState } from "react";

export default function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, []);

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 書いてみて気づいたこと

- `useEffect` でデータを取得する → ページが表示されてからAPIを叩くので、**一瞬何も表示されない時間がある**
- リロードすると白画面が一瞬見える → これがSEOに弱い理由か、と体感で分かった
- 環境変数は `NEXT_PUBLIC_` をつけないとブラウザから見えない。

---

## SSR（サーバーサイドレンダリング）

`"use client"` を書かなければServer Component、つまりSSRになります。
**Next.jsのデフォルトはこっち。**

```tsx
export default async function Home() {
  const response = await fetch("/api/posts");
  const posts = await response.json();

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### 書いてみて気づいたこと

- `async` を直接使える → `useEffect` も `useState` もいらないのでコードがめちゃくちゃシンプル
- CSRと違って**最初から完成したHTMLが返る**ので、白画面が出ない
- `NEXT_PUBLIC_` なしの環境変数が使える → サーバーだけで動くから、APIキーが安全

CSRのコードと見比べると、SSRの方が圧倒的にシンプルで驚きました。

---

## ISR（インクリメンタル静的再生成）

Next.js 16では `"use cache"` を書くとキャッシュが効きます。

```tsx
async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  "use cache";
  const { id } = await params;

  const response = await fetch(`https://your-cms.example.com/api/blogs/${id}`, {
    headers: { "X-API-KEY": `${process.env.CMS_API_KEY}` },
  });
  const blog = await response.json();

  return (
    <article>
      <h2>{blog.title}</h2>
      <p>{blog.body}</p>
    </article>
  );
}
```

### 書いてみて気づいたこと

- `"use cache"` を1行追加するだけでキャッシュされる。手軽さに驚いた
- `next.config.ts` に `cacheComponents: true` を書かないと動かない。
- キャッシュされるので表示が爆速。でもCMSで記事を更新しても画面に反映されない → **キャッシュを消す仕組み**が別途必要

---

## キャッシュを手動で消す：Server Actions

ISRで「CMSを更新したのに反映されない！」を解決するために、
Server Actionsでキャッシュを消すボタンを作りました。

```tsx
// actions.ts（サーバー側）
"use server";
import { revalidatePath } from "next/cache";

export async function refreshPage(formData: FormData) {
  const path = formData.get("path") as string;
  revalidatePath(path);
}
```

```tsx
// RefreshButton.tsx（クライアント側）
"use client";
import { refreshPage } from "./actions";

export default function RefreshButton({ path }: { path: string }) {
  return (
    <form action={refreshPage}>
      <input type="hidden" name="path" value={path} />
      <button type="submit">最新データに更新</button>
    </form>
  );
}
```

ボタンを押すとサーバー側でキャッシュが消え、次のアクセスで最新データが表示されます。

**`"use server"` と `"use client"` の役割分担**がここで一番よく分かりました。

---

## 使い分けの目安

| ページの特徴 | おすすめ | 例 |
|---|---|---|
| ユーザーごとに違う内容 | CSR | マイページ、ダッシュボード |
| 常に最新データが必要 | SSR | SNSのタイムライン、検索結果 |
| あまり変わらない内容 | ISR | ブログ記事、お知らせ |

迷ったらSSR（デフォルト）でOK。パフォーマンスが気になったらISRを検討。

---

## まとめ

| 方式 | HTMLを作る場所 | いつ作る？ |
|---|---|---|
| CSR | ブラウザ | ページを開いたとき |
| SSR | サーバー | リクエストのたび |
| ISR | サーバー | キャッシュ＋定期的に再生成 |

正直、ドキュメントを読んだだけのときは
「SSRとISRって何が違うの？」と思っていましたが、
実際にコードを書いて動かしてみると**体感で違いが分かりました。**

特に、CSRで白画面が出る瞬間と、SSRで最初から表示される違いを
自分の目で見たのが一番の学びでした。

これからNext.jsを始める方は、まず全パターン手を動かして試してみるのがおすすめです！
