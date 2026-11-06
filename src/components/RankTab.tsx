import React, { useState } from 'react';
import { Trophy, Copy, Check, Share2 } from 'lucide-react';
import { Player, HistoryMatch, GroupType, GROUP_LABELS } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';

interface RankTabProps {
  players: Player[];
  history: HistoryMatch[];
  filter: 'all' | GroupType;
  onFilterChange: (f: 'all' | GroupType) => void;
  onToast: (msg: string) => void;
}

export const RankTab: React.FC<RankTabProps> = ({
  players,
  history,
  filter,
  onFilterChange,
  onToast,
}) => {
  const [showCopyArea, setShowCopyArea] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate statistics
  const statsMap: Record<number, { w: number; l: number; pf: number; pa: number }> = {};
  players.forEach((p) => {
    statsMap[p.id] = { w: 0, l: 0, pf: 0, pa: 0 };
  });

  history.forEach((h) => {
    const isW1 = h.s1 > h.s2;
    h.t1.forEach((id) => {
      const s = statsMap[id];
      if (s) {
        s.pf += h.s1;
        s.pa += h.s2;
        if (isW1) s.w++;
        else s.l++;
      }
    });

    h.t2.forEach((id) => {
      const s = statsMap[id];
      if (s) {
        s.pf += h.s2;
        s.pa += h.s1;
        if (!isW1) s.w++;
        else s.l++;
      }
    });
  });

  // Filter and sort list
  let filtered = players.filter((p) => !p.del && (filter === 'all' || p.g === filter));

  const ranked = filtered
    .map((p) => {
      const s = statsMap[p.id] || { w: 0, l: 0, pf: 0, pa: 0 };
      const gp = s.w + s.l;
      const d = s.pf - s.pa;
      const winRate = gp > 0 ? s.w / gp : 0;
      return { p, s, gp, d, winRate };
    })
    .sort((a, b) => {
      return (
        b.s.w - a.s.w ||
        b.winRate - a.winRate ||
        b.d - a.d ||
        a.gp - b.gp ||
        a.p.name.localeCompare(b.p.name, 'vi')
      );
    });

  const getResultsText = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();

    const activeRanked = players
      .filter((p) => !p.del)
      .map((p) => {
        const s = statsMap[p.id] || { w: 0, l: 0, pf: 0, pa: 0 };
        const gp = s.w + s.l;
        const d = s.pf - s.pa;
        const winRate = gp > 0 ? s.w / gp : 0;
        return { p, s, gp, d, winRate };
      })
      .filter((x) => x.gp > 0)
      .sort((a, b) => b.s.w - a.s.w || b.winRate - a.winRate || b.d - a.d);

    let text = `🏸 BG CLUB · KẾT QUẢ MINI GAME ${day}/${month}/${year}\n`;
    text += `Tổng số: ${history.length} trận đã đấu\n\n`;

    activeRanked.forEach((x, i) => {
      const sign = x.d > 0 ? '+' : '';
      const medal = i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : `${i + 1}. `;
      text += `${medal}${x.p.name} (${GROUP_LABELS[x.p.g]}): ${x.s.w}T – ${x.s.l}B (Hiệu số: ${sign}${x.d})\n`;
    });

    return text;
  };

  const handleCopy = () => {
    const text = getResultsText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopied(true);
          onToast('Đã sao chép bảng kết quả gửi Zalo!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          setShowCopyArea(true);
        });
    } else {
      setShowCopyArea(true);
    }
  };

  const filterTabs: { id: 'all' | GroupType; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'A', label: 'Nam A' },
    { id: 'B', label: 'Nam B' },
    { id: 'N', label: 'Nữ' },
  ];

  return (
    <div className="space-y-3">
      {/* Category Filter Segments */}
      <div className="flex bg-[#eeece6] p-1 rounded-xl gap-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`flex-1 py-2 px-2 rounded-lg font-bold text-xs transition-all ${
              filter === tab.id
                ? 'bg-white text-[#14233a] shadow-xs'
                : 'text-[#5b6676] hover:text-[#14233a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-[#e3e0d8] space-y-2">
          <Trophy className="w-10 h-10 text-[#5b6676]/40 mx-auto" />
          <h4 className="font-bold text-[#14233a]">Chưa có trận nào kết thúc</h4>
          <p className="text-xs text-[#5b6676]">
            Hãy bắt đầu các trận đấu ở tab <b>Sân đấu</b> và bấm <b>Lưu kết quả</b> để bảng xếp hạng được cập nhật.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xs border border-[#e3e0d8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#14233a] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-3 text-left">Người chơi</th>
                  <th className="py-2.5 px-2 text-right">Trận</th>
                  <th className="py-2.5 px-2 text-right">Thắng</th>
                  <th className="py-2.5 px-2 text-right">Thua</th>
                  <th className="py-2.5 px-3 text-right">+/-</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e0d8]/70">
                {ranked.map((x, idx) => {
                  const isTop1 = idx === 0 && x.s.w > 0;
                  const isTop2 = idx === 1 && x.s.w > 0;
                  const isTop3 = idx === 2 && x.s.w > 0;

                  return (
                    <tr
                      key={x.p.id}
                      className={`hover:bg-[#faf9f6] transition-colors ${
                        idx % 2 === 1 ? 'bg-[#fcfbf9]' : 'bg-white'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                            isTop1
                              ? 'bg-[#c9a44c] text-[#14233a]'
                              : isTop2
                              ? 'bg-[#cfd5de] text-[#14233a]'
                              : isTop3
                              ? 'bg-[#e6cdb3] text-[#14233a]'
                              : 'bg-[#eeece6] text-[#5b6676]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <GroupBadge g={x.p.g} />
                          <span className="font-bold text-[#14233a] truncate">
                            {x.p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[#5b6676]">
                        {x.gp}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-[#14233a]">
                        {x.s.w}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums text-[#5b6676]">
                        {x.s.l}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                          x.d > 0
                            ? 'text-[#2f8f5b]'
                            : x.d < 0
                            ? 'text-[#c2453b]'
                            : 'text-[#5b6676]'
                        }`}
                      >
                        {x.d > 0 ? `+${x.d}` : x.d}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="text-[12px] text-[#5b6676] px-1">
            Xếp hạng ưu tiên theo: <b>Số trận thắng</b> → <b>Tỉ lệ thắng</b> → <b>Hiệu số điểm</b>.
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-white hover:bg-[#eeece6] border border-[#e3e0d8] text-[#14233a] flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#2f8f5b]" />
                Đã sao chép vào bộ nhớ tạm!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#c9a44c]" />
                Sao chép bảng kết quả (gửi Zalo / Facebook)
              </>
            )}
          </button>

          {showCopyArea && (
            <div className="bg-white rounded-2xl p-3 border border-[#e3e0d8] space-y-1.5 animate-in fade-in">
              <span className="text-xs text-[#5b6676] font-medium block">
                Nếu không tự sao chép được, hãy chọn và sao chép văn bản bên dưới:
              </span>
              <textarea
                readOnly
                rows={6}
                value={getResultsText()}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-[#e3e0d8] bg-[#f7f6f2] text-[#14233a] select-all"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
