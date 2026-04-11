'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { Task } from '@/types';
import { startOfWeek, addDays, format, isEqual, parseISO, startOfDay } from 'date-fns';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function WeeklyLoadChart({ tasks }: { tasks: Task[] }) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });

  const data = DAYS.map((day, i) => {
    const date = addDays(monday, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = tasks.filter(
      (t) => t.status === 'todo' && t.dueDate === dateStr
    ).length;
    return { day, count };
  });

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 4, left: -28, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: '#6B6B6B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Bar dataKey="count" fill="#D94040" radius={[4, 4, 0, 0]} maxBarSize={32}>
            <LabelList
              dataKey="count"
              position="top"
              style={{ fontSize: 11, fill: '#6B6B6B', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
