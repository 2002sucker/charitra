import { db } from '@/db/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Blogs() {
  const posts = await db.query.posts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  });

  if (!posts || posts.length === 0) {
    return (
      <section className="py-24  text-white">
        <div className="container px-8">
          <h1 className="text-3xl font-bold font-mono">Blogs</h1>
          <p className="mt-6 text-gray-400">No posts found yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24  text-white">
      <div className="container px-8">
        <h1 className="text-3xl font-bold font-mono mb-8">Entries</h1>
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.id} className="pb-8 border-b border-gray-700">
              <Link href={`/entry/${post.slug}`}>
                <h2 className="text-2xl font-bold font-mono hover:text-yellow-400 transition-colors duration-200">
                  {post.title}
                </h2>
              </Link>
              <p className="mt-1 text-gray-500 text-xs font-mono">
                Published on{' '}
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
