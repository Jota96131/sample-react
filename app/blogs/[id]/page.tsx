import { Suspense } from "react";
import axios from "axios";
import Image from "next/image";
import { MicrocmsContent } from "@/domain/Article";
import ReloadButton from "./ReloadButton";

async function BlogContent({ params }: { params: Promise<{ id: string }> }) {
  "use cache";
  const { id } = await params;

  const response = await axios.get<MicrocmsContent>(
    `https://dg4uyk666s.microcms.io/api/v1/blogs/${id}`,
    {
      headers: {
        "X-MICROCMS-API-KEY": `${process.env.MICROCMS_API_KEY}`,
      },
    },
  );

  const blog = response.data;

  return (
    <article>
      <Image
        src={blog.eyecatch.url}
        alt={blog.title}
        width={600}
        height={300}
      />
      <h2>{blog.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      <ReloadButton id={id} />
    </article>
  );
}

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <h1>ブログ詳細</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <BlogContent params={params} />
      </Suspense>
    </div>
  );
}
