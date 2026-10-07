'use client';

/**
 * Dashboard charts on Recharts. RTL mirroring (D-005): time flows right-to-left
 * (latest period on the left), value axis on the right.
 */
import * as React from 'react';
import { useLocale } from 'next-intl';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const C1 = 'var(--chart-1)';
const C3 = 'var(--chart-3)';
const C4 = 'var(--chart-4)';
const C5 = 'var(--chart-5)';
const C7 = 'var(--chart-7)';

function useRtl() {
  return useLocale() === 'ar';
}

function useMoney(): (v: number) => string {
  const locale = useLocale();
  const nf = React.useMemo(
    () =>
      new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );
  return React.useCallback((v: number) => nf.format(v), [nf]);
}

function compactTick(v: number | string): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `${(n / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 })}K`;
  return String(n);
}

function Tip({ active, payload, label, money }: { active?: boolean; payload?: Array<{ name: string; value: number | string; color?: string }>; label?: string; money?: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm shadow-lg" dir="ltr">
      {label ? <span className="font-semibold">{label}</span> : null}
      {payload.map((p) => (
        <span key={p.name} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
          {p.name}: <span className="zw-tnum">{money ? money(Number(p.value)) : p.value}</span>
        </span>
      ))}
    </div>
  );
}

export function RevenueChart({ data, revenueLabel, expensesLabel }: { data: Array<{ label: string; revenue: number; expenses: number }>; revenueLabel: string; expensesLabel: string }) {
  const rtl = useRtl();
  const money = useMoney();
  return (
    <div role="img" aria-label={revenueLabel} style={{ width: '100%', height: 260 }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--border-subtle)' }} reversed={rtl} />
          <YAxis
            tickFormatter={compactTick}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            orientation={rtl ? 'right' : 'left'}
            width={48}
          />
          <Tooltip content={<Tip money={money} />} cursor={{ fill: 'var(--bg-sunken)' }} />
          <Bar dataKey="revenue" name={revenueLabel} fill={C1} radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expenses" name={expensesLabel} fill={C3} radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ slices, centerTop, centerBottom, ariaLabel }: { slices: Array<{ name: string; value: number; color: string }>; centerTop: string; centerBottom: string; ariaLabel: string }) {
  return (
    <div role="img" aria-label={ariaLabel} style={{ position: 'relative', width: '100%', height: 220 }} dir="ltr">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip content={<Tip />} />
          <Pie data={slices} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="85%" paddingAngle={2} strokeWidth={0}>
            {slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="zw-tnum" style={{ fontWeight: 700, fontSize: 20 }}>{centerTop}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{centerBottom}</div>
        </div>
      </div>
    </div>
  );
}

export const DONUT_COLORS = { paid: C1, unpaid: C4, overdue: C5, draft: C7 };

export function CashflowChart({ data, inflowLabel, outflowLabel }: { data: Array<{ label: string; inflow: number; outflow: number }>; inflowLabel: string; outflowLabel: string }) {
  const rtl = useRtl();
  const money = useMoney();
  return (
    <div role="img" aria-label={inflowLabel} style={{ width: '100%', height: 220 }} dir="ltr">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--border-subtle)' }} reversed={rtl} interval={1} />
          <YAxis tickFormatter={compactTick} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} orientation={rtl ? 'right' : 'left'} width={48} />
          <Tooltip content={<Tip money={money} />} cursor={{ stroke: 'var(--border-control)' }} />
          <Area type="monotone" dataKey="inflow" name={inflowLabel} stroke={C1} fill={C1} fillOpacity={0.15} strokeWidth={2} />
          <Area type="monotone" dataKey="outflow" name={outflowLabel} stroke={C3} fill="none" strokeDasharray="5 4" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BranchChart({ data, ariaLabel }: { data: Array<{ name: string; sales: number }>; ariaLabel: string }) {
  const rtl = useRtl();
  return (
    <div role="img" aria-label={ariaLabel} style={{ width: '100%', height: 200 }} dir="ltr">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            orientation={rtl ? 'right' : 'left'}
            width={90}
          />
          <Tooltip content={<Tip />} cursor={{ fill: 'var(--bg-sunken)' }} />
          <Bar dataKey="sales" fill={C1} radius={[0, 4, 4, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
