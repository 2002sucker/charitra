'use client';

import { createBlogAction } from '@/actions/entryAction';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { JSONContent } from 'novel';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Calendar from './Calendar';
import NovelEditor from './editor/editor';

interface BlogEntry {
  date: string;
  title: string;
  content: string;
  editorContent: JSONContent;
}

interface DraftContent {
  title: string;
  date: string | null;
  content: string;
  editorContent: JSONContent;
  slug: string;
}

const DRAFT_STORAGE_KEY = 'blog-draft-content';
const ENTRIES_STORAGE_KEY = 'blog-entries';

const defaultEditorContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

export default function BlogEditor() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState<string>('');
  const [editorContent, setEditorContent] =
    useState<JSONContent>(defaultEditorContent);
  const [pending, setPending] = useState(false);
  const [blogEntries, setBlogEntries] = useState<BlogEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      // Retrieve draft content
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      const savedEntries = localStorage.getItem(ENTRIES_STORAGE_KEY);

      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setTitle(parsedDraft.title || '');
          setContent(parsedDraft.content || '');
          setEditorContent(parsedDraft.editorContent || defaultEditorContent);
          setSlug(parsedDraft.slug || '');

          if (parsedDraft.date) {
            setSelectedDate(new Date(parsedDraft.date));
          }
        } catch (error) {
          console.error('Error parsing saved draft:', error);
        }
      }

      if (savedEntries) {
        try {
          setBlogEntries(JSON.parse(savedEntries));
        } catch (error) {
          console.error('Error parsing saved entries:', error);
        }
      }

      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const draftContent: DraftContent = {
        title,
        date: selectedDate?.toISOString() || null,
        content,
        editorContent,
        slug,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftContent));
    }
  }, [title, selectedDate, content, editorContent, slug, isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(ENTRIES_STORAGE_KEY, JSON.stringify(blogEntries));
    }
  }, [blogEntries, isMounted]);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setSlug(formattedDate);
    }
  }, [selectedDate]);

  // Skip rendering until mounted to prevent hydration errors
  if (!isMounted) {
    return null;
  }

  const formattedDate = selectedDate
    ? format(selectedDate, 'MMMM dd, yyyy')
    : 'Select Date';

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setIsDialogOpen(false);
  };

  const clearDraft = () => {
    setTitle('');
    setContent('');
    setEditorContent(defaultEditorContent);
    setSelectedDate(null);
    setSlug('');
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    toast.success('Draft cleared!');
  };

  const handleEditorChange = (
    htmlContent: string,
    jsonContent: JSONContent
  ) => {
    setContent(htmlContent);
    setEditorContent(jsonContent);
  };

  async function handleSubmit() {
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }
    if (!title) {
      toast.error('Please enter a title.');
      return;
    }
    if (!content) {
      toast.error('Please enter content for your blog.');
      return;
    }

    const formattedDateString = format(selectedDate, 'yyyy-MM-dd');
    setPending(true);

    try {
      const result = await createBlogAction({
        //@ts-ignore
        date: formattedDateString,
        title,
        slug,
        content,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Blog entry created successfully!');
        setBlogEntries((prev) => [
          ...prev,
          {
            date: formattedDateString,
            title,
            content,
            editorContent,
          },
        ]);
        clearDraft();
      }
    } catch (error) {
      toast.error('Failed to create blog entry. Please try again.');
    } finally {
      setPending(false);
    }
  }

  const isDateWithEntry = (date: Date) => {
    return blogEntries.some(
      (entry) => entry.date === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Create Blog Entry
        </h1>
        <div className="space-x-2">
          <Button onClick={clearDraft} variant="outline">
            Clear Draft
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? 'Submitting...' : 'Create Entry'}
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <Input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus:outline-none focus:ring-0 focus:border-transparent text-lg"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTitle className="sr-only">Calendar</DialogTitle>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`text-sm ${!selectedDate ? 'text-gray-500' : ''}`}
            >
              {formattedDate}
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white text-black rounded-lg shadow-lg">
            <Calendar
              onDaySelect={handleDateSelect}
              selectedDate={selectedDate}
              isDateWithEntry={isDateWithEntry}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg overflow-hidden">
        <NovelEditor
          initialValue={editorContent}
          onChange={handleEditorChange}
        />
      </div>

      {blogEntries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center">Existing Entries</h2>
          <ul className="space-y-4">
            {blogEntries.map((entry, index) => (
              <li key={index} className="p-4 rounded-lg shadow-sm">
                <span className="font-semibold text-lg">
                  {format(new Date(entry.date), 'MMMM dd, yyyy')} -{' '}
                  {entry.title}:
                </span>
                <div
                  className="mt-2 prose prose-invert"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
