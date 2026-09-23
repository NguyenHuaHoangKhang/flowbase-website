import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { guard, parseBody, recordAudit } from '@/app/api/_lib';
import { z } from 'zod';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'nodejs';

// Thời gian chờ tối đa cho AI response (tùy thuộc vào model/vercel plan)
export const maxDuration = 60;

const runSchema = z.object({
  inputs: z.record(z.string(), z.string()).optional(),
});

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await guard('prompt', 'read');
  if (response) return response;

  const { data, response: invalid } = await parseBody(request, runSchema);
  if (invalid) return invalid;

  try {
    const prompt = await prisma.prompt.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!prompt) {
      return NextResponse.json({ error: 'Không tìm thấy prompt' }, { status: 404 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Thiếu cấu hình OPENAI_API_KEY trong hệ thống' },
        { status: 500 }
      );
    }

    // Thay thế các biến {{variable}} trong userPrompt bằng dữ liệu đầu vào
    let finalUserPrompt = prompt.userPrompt || '';
    if (data.inputs) {
      for (const [key, value] of Object.entries(data.inputs)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        finalUserPrompt = finalUserPrompt.replace(regex, value);
      }
    }

    // Gửi request tới OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: prompt.systemPrompt || 'You are a helpful assistant.',
      prompt: finalUserPrompt,
      temperature: 0.7,
    });

    await recordAudit({
      userId: user?.id,
      action: 'UPDATE',
      entityType: 'Prompt',
      entityId: prompt.id,
      summary: `Chạy AI Prompt ${prompt.name}`,
    });

    return NextResponse.json({ result: text });
  } catch (err: any) {
    console.error('[Run Prompt Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Lỗi hệ thống khi gọi AI' },
      { status: 500 }
    );
  }
}
