import { describe, expect, it } from 'vitest';
import { splitOpen, agingBuckets, pctChange, monthlySeries, topN, sum2 } from '@/server/modules/dashboard/stats';

const D = (s: string) => new Date(`${s}T00:00:00Z`);

describe('splitOpen', () => {
  it('derives overdue from dueDate < today with balance due', () => {
    const today = D('2026-10-07');
    const r = splitOpen(
      [
        { grandTotal: 100, dueDate: D('2026-10-06') }, // 1 day overdue
        { grandTotal: 200, dueDate: D('2026-10-07') }, // due today → current
        { grandTotal: 300, dueDate: D('2026-11-01') }, // future → current
        { grandTotal: 400, dueDate: null }, // no date → current
      ],
      today,
    );
    expect(r).toEqual({ unpaid: 900, overdue: 100 });
  });
});

describe('agingBuckets', () => {
  it('bands by days overdue, not-yet-due counts as current', () => {
    const today = D('2026-10-07');
    const r = agingBuckets(
      [
        { grandTotal: 10, dueDate: D('2026-10-01') }, // 6d
        { grandTotal: 20, dueDate: D('2026-08-20') }, // 48d
        { grandTotal: 30, dueDate: D('2026-07-20') }, // 79d
        { grandTotal: 40, dueDate: D('2026-06-01') }, // 128d
        { grandTotal: 50, dueDate: D('2026-12-01') }, // future
      ],
      today,
    );
    expect(r).toEqual({ d030: 60, d3160: 20, d6190: 30, d90: 40 });
  });
});

describe('pctChange', () => {
  it('computes rounded change and guards divide-by-zero', () => {
    expect(pctChange(112.4, 100)).toBe(12.4);
    expect(pctChange(90, 100)).toBe(-10);
    expect(pctChange(0, 0)).toBe(0);
    expect(pctChange(50, 0)).toBeNull();
  });
});

describe('monthlySeries', () => {
  it('fills gaps across a year boundary', () => {
    const s = monthlySeries('2026-11', '2027-02', { '2026-12': 5 }, { '2027-01': 7 }, 'en');
    expect(s.map((p) => p.key)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
    expect(s[0]).toMatchObject({ revenue: 0, expenses: 0 });
    expect(s[1]).toMatchObject({ revenue: 5, expenses: 0 });
    expect(s[2]).toMatchObject({ revenue: 0, expenses: 7 });
  });
});

describe('topN', () => {
  it('sorts desc and shares relative to the leader', () => {
    const r = topN([{ amount: 10 }, { amount: 30 }, { amount: 20 }], 2);
    expect(r).toEqual([
      { amount: 30, share: 100 },
      { amount: 20, share: 67 },
    ]);
  });
});

describe('sum2', () => {
  it('avoids float drift (0.1 + 0.2)', () => {
    expect(sum2([{ v: 0.1 }, { v: 0.2 }], (r) => r.v)).toBe(0.3);
  });
});
