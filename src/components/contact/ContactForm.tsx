'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { CONTACT_EMAIL } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'error'; message: string }
  | { kind: 'delivered' }
  | { kind: 'fallback'; mailto: string };

const field =
  'w-full rounded-[10px] border border-border bg-black/[0.02] px-[15px] py-[13px] text-[15px] text-ink transition-colors placeholder:text-muted focus:border-primary focus:bg-primary/[0.07] focus:outline-none';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const { t, mounted } = useLanguage();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mounted) return;

    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? '').trim(),
      company: String(data.get('company') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setStatus({
        kind: 'error',
        message: t.contact.form.errorEmpty,
      });
      return;
    }

    setStatus({ kind: 'sending' });

    const buildMailto = () => {
      const subject = encodeURIComponent(`Project request — ${payload.name}`);
      const body = encodeURIComponent(
        `Name: ${payload.name}\nCompany: ${payload.company || '—'}\nEmail: ${payload.email}\n\nProcess to improve:\n${payload.message}`,
      );
      return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.delivered) {
        setStatus({ kind: 'delivered' });
        event.currentTarget.reset();
      } else {
        setStatus({ kind: 'fallback', mailto: buildMailto() });
      }
    } catch {
      setStatus({ kind: 'fallback', mailto: buildMailto() });
    }
  }

  if (!mounted) return null;

  if (status.kind === 'delivered') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={32} />
        </div>
        <b className="mb-2 block text-xl">{t.contact.form.delivered}</b>
        <button
          onClick={() => setStatus({ kind: 'idle' })}
          className="mt-6 text-[13px] font-semibold text-primary hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  if (status.kind === 'fallback') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <b className="mb-3 block text-lg">Hệ thống gửi mail đang gặp sự cố.</b>
        <p className="mb-6 text-[14.5px] text-dark-muted">
          Vui lòng gửi yêu cầu trực tiếp qua email của chúng tôi bằng nút bên dưới.
        </p>
        <a
          href={status.mailto}
          className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-6 text-[15px] font-bold text-white transition-colors hover:bg-primary-hover"
        >
          Gửi qua ứng dụng Email
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3.5">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-[7px] block text-[12.5px] font-semibold text-[#C6CBD4]">
            {t.contact.form.name}
          </label>
          <input id="name" name="name" className={field} placeholder={t.contact.form.namePlaceholder} />
        </div>
        <div>
          <label htmlFor="company" className="mb-[7px] block text-[12.5px] font-semibold text-[#C6CBD4]">
            {t.contact.form.company}
          </label>
          <input id="company" name="company" className={field} placeholder={t.contact.form.companyPlaceholder} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-[7px] block text-[12.5px] font-semibold text-[#C6CBD4]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={field}
          placeholder={t.contact.form.emailPlaceholder}
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-[7px] block text-[12.5px] font-semibold text-[#C6CBD4]">
          {t.contact.form.message}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={cn(field, 'resize-none')}
          placeholder={t.contact.form.messagePlaceholder}
        />
      </div>

      {status.kind === 'error' && (
        <div className="rounded-[10px] border border-danger/30 bg-danger/10 px-4 py-3 text-[13.5px] text-danger">
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="mt-1.5 flex h-[46px] items-center justify-center gap-2 rounded-[10px] bg-primary text-[15px] font-bold text-white transition-colors hover:bg-primary-hover disabled:pointer-events-none disabled:opacity-60"
      >
        {status.kind === 'sending' ? (
          t.contact.form.sendingBtn
        ) : (
          <>
            {t.contact.form.submitBtn} <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}

// Ensure you have a cn utility, if not, copy it from your utils
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
