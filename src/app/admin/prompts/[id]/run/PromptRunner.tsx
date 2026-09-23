'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Copy, Check } from 'lucide-react';

export default function PromptRunner({ prompt }: { prompt: any }) {
  const router = useRouter();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const variables = prompt.variables || [];

  const handleRun = async () => {
    setRunning(true);
    setResult('');
    
    try {
      const res = await fetch(`/api/admin/prompts/${prompt.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi gọi AI');
      }
      
      setResult(data.result);
      alert('Đã nhận phản hồi từ AI');
    } catch (err: any) {
      alert(err.message || 'Lỗi gọi API');
    } finally {
      setRunning(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted transition-colors hover:text-ink hover:bg-bg"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Chạy Prompt: {prompt.name}</h1>
            <p className="text-sm text-muted">{prompt.description}</p>
          </div>
        </div>
        
        <button
          onClick={handleRun}
          disabled={running}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#059669] disabled:opacity-50"
        >
          <Play size={16} /> {running ? 'Đang chạy AI...' : 'Chạy AI ngay'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cột trái: Form nhập liệu */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Tham số đầu vào</h2>
          {variables.length === 0 ? (
            <p className="text-[14px] text-muted">Prompt này không yêu cầu biến đầu vào nào.</p>
          ) : (
            <div className="grid gap-5">
              {variables.map((v: string) => (
                <div key={v}>
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
                    <span className="font-mono text-primary">{`{{${v}}}`}</span>
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary"
                    placeholder={`Nhập dữ liệu cho ${v}...`}
                    value={inputs[v] || ''}
                    onChange={(e) => setInputs({ ...inputs, [v]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải: Kết quả */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Kết quả từ AI</h2>
            {result && (
              <button
                onClick={copyResult}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            )}
          </div>
          
          <div className="flex-1 rounded-lg border border-border bg-bg p-4 overflow-y-auto">
            {running ? (
              <div className="flex h-full items-center justify-center text-muted text-sm animate-pulse">
                Đang suy nghĩ...
              </div>
            ) : result ? (
              <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-[14px]">
                {result}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted text-sm">
                Bấm &quot;Chạy AI&quot; để xem kết quả
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
