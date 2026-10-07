'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Alert, Badge, Button, Icon, Logo, Progress, Stepper, Timeline } from '@/components/zw';
import { finalizeWorkspace } from '@/server/actions/onboarding.actions';
import { StepAccount } from './StepAccount';
import { StepBusiness } from './StepBusiness';
import { StepAddress } from './StepAddress';
import { StepBranding } from './StepBranding';
import { StepTax } from './StepTax';

export interface BusinessData {
  nameAr?: string;
  nameEn?: string | null;
  legalName?: string | null;
  crNumber?: string | null;
  vatNumber?: string | null;
  tin?: string | null;
  businessType?: string | null;
  industry?: string | null;
  employeesRange?: string | null;
  invoiceVolume?: string | null;
}

export interface AddressData {
  country?: string | null;
  city?: string | null;
  district?: string | null;
  street?: string | null;
  buildingNo?: string | null;
  postalCode?: string | null;
  additionalNo?: string | null;
  shortAddress?: string | null;
}

export interface OnboardingInitial {
  user: { name: string; email: string; emailVerified: boolean; phone: string | null; phoneVerified: boolean };
  org: {
    id: string;
    nameAr: string;
    business: BusinessData;
    address: AddressData | null;
    brandColor: string | null;
    invoiceTemplate: string;
    vatStatus: string;
    currency: string;
    fiscalYearStartMonth: number;
    seqPrefix: string | null;
    seqStart: number | null;
  } | null;
  step: number;
}

const STEP_KEYS = ['account', 'business', 'address', 'branding', 'tax', 'workspace'] as const;

export function OnboardingWizard({ initial }: { initial: OnboardingInitial }) {
  const t = useTranslations();
  const locale = useLocale();
  const [step, setStep] = useState(Math.min(Math.max(initial.step, 0), 5));
  const [pending, setPending] = useState(false);
  const [orgName, setOrgName] = useState(initial.org?.nameAr ?? initial.user.name);
  const [vatNumber, setVatNumber] = useState(initial.org?.business.vatNumber ?? null);
  const [phoneVerified, setPhoneVerified] = useState(initial.user.phoneVerified);
  const [welcomed, setWelcomed] = useState(false);

  const steps = STEP_KEYS.map((k) => ({
    label: t(`onboarding.steps.${k}` as 'onboarding.steps.account'),
    description: t(`onboarding.steps.${k}Desc` as 'onboarding.steps.accountDesc'),
  }));
  const stepNames = ['Account', 'Business', 'Address', 'Branding', 'Tax', 'Workspace'];
  const isFormStep = step < 5;

  // Shell Continue submits the visible step form; forms call onNext when their save succeeds.
  function submitCurrent() {
    setPending(true);
    const form = document.getElementById('ob-form') as HTMLFormElement | null;
    if (form) {
      form.requestSubmit();
      setTimeout(() => setPending(false), 4000);
    } else {
      setPending(false);
    }
  }

  function next() {
    setPending(false);
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0 });
  }

  const orgDisplay = locale === 'ar' ? orgName : orgName;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="flex flex-col gap-10 border-b border-border-subtle bg-sunken px-8 py-8 lg:w-[380px] lg:flex-none lg:border-b-0 lg:border-e">
        <Logo size={28} />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-fg-muted">{t('onboarding.settingUp')}</span>
          <span className="text-lg font-semibold">{orgDisplay}</span>
        </div>
        <Stepper orientation="vertical" steps={steps} current={welcomed ? 6 : step} />
        <div className="mt-auto flex items-start gap-2.5 text-sm text-fg-muted">
          <span className="inline-flex pt-0.5 text-fg-brand">
            <Icon name="lock" size={16} />
          </span>
          {t('onboarding.privateNote')}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-8 px-4 py-10 sm:px-8 lg:px-14">
        {!welcomed ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm font-semibold text-fg-muted">
                {step < 5 ? `${t('onboarding.stepOf', { a: step + 1 })} · ${stepNames[step]}` : `${t('onboarding.stepOf', { a: 6 })} · Workspace`}
              </span>
              <span className="flex items-center gap-2 text-sm text-fg-muted">
                <Icon name="circle-check" size={16} />
                {t('onboarding.autosaved')}
              </span>
            </div>
            <div className="w-full max-w-3xl">
              {step === 0 ? (
                <StepAccount
                  initialName={initial.user.name}
                  email={initial.user.email}
                  emailVerified={initial.user.emailVerified}
                  initialPhone={initial.user.phone}
                  phoneVerified={phoneVerified}
                  onVerifiedPhone={() => setPhoneVerified(true)}
                  onNext={next}
                />
              ) : null}
              {step === 1 ? (
                <StepBusiness
                  initial={initial.org?.business ?? {}}
                  onNext={(saved) => {
                    setVatNumber(saved.vatNumber);
                    setOrgName(saved.orgName);
                    next();
                  }}
                />
              ) : null}
              {step === 2 ? <StepAddress initial={initial.org?.address ?? null} onNext={next} /> : null}
              {step === 3 ? (
                <StepBranding
                  initialColor={initial.org?.brandColor ?? null}
                  initialTemplate={initial.org?.invoiceTemplate ?? 'Modern'}
                  onNext={next}
                />
              ) : null}
              {step === 4 ? (
                <StepTax
                  initial={{
                    vatStatus: initial.org?.vatStatus ?? 'reg',
                    currency: initial.org?.currency ?? 'SAR',
                    fiscalYearStartMonth: initial.org?.fiscalYearStartMonth ?? 1,
                    seqPrefix: initial.org?.seqPrefix ?? null,
                    seqStart: initial.org?.seqStart ?? null,
                  }}
                  vatNumber={vatNumber ?? initial.org?.business.vatNumber ?? null}
                  onNext={next}
                />
              ) : null}
              {step === 5 ? <StepWorkspace onDone={() => setWelcomed(true)} /> : null}
            </div>
            {isFormStep ? (
              <div className="flex max-w-3xl items-center justify-between gap-3 border-t border-border-subtle pt-6">
                <Button variant="ghost" size="lg" iconStart="arrow-left" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                  {t('onboarding.back')}
                </Button>
                <Button size="lg" iconEnd="arrow-right" loading={pending} onClick={submitCurrent}>
                  {step === 4 ? t('onboarding.createWorkspace') : t('onboarding.continue')}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <StepWelcome orgName={orgDisplay} vatDone={!!(vatNumber ?? initial.org?.business.vatNumber)} />
        )}
      </main>
    </div>
  );
}

