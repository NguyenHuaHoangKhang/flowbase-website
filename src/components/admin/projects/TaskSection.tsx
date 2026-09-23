'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import { StatusBadge } from '@/components/admin/ui';
import { Task } from '@/lib/types';

interface TaskSectionProps {
  projectId: string;
  tasks: Task[];
}

export default function TaskSection({ projectId, tasks }: TaskSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <b className="block text-[15px]">Công việc</b>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Thêm việc
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.map((t) => (
          <li 
            key={t.id} 
            className="flex items-center justify-between gap-3 border-b border-[#F1F3F6] pb-3 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/30 p-2 rounded-lg transition-colors -mx-2"
            onClick={() => handleOpenEdit(t)}
          >
            <div className="min-w-0">
              <b className="block truncate text-sm font-medium">{t.title}</b>
              <span className="text-[12.5px] text-muted">
                {t.assigneeName ?? 'chưa gán'} · {t.estimateHours ? `${t.estimateHours}h` : 'chưa ước lượng'}
                {t.subtasks && t.subtasks.length > 0 && (
                  <span className="ml-2 bg-muted/50 px-1.5 rounded">
                    {t.subtasks.filter((st: any) => st.isDone).length}/{t.subtasks.length}
                  </span>
                )}
                {t.attachments && t.attachments.length > 0 && (
                  <span className="ml-2 bg-muted/50 px-1.5 rounded">
                    {t.attachments.length} files
                  </span>
                )}
              </span>
            </div>
            <StatusBadge value={t.status} />
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-muted">Chưa có task.</p>}
      </ul>

      {isModalOpen && (
        <TaskDetailModal
          projectId={projectId}
          isOpen={isModalOpen}
          onClose={handleClose}
          task={selectedTask}
        />
      )}
    </>
  );
}
