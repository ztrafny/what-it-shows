// Splits a merged ticket into the problems its reports really hold.
// parser and hint come from causes.ts, counted the way the desk counts them. The desk's
// one-day notes are a third problem: a month-first parser swaps day and month and cannot
// move a date by one day. The desk files those reports under their cause, so they count there too.
import { groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

export const PROBLEMS: Record<Problem, string> = {
  parser: 'Day and month swapped: the shared parser reads day-first dates month first',
  hint: 'Day and month swapped: booking-v3 shows a month-first hint to day-first tenants',
  'one-day': 'Date moved by one day, not swapped',
  unplaced: 'No tenant on file',
};

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Where the desk also counts these reports.
  alsoIn: Problem[];
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups: ProblemGroup[] = groupByCause(merged, tenantOf).map((g) => ({
    problem: g.cause,
    reports: g.reports,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
    alsoIn: [],
  }));
  const moved = merged.filter((r) => oneDay.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    groups.push({
      problem: 'one-day',
      reports: moved,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      alsoIn: groups.filter((g) => g.reports.some((r) => oneDay.includes(r.id))).map((g) => g.problem),
    });
  }
  return groups;
}
