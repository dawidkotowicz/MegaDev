// Which problem a report in a merged ticket is really about. causes.ts splits reports by tenant and
// channel (`parser` or `hint`); it cannot see a report whose date moved by one day, because that
// report's tenant still points at `parser`. The desk reads those bodies and lists them in
// desk-notes.json (`oneDayMove`). Here those reports count as their own problem, `move`, not as a
// footnote under `parser`.
import notes from '#lib/data/desk-notes.json';
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'move' | 'unplaced';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'move', 'unplaced'];

export function problemOf(r: Report, t: Tenant | undefined): Problem {
  if (notes.oneDayMove.includes(r.id)) return 'move';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  taggedAs: Record<string, number>;
  tenants: string[];
  firstSeen: string;
  lastSeen: string;
};

// Every report merged into `ticket`, once each, grouped by the problem it is about. Largest first.
export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined) {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const byProblem = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  const groups: ProblemGroup[] = [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  // Reports intake tagged differently from the problem they are filed under.
  const mistagged = merged.filter((r) => {
    const p = problemOf(r, tenantOf(r));
    return (p === 'parser' || p === 'hint') && r.meta.intakeTag !== p;
  }).length;
  return { merged, groups, mistagged, exportRows: all.length };
}
