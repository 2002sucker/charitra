'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import Editor from '@/components/editor/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { updateBlogAction } from '@/actions/entryAction';

interface BlogPost {
  slug: string;
  title: string;
  content: string;
  createdAt: string;
}

const defaultEditorContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

export default function EditBlogPage({ post }: { post: BlogPost }) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!title) {
      toast.error('Please enter a title.');
      return;
    }

    setPending(true);

    const result = await updateBlogAction({
      slug: post.slug,
      title,
      content,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Blog entry updated successfully!');
    }

    setPending(false);
  }

  return (
    <div className="mx-auto max-w-4xl p-6 rounded-2xl shadow-lg text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Edit Blog Entry</h1>
      <div className="mb-4">
        <p className="text-gray-400 text-center">
          Originally created on:{' '}
          {format(new Date(post.createdAt), 'MMMM dd, yyyy')}
        </p>
      </div>
      <div>
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
        />
        <div className="mb-4">
          <Editor initialValue={defaultEditorContent} onChange={setContent} />
        </div>
        <div className="flex gap-4">
          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? 'Updating...' : 'Update Entry'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
