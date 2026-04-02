import { MicrocmsResponse } from "@/domain/Article";
import axios from "axios";
import Image from "next/image";
import { Suspense } from "react";

async function BlogList() {
  const response = await axios.get<MicrocmsResponse>(
    "https://dg4uyk666s.microcms.io/api/v1/blogs",
    {
      headers: {
        "X-MICROCMS-API-KEY": `${process.env.MICROCMS_API_KEY}`,
      },
    },
  );

  const items = response.data.contents.map((item) => ({
    id: item.id,
    title: item.title,
    image: item.eyecatch.url,
  }));

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <Image src={item.image} alt={item.title} width={100} height={100} />
          <a href={`/blogs/${item.id}`}>{item.title}</a>
        </li>
      ))}
    </ul>
  );
}

export default function BlogsPage() {
  return (
    <div>
      <h1>Blogsページ</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <BlogList />
      </Suspense>
    </div>
  );
}
