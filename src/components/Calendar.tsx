'use client';

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isFuture,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface DayProps {
  date: Date;
  isSelected: boolean;
  onSelect: (date: Date) => void;
  isDateWithEntry: (date: Date) => boolean;
}

function Day({ date, isSelected, onSelect, isDateWithEntry }: DayProps) {
  const today = new Date();
  const isPastOrPresent = !isFuture(date);
  const isDisabled = isFuture(date);
  const hasEntry = isDateWithEntry(date);

  return (
    <button
      onClick={() => isPastOrPresent && onSelect(date)}
      disabled={isDisabled}
      className={`
        aspect-square p-2 rounded-md flex items-center justify-center
        text-sm font-medium
        ${isSameDay(date, today) ? 'bg-blue-200 text-blue-700' : ''}
        ${
          isSelected
            ? 'bg-blue-500 text-white'
            : hasEntry
            ? 'bg-green-200 text-green-700'
            : 'bg-gray-100 text-gray-800'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}
        transition-colors
      `}
    >
      {format(date, 'd')}
    </button>
  );
}

interface CalendarProps {
  onDaySelect: (date: Date) => void;
  selectedDate: Date | null;
  isDateWithEntry: (date: Date) => boolean;
}

export default function Calendar({
  onDaySelect,
  selectedDate,
  isDateWithEntry,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const createPlaceholders = () => {
    const placeholders = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      placeholders.push(<div key={`placeholder-${i}`} className="p-2" />);
    }
    return placeholders;
  };

  return (
    <Card className="p-6 rounded-2xl shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1))
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1))
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium p-2 text-gray-600"
            >
              {day}
            </div>
          ))}

          {createPlaceholders()}

          {days.map((day) => (
            <Day
              key={day.toString()}
              date={day}
              isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
              onSelect={onDaySelect}
              isDateWithEntry={isDateWithEntry}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
