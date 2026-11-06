import React from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { HistoryMatch, Player } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';

interface HistoryTabProps {
  history: HistoryMatch[];
  players: Player[];
  onDeleteMatch: (id: number) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  history,
  players,
  onDeleteMatch,
}) => {
  const getPlayer = (id: number): Player | undefined => players.find((p) => p.id === id);

  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const renderTeam = (ids: [number, number], isWinner: boolean) => {
    const p1 = getPlayer(ids[0]);
    const p2 = getPlayer(ids[1]);

    return (
      <div className={`space-y-1 ${isWinner ? 'font-extrabold text-[#14233a]' : 'text-[#5b6676]'}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {p1 && <GroupBadge g={p1.g} className="text-[10px] min-w-4 h-4" />}
          <span className="truncate text-xs sm:text-sm">{p1?.name || '(Đã xóa)'}</span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          {p2 && <GroupBadge g={p2.g} className="text-[10px] min-w-4 h-4" />}
          <span className="truncate text-xs sm:text-sm">{p2?.name || '(Đã xóa)'}</span>
        </div>
      </div>
    );
  };

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-[#e3e0d8] space-y-2">
        <HistoryIcon className="w-10 h-10 text-[#5b6676]/40 mx-auto" />
        <h4 className="font-bold text-[#14233a]">Chưa có lịch sử trận đấu</h4>
        <p className="text-xs text-[#5b6676]">
          Các trận đấu sau khi bấm <b>Lưu kết quả</b> sẽ được lưu trữ và hiển thị tại đây.
        </p>
      </div>
    );
  }

  // List in reverse order (latest first)
  const reversed = history.map((h, originalIndex) => ({ h, originalIndex })).reverse();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#5b6676]">
          {history.length} trận đã hoàn thành
        </h2>
      </div>

      <div className="space-y-2.5">
        {reversed.map(({ h, originalIndex }) => {
          const isW1 = h.s1 > h.s2;

          return (
            <div
              key={h.id}
              className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#e3e0d8] space-y-2.5 hover:border-[#c9a44c]/50 transition-colors"
            >
              {/* Meta header */}
              <div className="flex items-center justify-between text-xs text-[#5b6676]">
                <span className="font-medium">
                  Trận {originalIndex + 1} · Sân {h.court + 1} · {formatTime(h.at)} – {formatTime(h.end)}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteMatch(h.id)}
                  className="p-1 hover:bg-[#fbeceb] rounded-lg text-[#5b6676] hover:text-[#c2453b] transition-colors"
                  aria-label="Xóa trận này"
                  title="Xóa kết quả trận đấu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Matchup & Score */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 pt-1">
                {/* Team 1 */}
                <div className="min-w-0">{renderTeam(h.t1, isW1)}</div>

                {/* Score */}
                <div className="font-extrabold text-base sm:text-lg font-mono tabular-nums px-2 py-1 rounded-lg bg-[#f7f6f2] flex items-center gap-1.5 shrink-0">
                  <span className={isW1 ? 'text-[#14233a] font-black' : 'text-[#5b6676]'}>
                    {h.s1}
                  </span>
                  <span className="text-[#5b6676] font-normal">–</span>
                  <span className={!isW1 ? 'text-[#14233a] font-black' : 'text-[#5b6676]'}>
                    {h.s2}
                  </span>
                </div>

                {/* Team 2 */}
                <div className="min-w-0 text-right">
                  <div className={`space-y-1 ${!isW1 ? 'font-extrabold text-[#14233a]' : 'text-[#5b6676]'}`}>
                    <div className="flex items-center justify-end gap-1.5 min-w-0">
                      <span className="truncate text-xs sm:text-sm">
                        {getPlayer(h.t2[0])?.name || '(Đã xóa)'}
                      </span>
                      {getPlayer(h.t2[0]) && (
                        <GroupBadge g={getPlayer(h.t2[0])!.g} className="text-[10px] min-w-4 h-4" />
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 min-w-0">
                      <span className="truncate text-xs sm:text-sm">
                        {getPlayer(h.t2[1])?.name || '(Đã xóa)'}
                      </span>
                      {getPlayer(h.t2[1]) && (
                        <GroupBadge g={getPlayer(h.t2[1])!.g} className="text-[10px] min-w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
