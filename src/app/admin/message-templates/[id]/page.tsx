import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MessageTemplateEditor from './MessageTemplateEditor';
import { PageHeader } from '@/components/admin/ui';

export default async function MessageTemplateEditPage({ params }: { params: { id: string } }) {
  const [template, categories] = await Promise.all([
    prisma.messageTemplate.findUnique({
      where: { id: params.id, deletedAt: null },
    }),
    prisma.systemCategory.findMany({
      where: { deletedAt: null },
    })
  ]);

  if (!template) notFound();

  const channelOptions = categories.filter(c => c.type === 'CHANNEL').map(c => c.value);
  const categoryOptions = categories.filter(c => c.type === 'CATEGORY').map(c => c.value);

  return (
    <>
      <PageHeader
        title="Chỉnh sửa Mẫu tin nhắn"
        description="Biên soạn mẫu tin nhắn chuẩn, bạn có thể tự nhập thêm Lĩnh vực/Kênh mới nếu muốn."
        backTo="/admin/message-templates"
      />
      <div className="mt-6">
        <MessageTemplateEditor 
          template={template} 
          channelOptions={channelOptions} 
          categoryOptions={categoryOptions} 
        />
      </div>
    </>
  );
}
