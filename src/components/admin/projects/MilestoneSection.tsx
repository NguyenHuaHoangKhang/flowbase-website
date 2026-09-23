'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateMilestoneModal from './CreateMilestoneModal';

interface MilestoneSectionProps {
  projectId: string;
  budgetAmount: number;
  totalAllocated: number;
}

export default function MilestoneSection({ projectId, budgetAmount, totalAllocated }: MilestoneSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <b className="block text-[15px]">Mốc thanh toán</b>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Thêm mốc
        </button>
      </div>
      <CreateMilestoneModal
        projectId={projectId}
        budgetAmount={budgetAmount}
        totalAllocated={totalAllocated}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
