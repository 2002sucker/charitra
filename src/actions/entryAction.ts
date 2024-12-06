'use server';

import { db } from '@/db/db';
import { posts } from '@/db/schema';
import { eq } from 'drizzle-orm';
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

export async function updateBlogAction(data: {
  slug: string;
  title: string;
  content: string;
}) {
  try {
    const [updatedPost] = await db
      .update(posts)
      .set({
        title: data.title,
        content: data.content,
      })
      .where(eq(posts.slug, data.slug))
      .returning();

    if (!updatedPost) {
      return { error: 'Failed to update the blog entry.' };
    }

    revalidatePath(`/entry/${data.slug}`);
    revalidatePath('/');
    redirect(`/entry/${data.slug}`);
  } catch (error: any) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while updating the blog.',
    };
  }
}

export async function deleteBlogAction(slug: string) {
  try {
    const result = await db.delete(posts).where(eq(posts.slug, slug));

    if (result.rowsAffected === 0) {
      return { error: 'Blog entry not found.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'An unknown error occurred while deleting the blog.',
    };
  }
}
