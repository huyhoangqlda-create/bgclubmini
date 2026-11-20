import React, { useState } from 'react';
import { UserPlus, Sparkles, X, Edit2, Settings } from 'lucide-react';
import { Player, GroupType, ActiveMatch, HistoryMatch, Basket } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';
import { getBusySet, getBasketName } from '../utils/drawLogic.ts';

interface PlayersTabProps {
  players: Player[];
  active: Record<number, ActiveMatch>;
  history: HistoryMatch[];
  baskets: Basket[];
  selectedGroup: GroupType;
  onSelectGroup: (g: GroupType) => void;
  onAddPlayers: (names: string[], g: GroupType) => void;
  onToggleAttendance: (id: number) => void;
  onDeletePlayer: (id: number) => void;
  onEditPlayer: (player: Player) => void;
  onLoadSamplePlayers: () => void;
  onOpenSettings: () => void;
}

export const PlayersTab: React.FC<PlayersTabProps> = ({
  players,
  active,
  history,
  baskets,
  selectedGroup,
  onSelectGroup,
  onAddPlayers,
  onToggleAttendance,
  onDeletePlayer,
  onEditPlayer,
  onLoadSamplePlayers,
  onOpenSettings,
}) => {
  const [namesText, setNamesText] = useState('');
  const busy = getBusySet(active);

  const activeBasket = baskets.find((b) => b.id === selectedGroup) || baskets[0];

  const statsMap: Record<number, { w: number; l: number; gp: number }> = {};
  players.forEach((p) => {
    statsMap[p.id] = { w: 0, l: 0, gp: 0 };
  });

  history.forEach((h) => {
    const isW1 = h.s1 > h.s2;
    h.t1.forEach((id) => {
      if (statsMap[id]) {
        statsMap[id].gp++;
        if (isW1) statsMap[id].w++;
        else statsMap[id].l++;
      }
    });
    h.t2.forEach((id) => {
      if (statsMap[id]) {
        statsMap[id].gp++;
        if (!isW1) statsMap[id].w++;
        else statsMap[id].l++;
      }
    });
  });

  const handleAdd = () => {
    const lines = namesText.split(/[\n,;]/);
    const valid = lines.map((s) => s.trim()).filter(Boolean);
    if (!valid.length || !activeBasket) return;
    onAddPlayers(valid, activeBasket.id);
    setNamesText('');
  };

  return (
    <div className="space-y-4">
      {/* Add Players Box */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#5b6676]">Chọn rổ để thêm người chơi</span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] font-bold text-[#1f3a5f] hover:underline flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            Thêm rổ Nam / Nữ
          </button>
        </div>

        {/* Basket selector tabs */}
        <div className="flex flex-wrap bg-[#eeece6] p-1 rounded-xl gap-1">
          {baskets.map((b) => {
            const isSelected = activeBasket?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectGroup(b.id)}
                style={isSelected ? { backgroundColor: b.color } : undefined}
                className={`flex-1 min-w-[80px] py-2 px-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'text-[#5b6676] hover:text-[#14233a]'
                }`}
              >
                Rổ {b.name}
              </button>
            );
          })}
        </div>

        {/* Input textarea */}
        <textarea
          rows={3}
          value={namesText}
          onChange={(e) => setNamesText(e.target.value)}
          placeholder={`Nhập tên cho rổ ${activeBasket?.name || ''} (mỗi dòng một người, hoặc cách nhau bởi dấu phẩy)&#10;VD:&#10;Hoàng&#10;Tuấn&#10;Minh`}
          className="w-full text-sm p-3 rounded-xl border border-[#e3e0d8] bg-white focus:outline-none focus:border-[#c9a44c] focus:ring-2 focus:ring-[#c9a44c]/20 resize-none font-medium text-[#14233a] placeholder:text-[#5b6676]/60"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!namesText.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14233a] hover:bg-[#1f3a5f] disabled:opacity-40 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            + Thêm vào rổ {activeBasket?.name || ''}
          </button>

          {players.filter((p) => !p.del).length === 0 && (
            <button
              type="button"
              onClick={onLoadSamplePlayers}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs bg-[#f4ead2] hover:bg-[#e9dcb8] text-[#14233a] transition-colors flex items-center gap-1 shrink-0"
              title="Tải sẵn 12 người chơi mẫu"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c9a44c]" />
              Mẫu 12 người
            </button>
          )}
        </div>
      </div>

      {/* Players grouped by basket */}
      <div className="space-y-4">
        {baskets.map((b) => {
          const list = players.filter((p) => !p.del && p.g === b.id);
          const presentCount = list.filter((p) => p.on).length;

          return (
            <div key={b.id} className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <GroupBadge g={b.id} baskets={baskets} />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#14233a]">
                    Rổ {b.name}
                  </h3>
                  <span className="text-[11px] text-[#5b6676] font-medium">
                    ({b.gender === 'male' ? 'Nam' : 'Nữ'})
                  </span>
                </div>
                <span className="text-xs font-bold text-[#5b6676]">
                  {presentCount}/{list.length} có mặt
                </span>
              </div>

              {list.length === 0 ? (
                <div className="bg-white rounded-xl p-3 text-center text-xs text-[#5b6676] border border-[#e3e0d8]/80 italic">
                  Chưa có ai trong rổ {b.name}.
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xs border border-[#e3e0d8] divide-y divide-[#e3e0d8]/70 overflow-hidden">
                  {list.map((p) => {
                    const st = statsMap[p.id] || { w: 0, l: 0, gp: 0 };
                    const isBusy = busy.has(p.id);

                    return (
                      <div
                        key={p.id}
                        className={`flex items-center gap-2 sm:gap-3 p-3 transition-colors ${
                          p.on ? 'bg-white' : 'bg-[#faf9f6] opacity-75'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold text-sm truncate ${
                                p.on ? 'text-[#14233a]' : 'text-[#5b6676] line-through'
                              }`}
                            >
                              {p.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5b6676] flex items-center gap-1 mt-0.5">
                            {isBusy && (
                              <span className="text-[#2f8f5b] font-bold">🏓 Trên sân · </span>
                            )}
                            <span>{st.gp} trận</span>
                            <span>·</span>
                            <span className="font-semibold text-[#14233a]">{st.w}T</span>
                            <span>{st.l}B</span>
                            <span>·</span>
                            <span className="font-bold text-[#14233a]">{p.turns} lượt</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditPlayer(p)}
                          className="w-8 h-8 rounded-lg hover:bg-[#eeece6] text-[#5b6676] hover:text-[#14233a] transition-colors flex items-center justify-center shrink-0"
                          title="Sửa tên, rổ hoặc số lượt đánh"
                          aria-label={`Chỉnh sửa ${p.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleAttendance(p.id)}
                          className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                            p.on ? 'bg-[#2f8f5b]' : 'bg-[#d8d5cc]'
                          }`}
                          aria-label={p.on ? 'Đang có mặt' : 'Đang nghỉ'}
                          title={p.on ? 'Bấm để đánh dấu nghỉ / về sớm' : 'Bấm để đánh dấu có mặt'}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                              p.on ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeletePlayer(p.id)}
                          className="w-8 h-8 rounded-lg hover:bg-[#fbeceb] text-[#5b6676] hover:text-[#c2453b] transition-colors flex items-center justify-center shrink-0"
                          aria-label={`Xóa ${p.name}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Fallback for any players belonging to a removed/unknown basket ID */}
        {(() => {
          const validIds = new Set(baskets.map((b) => b.id));
          const orphaned = players.filter((p) => !p.del && !validIds.has(p.g));
          if (!orphaned.length) return null;
          return (
            <div className="space-y-1.5">
              <div className="px-1 text-xs font-extrabold uppercase text-[#c2453b]">
                Rổ khác ({orphaned.length})
              </div>
              <div className="bg-white rounded-2xl shadow-xs border border-[#e3e0d8] divide-y divide-[#e3e0d8]/70 overflow-hidden">
                {orphaned.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 p-3">
                    <span className="flex-1 font-bold text-sm text-[#14233a]">
                      {p.name} ({getBasketName(baskets, p.g)})
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditPlayer(p)}
                      className="w-8 h-8 rounded-lg hover:bg-[#eeece6] flex items-center justify-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div className="bg-[#f3f1ec] text-[12px] text-[#5b6676] p-2 leading-relaxed">
        💡 <b>Chỉnh sửa thủ công:</b> Bấm vào biểu tượng bút chì ✏️ cạnh tên người chơi để đổi tên, đổi rổ hoặc tăng/giảm số lượt đã đánh (turns) thủ công theo ý bạn.
      </div>
    </div>
  );
};
