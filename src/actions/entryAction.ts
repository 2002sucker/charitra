'use server';

import { db } from '@/db/db';
import { posts } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createBlogAction(data: {
  title: string;
  slug: string;
  content: string;
}) {
  try {
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        slug: data.slug,
        content: data.content,
      })
      .returning();

    if (!post) {
      return { error: 'Failed to create the blog.' };
    }

    revalidatePath('/');
    redirect(`/entry/${post.slug}`);
  } catch (error: any) {
    if (
      error instanceof Error &&
      error.message.includes('UNIQUE constraint failed')
    ) {
      return { error: 'That slug already exists.' };
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while creating the blog.',
    };
  }
}
