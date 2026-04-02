import { MicrocmsResponse, QiitaResponse } from "@/domain/Article";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

function CardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
        >
          <div className="h-40 w-full animate-pulse bg-gray-200" />
          <div className="p-4">
            <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function QiitaArticles() {
  const response = await axios.get<QiitaResponse[]>(
    "https://qiita.com/api/v2/items?query=user:Sicut_study&per_page=4",
    {
      headers: {
        Authorization: `Bearer ${process.env.QIITA_API_KEY}`,
      },
    }
  );

  const items = response.data.map((item) => ({
    id: item.id,
    title: item.title,
    url: item.url,
    image:
      "https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F810513%2F04c6ef92-7b08-467f-95b0-efd05a0e7ea4.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&w=1400&fit=max&s=255a4084e07534dc5871b77aa1318d0e",
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-green-500 hover:shadow-lg"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
              {item.title}
            </h3>
            <p className="mt-1 text-xs text-green-600">Qiita</p>
          </div>
        </a>
      ))}
    </div>
  );
}

async function MicrocmsBlogs() {
  const response = await axios.get<MicrocmsResponse>(
    "https://dg4uyk666s.microcms.io/api/v1/blogs",
    {
      headers: {
        "X-MICROCMS-API-KEY": `${process.env.MICROCMS_API_KEY}`,
      },
    }
  );

  const blogs = response.data.contents;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {blogs.map((blog) => (
        <Link
          key={blog.id}
          href={`/blogs/${blog.id}`}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-blue-500 hover:shadow-lg"
        >
          <div className="relative h-40 w-full overflow-hidden">
            <Image
              src={blog.eyecatch.url}
              alt={blog.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
              {blog.title}
            </h3>
            <p className="mt-1 text-xs text-blue-600">microCMS</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Blog</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-green-600">
          Qiita 記事
        </h2>
        <Suspense fallback={<CardSkeleton />}>
          <QiitaArticles />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-blue-600">
          microCMS ブログ
        </h2>
        <Suspense fallback={<CardSkeleton />}>
          <MicrocmsBlogs />
        </Suspense>
      </section>
    </main>
  );
}
