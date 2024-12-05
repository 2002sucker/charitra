import { db } from '@/db/db';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPost({ params }: PageProps) {
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.slug, params.slug),
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="container py-24 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <time className="text-gray-500">
          {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
        </time>
      </header>
      <div
        className="prose prose-invert max-w-none"
        //@ts-ignore
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}