import EditBlogPage from '@/components/edit';
import { db } from '@/db/db';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

interface PageProps {
  params: Promise<Params>;
}
export default async function EditPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.slug, slug),
  });

  if (!post || !post.slug) {
    notFound();
  }
  //@ts-ignore
  return <EditBlogPage post={post} />;
}
