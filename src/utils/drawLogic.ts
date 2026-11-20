import { Player, ActiveMatch, HistoryMatch, Basket } from '../types.ts';

export const pk = (a: number, b: number): string => (a < b ? `${a}-${b}` : `${b}-${a}`);

export const getPairKey = (g1: string, g2: string): string =>
  g1 < g2 ? `${g1}|${g2}` : `${g2}|${g1}`;

export function getAllPossiblePairs(
  baskets: Basket[]
): { key: string; b1: Basket; b2: Basket }[] {
  const list: { key: string; b1: Basket; b2: Basket }[] = [];
  for (let i = 0; i < baskets.length; i++) {
    for (let j = i; j < baskets.length; j++) {
      const b1 = baskets[i];
      const b2 = baskets[j];
      list.push({
        key: getPairKey(b1.id, b2.id),
        b1,
        b2,
      });
    }
  }
  return list;
}

export function getBasketById(baskets: Basket[], id: string): Basket | undefined {
  return baskets.find((b) => b.id === id);
}

export function getBasketName(baskets: Basket[], id: string): string {
  return getBasketById(baskets, id)?.name || id;
}

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

/**
 * Kiểm tra đội hợp lệ dựa theo danh sách cặp hợp lệ được cấu hình trong Cài đặt
 */
export function isValidTeam(t: [Player, Player], validPairs: string[]): boolean {
  const key = getPairKey(t[0].g, t[1].g);
  return validPairs.includes(key);
}

export function getTeamCategory(
  t: [Player, Player],
  baskets: Basket[]
): 'MM' | 'MF' | 'FF' {
  const g1 = getBasketById(baskets, t[0].g)?.gender ?? (t[0].g === 'N' ? 'female' : 'male');
  const g2 = getBasketById(baskets, t[1].g)?.gender ?? (t[1].g === 'N' ? 'female' : 'male');
  if (g1 === 'male' && g2 === 'male') return 'MM';
  if (g1 === 'female' && g2 === 'female') return 'FF';
  return 'MF';
}

export function getTeamTypeLabel(
  p1: Player | undefined,
  p2: Player | undefined,
  baskets: Basket[]
): string {
  if (!p1 || !p2) return 'Chưa đủ người';
  const b1 = getBasketById(baskets, p1.g);
  const b2 = getBasketById(baskets, p2.g);
  const n1 = b1?.name || p1.g;
  const n2 = b2?.name || p2.g;
  const idx1 = baskets.findIndex((b) => b.id === p1.g);
  const idx2 = baskets.findIndex((b) => b.id === p2.g);
  if (idx1 !== -1 && idx2 !== -1 && idx1 > idx2) {
    return `${n2} + ${n1}`;
  }
  return `${n1} + ${n2}`;
}

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

const SPLITS: [[number, number], [number, number]][] = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

export interface FindMatchResult {
  t1?: [number, number];
  t2?: [number, number];
  err?: string;
}

/**
 * Thuật toán bốc thăm:
 * - Chỉ tính những người đang chờ (idle players).
 * - Không tính thời gian chờ (không dùng p.last).
 * - Ưu tiên người có số lượt đã đánh (p.turns) ít nhất, bốc ngẫu nhiên công bằng giữa những người cùng số lượt.
 * - Kiểm tra cặp hợp lệ theo danh sách `validPairs` từ Cài đặt.
 */
export function findMatch(
  players: Player[],
  active: Record<number, ActiveMatch>,
  history: HistoryMatch[],
  sameType: boolean,
  baskets: Basket[],
  validPairs: string[]
): FindMatchResult {
  if (!validPairs.length) {
    return { err: 'Chưa có cặp hợp lệ nào được bật. Hãy vào Cài đặt để chọn ít nhất 1 cặp hợp lệ.' };
  }

  // Chỉ tính những người đang chờ (không bận trên sân)
  const idle = getIdlePlayers(players, active);

  // Chỉ sắp xếp theo số lượt đã đánh (turns) và ngẫu nhiên (r). KHÔNG tính thời gian chờ.
  const sorted = idle
    .map((p) => ({ p, r: Math.random() }))
    .sort((x, y) => x.p.turns - y.p.turns || x.r - y.r)
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
            if (isValidTeam(a, validPairs) && isValidTeam(b, validPairs)) {
              valid.push([a, b]);
            }
          }

          if (!valid.length) continue;

          // Cùng loại đối đầu (Đôi Nam vs Đôi Nam, Đôi Nam Nữ vs Đôi Nam Nữ, Đôi Nữ vs Đôi Nữ)
          const same = valid.filter(
            ([a, b]) => getTeamCategory(a, baskets) === getTeamCategory(b, baskets)
          );
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
    const countsSummary = baskets
      .map((b) => {
        const cnt = sorted.filter((p) => p.g === b.id).length;
        return `${cnt} ${b.name}`;
      })
      .join(', ');
    return {
      err: `Người đang chờ không ghép được trận hợp lệ theo cài đặt hiện tại (đang chờ: ${countsSummary}). Bạn có thể điều chỉnh "Cặp hợp lệ" trong Cài đặt hoặc bấm Ghép thủ công.`,
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

  if (Math.random() < 0.5) {
    pick.reverse();
  }

  const basketOrder = (id: string) => {
    const idx = baskets.findIndex((b) => b.id === id);
    return idx === -1 ? 999 : idx;
  };

  const sortTeam = (t: [Player, Player]): [number, number] => {
    const cloned = [...t].sort((x, y) => basketOrder(x.g) - basketOrder(y.g));
    return [cloned[0].id, cloned[1].id];
  };

  return {
    t1: sortTeam(pick[0]),
    t2: sortTeam(pick[1]),
  };
}
