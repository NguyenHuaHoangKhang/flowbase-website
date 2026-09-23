import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique name to prevent collisions
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    const path = join(uploadDir, uniqueName);
    
    await writeFile(path, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueName}`, name: file.name });
  } catch (error) {
    console.error('Lỗi khi upload file:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ khi tải file lên.' }, { status: 500 });
  }
}
