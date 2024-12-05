'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import Editor from '@/components/editor/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createBlogAction } from '@/actions/entryAction';
import Calendar from '@/components/Calendar';
import { format } from 'date-fns';

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

  useEffect(() => {
    if (selectedDate) {
      // Generate the slug from the selected date
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      setSlug(formattedDate);
    }
  }, [selectedDate]);

  const formattedDate = selectedDate
    ? format(selectedDate, 'MMMM dd, yyyy')
    : 'No date selected';

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
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

    const formattedDateString = format(selectedDate, 'yyyy-MM-dd');

    setPending(true);

    const result = await createBlogAction({
      //@ts-ignore
      date: formattedDateString,
      title,
      slug: slug,
      content,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Blog entry created successfully!');
      setBlogEntries((prevEntries) => [
        ...prevEntries,
        { date: formattedDateString, title, content },
      ]);
      setContent('');
      setTitle('');
    }

    setPending(false);
  }

  const isDateWithEntry = (date: Date) => {
    return blogEntries.some(
      (entry) => entry.date === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div className="mx-auto max-w-4xl p-6 rounded-2xl shadow-lg text-white">
      <h1 className="text-3xl font-bold mb-4 text-center">Create Blog Entry</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Calendar
            onDaySelect={handleDateSelect}
            selectedDate={selectedDate}
            isDateWithEntry={isDateWithEntry}
          />
          <p className="mt-4 text-center">Selected Date: {formattedDate}</p>
        </div>
        <div className="md:col-span-2">
          <div className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Slug (auto-generated from date)"
              value={slug}
              readOnly // Slug is now generated from date, so it's read-only
            />
          </div>
          <div className="mb-4">
            <Editor initialValue={defaultEditorContent} onChange={setContent} />
          </div>
          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending ? 'Submitting...' : 'Create Entry'}
          </Button>
        </div>
      </div>
      {blogEntries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 ">Existing Entries</h2>
          <ul>
            {blogEntries.map((entry, index) => (
              <li key={index} className="mb-2 p-2 rounded-md ">
                <span className="font-medium ">
                  {format(new Date(entry.date), 'MMMM dd, yyyy')} -{' '}
                  {entry.title}:{' '}
                </span>
                <span className="text-white">{entry.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
