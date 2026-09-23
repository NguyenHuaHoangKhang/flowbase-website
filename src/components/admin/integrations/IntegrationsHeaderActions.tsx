'use client';

import React, { useState } from 'react';
import { Plus, Webhook } from 'lucide-react';
import { Button } from '@/components/admin/ui';
import CreateIntegrationModal from './CreateIntegrationModal';
import CreateWebhookModal from './CreateWebhookModal';
import type { UserRole } from '@/lib/types';

interface IntegrationsHeaderActionsProps {
  role: UserRole;
}

export default function IntegrationsHeaderActions({
  role,
}: IntegrationsHeaderActionsProps) {
  const [isIntegrationOpen, setIsIntegrationOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);

  const canCreate = role === 'OWNER' || role === 'ADMIN';
  if (!canCreate) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        icon={<Webhook size={15} />}
        onClick={() => setIsWebhookOpen(true)}
      >
        Thêm Webhook
      </Button>

      <Button
        variant="primary"
        icon={<Plus size={15} />}
        onClick={() => setIsIntegrationOpen(true)}
      >
        Thêm kết nối
      </Button>

      <CreateIntegrationModal
        isOpen={isIntegrationOpen}
        onClose={() => setIsIntegrationOpen(false)}
      />

      <CreateWebhookModal
        isOpen={isWebhookOpen}
        onClose={() => setIsWebhookOpen(false)}
      />
    </div>
  );
}
