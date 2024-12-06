import { db } from '@/db/db';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

interface PageProps {
  params: Promise<Params>; // Indicate that params is a Promise
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params; // Await and destructure params

  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.slug, slug), // Use the awaited slug
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="container py-12 md:py-20 max-w-3xl mx-auto bg-black text-white">
      <header className="mb-12">
        {/* Title and Date */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-mono mb-4 tracking-tight">
            {post.title}
          </h1>
          <time
            dateTime={post.createdAt}
            className="text-gray-400 text-sm md:text-base block font-mono"
          >
            {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
          </time>
          <p className="mt-1 text-gray-500 text-xs font-mono">
            Published on {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div
        className="prose prose-invert max-w-none text-lg text-white leading-relaxed
                   prose-img:rounded-xl prose-img:mx-auto prose-img:my-6 prose-img:block
                   prose-headings:font-bold prose-headings:font-mono  prose-headings:text-white prose-headings:mt-8 prose-headings:mb-4
                   prose-p:my-4 prose-p:text-white prose-p:font-mono
                   prose-blockquote:border-l-4 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:italic
                   prose-ul:list-disc prose-ul:ml-6 prose-ul:my-4 prose-ul:font-mono
                   prose-ol:list-decimal prose-ol:ml-6 prose-ol:my-4 prose-ol:font-mono
                   prose-a:text-blue-400 prose-a:hover:underline
                   prose-code:bg-gray-800 prose-code:text-gray-300 prose-code:p-1 prose-code:rounded prose-code:font-mono
                   prose-pre:bg-gray-800 prose-pre:text-gray-300 prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto prose-pre:font-mono
                   "
      >
        <div
          className="text-white"
          dangerouslySetInnerHTML={{ __html: post.content as string }}
        />
      </div>
    </article>
  );
}
