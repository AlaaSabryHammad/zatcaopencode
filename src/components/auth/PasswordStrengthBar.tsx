'use client';

import { Progress } from '@/components/zw';
import { passwordStrength } from '@/lib/password';
import { useTranslations } from 'next-intl';

export function PasswordStrengthBar({ password }: { password: string }) {
  const t = useTranslations();
  const s = passwordStrength(password);
  if (!password) return null;
  const tone = s.level === 'strong' ? 'success' : s.level === 'fair' ? 'brand' : 'danger';
  return (
    <div className="flex flex-col gap-1">
      <Progress value={s.score} tone={tone} />
      {!s.meetsPolicy ? <p className="text-sm text-fg-muted">{t('validation.passwordWeak')}</p> : null}
    </div>
  );
}
