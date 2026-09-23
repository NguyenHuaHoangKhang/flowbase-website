import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PromptRunner from './PromptRunner';

export default async function RunPromptPage({ params }: { params: { id: string } }) {
  const prompt = await prisma.prompt.findUnique({
    where: { id: params.id, deletedAt: null },
  });
  
  if (!prompt) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PromptRunner prompt={prompt} />
    </div>
  );
}
