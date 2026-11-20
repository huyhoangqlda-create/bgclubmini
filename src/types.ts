export type BasketGender = 'male' | 'female';

export type GroupType = string;

export interface Basket {
  id: string;
  name: string;
  shortLabel: string;
  gender: BasketGender;
  color: string;
}

export interface Player {
  id: number;
  name: string;
  g: GroupType; // Basket id, e.g., 'A', 'B', 'N', or custom basket id
  on: boolean;  // Có mặt hay vắng mặt/nghỉ
  turns: number; // Số lượt đã ra sân
  last: number;  // Timestamp trận đấu gần nhất kết thúc
  del: boolean;  // Đánh dấu đã xóa nếu đã có lịch sử trận đấu
  isNew?: boolean;
}

export interface ActiveMatch {
  id: number;
  court: number; // 0-indexed
  t1: [number, number]; // [PlayerId, PlayerId]
  t2: [number, number]; // [PlayerId, PlayerId]
  at: number; // timestamp bắt đầu
  d1: string; // Điểm đội 1 (nhập dở)
  d2: string; // Điểm đội 2 (nhập dở)
}

export interface HistoryMatch {
  id: number;
  court: number;
  t1: [number, number];
  t2: [number, number];
  s1: number;
  s2: number;
  at: number;
  end: number;
}

export type TabType = 'courts' | 'players' | 'rank' | 'history';

export interface AppState {
  baskets: Basket[];
  validPairs: string[]; // Canonical pair keys e.g. 'A|A', 'A|B', 'A|N'
  players: Player[];
  courts: number;
  active: Record<number, ActiveMatch>;
  history: HistoryMatch[];
  sameType: boolean;
  seq: number;
  tab: TabType;
  rankF: 'all' | GroupType;
  addG: GroupType;
}

export interface PlayerStats {
  w: number;
  l: number;
  pf: number; // Points for (ghi được)
  pa: number; // Points against (bị ghi)
}

export const DEFAULT_BASKETS: Basket[] = [
  { id: 'A', name: 'Nam A', shortLabel: 'A', gender: 'male', color: '#1f3a5f' },
  { id: 'B', name: 'Nam B', shortLabel: 'B', gender: 'male', color: '#3f7ab8' },
  { id: 'N', name: 'Nữ', shortLabel: 'Nữ', gender: 'female', color: '#c0567a' },
];

export const DEFAULT_VALID_PAIRS: string[] = [
  'A|A',
  'A|B',
  'A|N',
  'B|B',
  'B|N',
  'N|N',
];
