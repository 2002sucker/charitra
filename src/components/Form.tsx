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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Calendar from './Calendar';
import Editor from './editor/editor';

interface BlogEntry {
  date: string;
  title: string;
  content: string;
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

export default function ContentForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState<string>('');
  const [pending, setPending] = useState(false);
  const [blogEntries, setBlogEntries] = useState<BlogEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setSlug(formattedDate);
    }
  }, [selectedDate]);

  const formattedDate = selectedDate
    ? format(selectedDate, 'MMMM dd, yyyy')
    : 'Select Date';

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date || null);
    setIsDialogOpen(false);
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
    }

    const formattedDateString = format(selectedDate, 'yyyy-MM-dd');

    setPending(true);

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
      setBlogEntries([
        ...blogEntries,
        { date: formattedDateString, title, content },
      ]);
      setContent('');
      setTitle('');
      setSelectedDate(null);
      setSlug('');
    }

    setPending(false);
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
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? 'Submitting...' : 'Create Entry'}
        </Button>
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
        <Editor initialValue={defaultEditorContent} onChange={setContent} />
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
                <p className="mt-2">{entry.content}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
