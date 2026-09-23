'use client';

import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import RecordPaymentModal from './RecordPaymentModal';
import type { Invoice, UserRole } from '@/lib/types';

interface InvoicePaymentActionProps {
  invoice: Invoice;
  role: UserRole;
}

export default function InvoicePaymentAction({ invoice, role }: InvoicePaymentActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Chỉ OWNER và ADMIN mới có quyền ghi nhận thanh toán
  if (role !== 'OWNER' && role !== 'ADMIN') {
    return null;
  }

  // Nếu hoá đơn đã thanh toán đủ hoặc đã huỷ bỏ thì không hiển thị nút thu tiền
  if (invoice.status === 'PAID' || invoice.status === 'VOID' || invoice.amountPaid >= invoice.total) {
    return null;
  }

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsOpen(true)}
        icon={<DollarSign size={15} />}
      >
        Ghi nhận thanh toán
      </Button>

      <RecordPaymentModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        invoice={{
          id: invoice.id,
          code: invoice.code,
          total: invoice.total,
          amountPaid: invoice.amountPaid,
          currency: invoice.currency,
        }}
      />
    </>
  );
}
