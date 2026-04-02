import { Suspense } from "react";

async function BlogContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1>BlogDetailページ</h1>
      <p>ID: {id}</p>
    </div>
  );
}

export default function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogContent params={params} />
    </Suspense>
  );
}
