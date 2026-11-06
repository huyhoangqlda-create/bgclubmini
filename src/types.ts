export type GroupType = 'A' | 'B' | 'N';

export interface Player {
  id: number;
  name: string;
  g: GroupType; // 'A' = Nam A, 'B' = Nam B, 'N' = Nữ
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

export const GROUP_LABELS: Record<GroupType, string> = {
  A: 'Nam A',
  B: 'Nam B',
  N: 'Nữ',
};

export const GROUP_ORDER: Record<GroupType, number> = {
  A: 0,
  B: 1,
  N: 2,
};
