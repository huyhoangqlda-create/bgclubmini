import { AppState, Player, DEFAULT_BASKETS, DEFAULT_VALID_PAIRS } from '../types.ts';

const STORAGE_KEY = 'bgclub-minigame-v1';

export function getFreshState(): AppState {
  return {
    baskets: DEFAULT_BASKETS.map((b) => ({ ...b })),
    validPairs: [...DEFAULT_VALID_PAIRS],
    players: [],
    courts: 2,
    active: {},
    history: [],
    sameType: true,
    seq: 1,
    tab: 'courts',
    rankF: 'all',
    addG: 'A',
  };
}

export const SAMPLE_PLAYERS: Omit<Player, 'id' | 'turns' | 'last' | 'del'>[] = [
  // 4 Nam A
  { name: 'Hoàng Anh', g: 'A', on: true },
  { name: 'Quốc Đạt', g: 'A', on: true },
  { name: 'Minh Quân', g: 'A', on: true },
  { name: 'Đức Huy', g: 'A', on: true },
  // 4 Nam B
  { name: 'Tuấn Kiệt', g: 'B', on: true },
  { name: 'Bảo Long', g: 'B', on: true },
  { name: 'Văn Nam', g: 'B', on: true },
  { name: 'Thanh Tùng', g: 'B', on: true },
  // 4 Nữ
  { name: 'Mai Linh', g: 'N', on: true },
  { name: 'Thu Thảo', g: 'N', on: true },
  { name: 'Hương Giang', g: 'N', on: true },
  { name: 'Ánh Tuyết', g: 'N', on: true },
];

export function normalizeState(raw: Partial<AppState> | null | undefined): AppState {
  const fresh = getFreshState();
  if (!raw || typeof raw !== 'object') return fresh;

  const baskets =
    Array.isArray(raw.baskets) && raw.baskets.length > 0
      ? raw.baskets
      : fresh.baskets;

  const basketIds = new Set(baskets.map((b) => b.id));

  // If validPairs wasn't saved before (e.g. legacy state), default to DEFAULT_VALID_PAIRS
  const validPairs = Array.isArray(raw.validPairs)
    ? raw.validPairs
    : fresh.validPairs;

  const addG = raw.addG && basketIds.has(raw.addG) ? raw.addG : baskets[0].id;
  const rankF =
    raw.rankF === 'all' || (raw.rankF && basketIds.has(raw.rankF))
      ? raw.rankF
      : 'all';

  return {
    ...fresh,
    ...raw,
    baskets,
    validPairs,
    addG,
    rankF,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getFreshState();
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getFreshState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}