function StepWorkspace({ onDone }: { onDone: () => void }) {
  const t = useTranslations();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fired = useRef(false);

  const defs = [
    t('onboarding.steps.businessDesc'),
    t('onboarding.steps.addressDesc'),
    t('onboarding.steps.taxDesc'),
    t('onboarding.steps.brandingDesc'),
    t('onboarding.template'),
    t('onboarding.preparing'),
  ];
  const marks = [0, 20, 40, 60, 75, 90];

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    let p = 0;
    setBusy(true);
    const run = finalizeWorkspace().then((res) => {
      setBusy(false);
      if (!res.ok) {
        setError(res.error);
        return false;
      }
      return true;
    });
    const timer = setInterval(() => {
      p = Math.min(100, p + 7);
      setProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        run.then((ok) => {
          if (ok) setTimeout(onDone, 700);
        });
      }
    }, 260);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tasks = defs.map((title, i) => {
    const next = i + 1 < marks.length ? (marks[i + 1] as number) : 100;
    const at = marks[i] as number;
    const done = progress >= next;
    const cur = !done && progress >= at;
    return {
      id: `t${i}`,
      title,
      icon: done ? 'check' : cur ? 'refresh-cw' : 'clock',
      tone: (done ? 'success' : cur ? 'info' : 'neutral') as 'success' | 'info' | 'neutral',
      state: (done || cur ? undefined : 'pending') as undefined | 'pending',
      time: done ? t('onboarding.done') : cur ? t('onboarding.inProgress') : '',
    };
  });

  return (
    <div className="flex flex-col items-start gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t('onboarding.s6Title')}</h1>
        <p className="text-fg-muted">{t('onboarding.s6Desc')}</p>
      </div>
      {error ? <Alert tone="danger">{t(error as 'validation.required')}</Alert> : null}
      <div className="flex w-full flex-col gap-2.5">
        <Progress value={progress} size="lg" />
        <span className="text-sm tabular-nums text-fg-muted">{progress}%</span>
      </div>
      <div className="w-full rounded-lg border border-border-subtle bg-surface p-6">
        <Timeline items={tasks} compact />
      </div>
      {error && !busy ? (
        <Button
          onClick={() => {
            fired.current = false;
            setError(null);
            setProgress(0);
          }}
        >
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  );
}

function StepWelcome({ orgName, vatDone }: { orgName: string; vatDone: boolean }) {
  const t = useTranslations();
  const doneItems = [true, vatDone, true];
  const done = doneItems.filter(Boolean).length;
  const total = 8;
  const todoKeys = ['profile', 'vat', 'settings'] as const;
  const pending: Array<{ key: string; href?: string }> = [
    { key: 'customer' },
    { key: 'product' },
    { key: 'invoice' },
    { key: 'invite', href: '/settings/users' },
    { key: 'device' },
  ];

  return (
    <div className="flex w-full max-w-3xl flex-col gap-7">
      <div className="flex flex-wrap items-center gap-5">
        <Logo variant="mark" size={56} />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h1">{t('onboarding.welcome')}</h1>
          <p className="text-fg-muted">
            {t('onboarding.welcomeDesc')} ({orgName})
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-base font-semibold">{t('onboarding.checklist')}</span>
          <span className="text-sm font-semibold text-fg-brand">{t('onboarding.ofComplete', { a: done, b: total })}</span>
        </div>
        <Progress value={(done / total) * 100} />
        <div className="flex flex-col">
          {todoKeys.map((k) => (
            <div key={k} className="flex items-center gap-3 border-b border-border-subtle py-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
              <span className="flex-1 text-sm text-fg-muted line-through">
                {t(`onboarding.check.${k}` as 'onboarding.check.profile')}
              </span>
            </div>
          ))}
          {pending.map((c) => (
            <div key={c.key} className="flex items-center gap-3 border-b border-border-subtle py-3">
              <span className="grid h-6 w-6 place-items-center rounded-full border-[1.5px] border-border-control" />
              <span className="flex-1 text-sm">{t(`onboarding.check.${c.key}` as 'onboarding.check.profile')}</span>
              {c.href ? (
                <Link href={c.href}>
                  <Button variant="secondary" size="sm" iconEnd="arrow-right">
                    {t(`onboarding.check.${c.key}` as 'onboarding.check.profile')}
                  </Button>
                </Link>
              ) : (
                <Badge tone="neutral">{t('onboarding.soon')}</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/">
          <Button size="lg">{t('onboarding.goDashboard')}</Button>
        </Link>
        <Button size="lg" variant="secondary" disabled title={t('onboarding.soon')}>
          {t('onboarding.createFirstInvoice')}
        </Button>
      </div>
    </div>
  );
}
