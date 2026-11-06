import { Player, ActiveMatch, HistoryMatch, GROUP_ORDER } from '../types.ts';

export const pk = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

export function getBusySet(active: Record<number, ActiveMatch>): Set<number> {
  const set = new Set<number>();
  Object.values(active).forEach((m) => {
    m.t1.forEach((id) => set.add(id));
    m.t2.forEach((id) => set.add(id));
  });
  return set;
}

export function getPresentPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.on && !p.del);
}

export function getIdlePlayers(players: Player[], active: Record<number, ActiveMatch>): Player[] {
  const busy = getBusySet(active);
  return getPresentPlayers(players).filter((p) => !busy.has(p.id));
}

export function getMinTurns(players: Player[], excludeId?: number): number {
  const present = getPresentPlayers(players).filter((p) => p.id !== excludeId);
  return present.length ? Math.min(...present.map((p) => p.turns)) : 0;
}

export function isValidTeam(t: [Player, Player]): boolean {
  const a = t[0].g;
  const b = t[1].g;
  // Two females on same team is invalid
  if (a === 'N' && b === 'N') return false;
  // If neither is female, they cannot be of the same level (must be A + B)
  if (a !== 'N' && b !== 'N') return a !== b;
  // One male and one female is valid
  return true;
}

export const hasFemale = (t: [Player, Player]): boolean => t[0].g === 'N' || t[1].g === 'N';

export function getPairStats(history: HistoryMatch[], active: Record<number, ActiveMatch>) {
  const part: Record<string, number> = {};
  const opp: Record<string, number> = {};

  const add = (obj: Record<string, number>, a: number, b: number) => {
    const k = pk(a, b);
    obj[k] = (obj[k] || 0) + 1;
  };

  const allMatches = [...history, ...Object.values(active)];
  allMatches.forEach((m) => {
    add(part, m.t1[0], m.t1[1]);
    add(part, m.t2[0], m.t2[1]);
    m.t1.forEach((a) => {
      m.t2.forEach((b) => {
        add(opp, a, b);
      });
    });
  });

  return { part, opp };
}

const SPLITS: [ [number, number], [number, number] ][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

export interface FindMatchResult {
  t1?: [number, number];
  t2?: [number, number];
  err?: string;
}

export function findMatch(
  players: Player[],
  active: Record<number, ActiveMatch>,
  history: HistoryMatch[],
  sameType: boolean
): FindMatchResult {
  const idle = getIdlePlayers(players, active);
  
  // Sort by least turns played, then longest wait time since last match, then random
  const sorted = idle
    .map((p) => ({ p, r: Math.random() }))
    .sort((x, y) => x.p.turns - y.p.turns || x.p.last - y.p.last || x.r - y.r)
    .slice(0, 32)
    .map((x) => x.p);

  const n = sorted.length;
  if (n < 4) {
    return { err: `Cần ít nhất 4 người đang chờ (hiện có ${n} người).` };
  }

  interface CandidateSplit {
    sumT: number;
    cross: number;
    rc: number;
    splits: [[Player, Player], [Player, Player]][];
  }

  let best: CandidateSplit | null = null;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          const four: [Player, Player, Player, Player] = [sorted[i], sorted[j], sorted[k], sorted[l]];
          const valid: [[Player, Player], [Player, Player]][] = [];

          for (const s of SPLITS) {
            const a: [Player, Player] = [four[s[0][0]], four[s[0][1]]];
            const b: [Player, Player] = [four[s[1][0]], four[s[1][1]]];
            if (isValidTeam(a) && isValidTeam(b)) {
              valid.push([a, b]);
            }
          }

          if (!valid.length) continue;

          // Check if same type matchup (both have N or neither has N)
          const same = valid.filter(([a, b]) => hasFemale(a) === hasFemale(b));
          const cross = sameType && !same.length ? 1 : 0;
          const sumT = four[0].turns + four[1].turns + four[2].turns + four[3].turns;
          const rc = 2 ** i + 2 ** j + 2 ** k + 2 ** l;

          if (
            !best ||
            sumT < best.sumT ||
            (sumT === best.sumT && (cross < best.cross || (cross === best.cross && rc < best.rc)))
          ) {
            best = {
              sumT,
              cross,
              rc,
              splits: sameType && same.length ? same : valid,
            };
          }
        }
      }
    }
  }

  if (!best || !best.splits.length) {
    const counts = { A: 0, B: 0, N: 0 };
    sorted.forEach((p) => counts[p.g]++);
    return {
      err: `Người đang chờ không ghép được trận hợp lệ (hiện có: ${counts.A} Nam A, ${counts.B} Nam B, ${counts.N} Nữ). Mỗi đội phải là (Nam A + Nam B) hoặc (Nam + Nữ).`,
    };
  }

  const { part, opp } = getPairStats(history, active);
  let pick: [[Player, Player], [Player, Player]] | null = null;
  let minScore = Infinity;

  for (const [a, b] of best.splits) {
    let score = ((part[pk(a[0].id, a[1].id)] || 0) + (part[pk(b[0].id, b[1].id)] || 0)) * 10;
    a.forEach((x) => {
      b.forEach((y) => {
        score += opp[pk(x.id, y.id)] || 0;
      });
    });
    score += Math.random() * 0.5;

    if (score < minScore) {
      minScore = score;
      pick = [a, b];
    }
  }

  if (!pick) {
    pick = best.splits[0];
  }

  // Randomly assign sides
  if (Math.random() < 0.5) {
    pick.reverse();
  }

  const sortTeam = (t: [Player, Player]): [number, number] => {
    const cloned = [...t].sort((x, y) => GROUP_ORDER[x.g] - GROUP_ORDER[y.g]);
    return [cloned[0].id, cloned[1].id];
  };

  return {
    t1: sortTeam(pick[0]),
    t2: sortTeam(pick[1]),
  };
}
