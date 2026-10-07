'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert, Icon } from '@/components/zw';
import { saveBranding } from '@/server/actions/onboarding.actions';

const SWATCHES: Array<{ hex: string; label: string }> = [
  { hex: '#0e6a50', label: 'Palm green' },
  { hex: '#1d58b8', label: 'Royal blue' },
  { hex: '#7a5512', label: 'Bronze' },
  { hex: '#7d3c98', label: 'Plum' },
  { hex: '#a3231b', label: 'Crimson' },
  { hex: '#0f1a16', label: 'Ink' },
];

const TEMPLATES = ['Modern', 'Classic', 'Minimal', 'Corporate'];

export function StepBranding({
  initialColor,
  initialTemplate,
  onNext,
}: {
  initialColor: string | null;
  initialTemplate: string;
  onNext: () => void;
}) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState(initialColor ?? '#0e6a50');
  const [template, setTemplate] = useState(TEMPLATES.includes(initialTemplate) ? initialTemplate : 'Modern');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await saveBranding({ brandColor: color, invoiceTemplate: template });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onNext();
  }

  return (
    <form id="ob-form" onSubmit={submit} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t('onboarding.s4Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s4Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{t('onboarding.brandColor')}</span>
        <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t('onboarding.brandColor')}>
          {SWATCHES.map((s) => {
            const on = s.hex.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={s.hex}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={s.label}
                title={`${s.label} · ${s.hex}`}
                onClick={() => setColor(s.hex)}
                className="h-10 w-10 rounded-md"
                style={{
                  background: s.hex,
                  boxShadow: on
                    ? '0 0 0 2px var(--bg-canvas), 0 0 0 4px var(--border-focus)'
                    : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                }}
              />
            );
          })}
        </div>
        <span className="text-xs text-fg-muted">
          {t('onboarding.brandColorHint')} <span className="zw-mono" dir="ltr">{color}</span>
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <span className="text-sm font-medium">{t('onboarding.template')}</span>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4" role="radiogroup" aria-label={t('onboarding.template')}>
          {TEMPLATES.map((name) => {
            const on = name === template;
            return (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTemplate(name)}
                className="flex flex-col gap-2.5 rounded-lg border bg-surface p-3 text-start"
                style={{ borderColor: on ? 'var(--brand-600)' : undefined, borderWidth: on ? 2 : undefined }}
              >
                <span className="flex h-32 flex-col gap-1.5 rounded bg-white p-3 shadow-[inset_0_0_0_1px_var(--border-subtle)]">
                  <span className="h-4 rounded-sm" style={{ background: color }} />
                  <span className="h-1.5 w-3/5 rounded-sm bg-slate-300" />
                  <span className="h-1.5 w-2/5 rounded-sm bg-slate-200" />
                  <span
                    className="flex-1 rounded-sm"
                    style={{ borderTop: `2px solid ${color}`, background: 'repeating-linear-gradient(#fff 0 9px, #eef1ed 9px 10px)' }}
                  />
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {on ? <Icon name="circle-check" size={14} /> : null}
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}
