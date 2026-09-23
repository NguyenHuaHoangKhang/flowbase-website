'use client';

import React from 'react';
import type { Milestone, Task } from '@/lib/types';
import { formatDate } from '@/lib/format';

interface ProjectTimelineProps {
  startDate: string | null;
  dueDate: string | null;
  milestones: Milestone[];
  tasks: Task[];
}

export default function ProjectTimeline({
  startDate,
  dueDate,
  milestones,
  tasks,
}: ProjectTimelineProps) {
  // Parse dates
  const start = startDate ? new Date(startDate) : new Date();
  const end = dueDate ? new Date(dueDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // default +30 days
  
  if (start > end) {
    return <div className="p-5 text-sm text-muted">Ngày bắt đầu phải trước ngày kết thúc.</div>;
  }

  const totalDuration = end.getTime() - start.getTime();

  // Helper to calculate left position percentage (0 to 100%)
  const getPosition = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (d < start) return 0;
    if (d > end) return 100;
    if (totalDuration === 0) return 0;
    return ((d.getTime() - start.getTime()) / totalDuration) * 100;
  };

  const msItems = milestones
    .filter(m => m.dueDate)
    .map(m => ({ ...m, pos: getPosition(m.dueDate)! }));
    
  const taskItems = tasks
    .filter(t => t.dueDate)
    .map(t => ({ ...t, pos: getPosition(t.dueDate)! }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-6 font-medium">Ma trận tiến độ (Timeline)</h3>
      
      <div className="relative pt-6 pb-2">
        {/* The main axis line */}
        <div className="absolute top-10 left-0 right-0 h-1 rounded-full bg-border" />

        {/* Start point */}
        <div className="absolute top-8 left-0 flex flex-col items-start -translate-x-1/2">
          <div className="h-4 w-4 rounded-full border-4 border-card bg-muted" />
          <span className="mt-2 text-xs font-medium">{formatDate(start.toISOString())}</span>
          <span className="text-[10px] text-muted uppercase">Bắt đầu</span>
        </div>

        {/* End point */}
        <div className="absolute top-8 right-0 flex flex-col items-end translate-x-1/2">
          <div className="h-4 w-4 rounded-full border-4 border-card bg-muted" />
          <span className="mt-2 text-xs font-medium">{formatDate(end.toISOString())}</span>
          <span className="text-[10px] text-muted uppercase">Hạn chót</span>
        </div>

        {/* Milestones */}
        {msItems.map(m => (
          <div 
            key={m.id} 
            className="absolute top-8 flex flex-col items-center -translate-x-1/2 group z-10"
            style={{ left: `${m.pos}%` }}
          >
            <div className="h-4 w-4 rounded-full border-4 border-card bg-primary ring-2 ring-primary/20 transition-transform group-hover:scale-125" />
            <div className="mt-2 whitespace-nowrap text-center opacity-70 group-hover:opacity-100">
              <p className="text-xs font-semibold text-primary">{m.title}</p>
              <p className="text-[10px] text-muted">{formatDate(m.dueDate!)}</p>
            </div>
          </div>
        ))}

        {/* Tasks - Render below axis */}
        {taskItems.map((t, idx) => (
          <div 
            key={t.id} 
            className="absolute top-10 flex flex-col items-center -translate-x-1/2 group z-0"
            style={{ left: `${t.pos}%` }}
          >
            <div className="h-8 w-px bg-border group-hover:bg-[#3B82F6]" />
            <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
            <div className="mt-1 whitespace-nowrap text-center opacity-60 group-hover:opacity-100 z-10 bg-card px-1">
              <p className="text-[11px] font-medium text-[#3B82F6]">{t.title}</p>
              <p className="text-[9px] text-muted">{t.assigneeName ?? 'chưa gán'}</p>
            </div>
          </div>
        ))}

        {/* Spacer to push content down so absolute items fit */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}
