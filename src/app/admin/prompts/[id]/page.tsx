import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PromptEditor from './PromptEditor';

export default async function PromptDetailPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  
  let prompt = null;
  if (!isNew) {
    prompt = await prisma.prompt.findUnique({
      where: { id: params.id, deletedAt: null },
    });
    if (!prompt) notFound();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PromptEditor initialData={prompt} />
    </div>
  );
}
