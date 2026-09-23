'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GripVertical, ArrowRight, AlertCircle } from 'lucide-react';
import { formatMoneyShort } from '@/lib/format';
import StatusBadge from '@/components/admin/StatusBadge';
import type { Project, ProjectStatus, UserRole } from '@/lib/types';

const PIPELINE_COLUMNS: { status: ProjectStatus; title: string }[] = [
  { status: 'BACKLOG', title: 'Backlog' },
  { status: 'DISCOVERY', title: 'Discovery' },
  { status: 'PROPOSAL', title: 'Proposal' },
  { status: 'SIGNED', title: 'Signed' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'UAT', title: 'UAT' },
  { status: 'DELIVERED', title: 'Delivered' },
];

interface KanbanBoardProps {
  initialBoard: Record<ProjectStatus, Project[]>;
  userRole: UserRole;
}

export default function KanbanBoard({ initialBoard, userRole }: KanbanBoardProps) {
  const router = useRouter();
  const [board, setBoard] = useState<Record<ProjectStatus, Project[]>>(initialBoard);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ProjectStatus | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canEdit = userRole !== 'VIEWER';

  const moveProject = async (projectId: string, targetStatus: ProjectStatus) => {
    if (!canEdit) return;

    let sourceStatus: ProjectStatus | null = null;
    let targetProject: Project | null = null;

    // Tìm vị trí hiện tại
    for (const [colStatus, items] of Object.entries(board)) {
      const found = items.find((p) => p.id === projectId);
      if (found) {
        sourceStatus = colStatus as ProjectStatus;
        targetProject = found;
        break;
      }
    }

    if (!sourceStatus || !targetProject || sourceStatus === targetStatus) {
      return;
    }

    // Lưu snapshot để rollback nếu gặp lỗi
    const previousBoard = { ...board };

    // Cập nhật Optimistic UI
    const updatedProject = { ...targetProject, status: targetStatus };
    const newBoard = { ...board };
    newBoard[sourceStatus] = newBoard[sourceStatus].filter((p) => p.id !== projectId);
    newBoard[targetStatus] = [updatedProject, ...(newBoard[targetStatus] || [])];

    setBoard(newBoard);
    setActiveMenuId(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Cập nhật trạng thái thất bại');
      }

      router.refresh();
    } catch (err: any) {
      // Rollback
      setBoard(previousBoard);
      setErrorMessage(err.message || 'Không thể chuyển giai đoạn.');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!canEdit) return;
    setDraggedProjectId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colStatus: ProjectStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colStatus) {
      setDragOverCol(colStatus);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, colStatus: ProjectStatus) => {
    if (dragOverCol === colStatus) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colStatus: ProjectStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    setDragOverCol(null);
    const projectId = e.dataTransfer.getData('text/plain') || draggedProjectId;
    if (projectId) {
      moveProject(projectId, colStatus);
    }
    setDraggedProjectId(null);
  };

  return (
    <div className="relative">
      {errorMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-2.5 text-xs font-medium text-[#B91C1C] transition-all">
          <AlertCircle size={15} className="flex-none" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1">
        {PIPELINE_COLUMNS.map(({ status, title }) => {
          const items = board[status] ?? [];
          const totalValue = items.reduce((sum, p) => sum + (p.budgetAmount || 0), 0);
          const isOver = dragOverCol === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex w-[280px] flex-none flex-col rounded-2xl border p-3 transition-colors ${
                isOver
                  ? 'border-primary/60 bg-primary/[0.03] ring-2 ring-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              {/* Header Cột */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge value={status} />
                  <span className="text-xs font-semibold text-muted">{title}</span>
                </div>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F1F3F6] px-1.5 text-[11px] font-semibold text-[#64748B]">
                  {items.length}
                </span>
              </div>

              {/* Tổng ngân sách cột */}
              <div className="mb-3 flex items-center justify-between border-b border-[#F1F3F6] pb-2 font-mono text-[11.5px] text-muted">
                <span>Ngân sách:</span>
                <span className="font-semibold text-foreground">
                  {formatMoneyShort(totalValue)}
                </span>
              </div>

              {/* Danh sách Cards */}
              <div className="flex flex-1 flex-col gap-2.5">
                {items.map((p) => {
                  const isMenuOpen = activeMenuId === p.id;
                  const isBeingDragged = draggedProjectId === p.id;

                  return (
                    <div
                      key={p.id}
                      draggable={canEdit}
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragEnd={() => {
                        setDraggedProjectId(null);
                        setDragOverCol(null);
                      }}
                      className={`group relative rounded-xl border border-border bg-[#FBFCFD] p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md ${
                        isBeingDragged ? 'opacity-40 ring-2 ring-primary' : ''
                      } ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    >
                      {/* Tiêu đề & Mã */}
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/projects/${p.id}`}
                          className="min-w-0 flex-1 hover:text-primary"
                        >
                          <b className="block truncate text-[13.5px] font-semibold leading-snug">
                            {p.title}
                          </b>
                          <span className="mt-0.5 block font-mono text-[11px] text-muted">
                            {p.code}
                          </span>
                        </Link>

                        {canEdit && (
                          <div className="relative flex-none">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : p.id);
                              }}
                              title="Chuyển giai đoạn"
                              className="rounded-md p-1 text-muted transition-colors hover:bg-[#EEF2F6] hover:text-foreground"
                            >
                              <GripVertical size={15} />
                            </button>

                            {/* Dropdown Menu chuyển giai đoạn */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 z-30 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl"
                              >
                                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                                  Chuyển sang:
                                </div>
                                {PIPELINE_COLUMNS.filter((col) => col.status !== p.status).map(
                                  (col) => (
                                    <button
                                      key={col.status}
                                      type="button"
                                      onClick={() => moveProject(p.id, col.status)}
                                      className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-primary/[0.08] hover:text-primary"
                                    >
                                      <span>{col.title}</span>
                                      <ArrowRight size={12} />
                                    </button>
                                  ),
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Khách hàng & Ngân sách */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-muted">
                          {p.clientName ?? 'Chưa gán KH'}
                        </span>
                        <span className="flex-none font-mono font-medium text-foreground">
                          {formatMoneyShort(p.budgetAmount, p.currency)}
                        </span>
                      </div>

                      {/* Thanh tiến độ */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10.5px] text-muted">
                          {p.progress}%
                        </span>
                      </div>

                      {/* Footer thẻ: Priority & Due Date */}
                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#F1F3F6] pt-2">
                        <StatusBadge value={p.priority} />
                        {p.dueDate && (
                          <span className="text-[11px] text-muted">
                            Hạn: {p.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {items.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#CBD5E1] text-xs text-muted">
                    Kéo dự án vào đây
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
