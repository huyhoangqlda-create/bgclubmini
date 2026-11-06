import { AppState, Player } from '../types.ts';

const STORAGE_KEY = 'bgclub-minigame-v1';

export function getFreshState(): AppState {
  return {
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

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getFreshState();
    const parsed = JSON.parse(raw);
    return {
      ...getFreshState(),
      ...parsed,
    };
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
