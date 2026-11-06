import React, { useState, useEffect } from 'react';
import { Sparkles, Dices, AlertTriangle, Clock, Trophy, CheckCircle2, RotateCcw } from 'lucide-react';
import { Player, ActiveMatch, HistoryMatch } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';
import { getPresentPlayers, getIdlePlayers, getMinTurns } from '../utils/drawLogic.ts';

interface CourtsTabProps {
  courts: number;
  active: Record<number, ActiveMatch>;
  players: Player[];
  history: HistoryMatch[];
  sameType: boolean;
  rollingCourts: Set<number>;
  rollingNames: Record<number, { t1: string[]; t2: string[] }>;
  onDrawCourt: (courtIndex: number) => void;
  onDrawAllFree: () => void;
  onScoreChange: (courtIndex: number, team: 1 | 2, val: string) => void;
  onQuickScore: (courtIndex: number, team: 1 | 2) => void;
  onFinishMatch: (courtIndex: number) => void;
  onCancelMatch: (courtIndex: number) => void;
  onNavigateToPlayers: () => void;
  onLoadSamplePlayers: () => void;
}

export const CourtsTab: React.FC<CourtsTabProps> = ({
  courts,
  active,
  players,
  sameType,
  rollingCourts,
  rollingNames,
  onDrawCourt,
  onDrawAllFree,
  onScoreChange,
  onQuickScore,
  onFinishMatch,
  onCancelMatch,
  onNavigateToPlayers,
  onLoadSamplePlayers,
}) => {
  // Timer tick for match duration
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  const getPlayer = (id: number): Player | undefined => players.find((p) => p.id === id);

  const formatElapsed = (startTime: number): string => {
    const mins = Math.floor((Date.now() - startTime) / 60000);
    return mins < 1 ? 'vừa bắt đầu' : `${mins} phút`;
  };

  const getTeamType = (ids: [number, number]): string => {
    const p1 = getPlayer(ids[0]);
    const p2 = getPlayer(ids[1]);
    if (p1?.g === 'N' || p2?.g === 'N') return 'Nam + Nữ';
    return 'A + B';
  };

  const present = getPresentPlayers(players);
  const idle = getIdlePlayers(players, active);
  const activeCount = Object.keys(active).length;
  const freeCourtIndices = Array.from({ length: courts }, (_, i) => i).filter((i) => !active[i]);
  const minTurns = getMinTurns(players);

  // If no players or < 4 players and no active match
  if (present.length < 4 && activeCount === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 text-center shadow-xs border border-[#e3e0d8] space-y-4">
          <div className="w-14 h-14 bg-[#f4ead2] text-[#c9a44c] rounded-2xl flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#14233a]">Chưa đủ người để bốc thăm</h3>
            <p className="text-sm text-[#5b6676] max-w-md mx-auto mt-1 leading-relaxed">
              Giải đấu cần ít nhất 4 người chơi có mặt thuộc 3 rổ: <b>Nam A</b>, <b>Nam B</b> và <b>Nữ</b> để bắt đầu ghép cặp thi đấu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto pt-2">
            <button
              type="button"
              onClick={onNavigateToPlayers}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#14233a] text-white hover:bg-[#1f3a5f] transition-colors"
            >
              + Thêm người chơi
            </button>
            <button
              type="button"
              onClick={onLoadSamplePlayers}
              className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-[#eeece6] text-[#14233a] hover:bg-[#e3e0d8] transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#c9a44c]" />
              Nạp mẫu 12 người
            </button>
          </div>
        </div>

        {/* Rules Card */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e3e0d8] text-sm text-[#5b6676] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[#14233a] flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c9a44c]" />
            Thể lệ bốc thăm mini game
          </div>
          <p>
            <b>1. Ghép cặp công bằng:</b> Chia người chơi làm 3 rổ thăm (Nam A, Nam B, Nữ). Mỗi đội trên sân gồm <b>Nam A + Nam B</b> hoặc <b>Nam + Nữ</b>.
          </p>
          <p>
            <b>2. Xoay vòng lượt chơi:</b> Ưu tiên người đang chờ ở ngoài; bốc xoay vòng đến khi tất cả thành viên đều được ra sân rồi mới chuyển sang lượt mới. Trận chạm 15 điểm.
          </p>
          <p>
            <b>3. Tự động tính điểm:</b> Hệ thống tự tính số trận thắng, thua, hiệu số điểm và xếp hạng trực tiếp.
          </p>
          <p>
            <b>4. Thành viên đến muộn:</b> Được thêm vào và tự động ưu tiên bốc ngay ở lượt kế tiếp!
          </p>
        </div>
      </div>
    );
  }

  // Count genders in waiting queue
  const genderCounts = { A: 0, B: 0, N: 0 };
  present.forEach((p) => genderCounts[p.g]++);

  return (
    <div className="space-y-4">
      {/* Batch Draw Button if multiple courts are free */}
      {freeCourtIndices.length > 1 && idle.length >= 4 && (
        <button
          type="button"
          onClick={onDrawAllFree}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#c9a44c] hover:bg-[#b8933b] text-[#14233a] shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Dices className="w-5 h-5 text-[#14233a]" />
          Bốc thăm {freeCourtIndices.length} sân trống cùng lúc
        </button>
      )}

      {/* Courts list */}
      <div className="space-y-3">
        {Array.from({ length: courts }, (_, courtIdx) => {
          const match = active[courtIdx];
          const isRolling = rollingCourts.has(courtIdx);

          // Empty Court
          if (!match) {
            return (
              <div
                key={courtIdx}
                className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold tracking-wider text-[#14233a] text-sm">
                    SÂN {courtIdx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#eeece6] text-[#5b6676]">
                    Trống
                  </span>
                </div>

                <div className="py-4 text-center text-[#5b6676] text-sm font-medium">
                  Sân đang chờ thi đấu
                </div>

                <button
                  type="button"
                  onClick={() => onDrawCourt(courtIdx)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14233a] hover:bg-[#1f3a5f] text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Dices className="w-4 h-4 text-[#c9a44c]" />
                  Bốc thăm Sân {courtIdx + 1}
                </button>
              </div>
            );
          }

          // Active or Rolling Court
          const p1 = getPlayer(match.t1[0]);
          const p2 = getPlayer(match.t1[1]);
          const p3 = getPlayer(match.t2[0]);
          const p4 = getPlayer(match.t2[1]);

          const rollData = rollingNames[courtIdx];

          return (
            <div
              key={courtIdx}
              className={`bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-3.5 transition-all ${
                isRolling ? 'draw-pulse ring-2 ring-[#c9a44c]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold tracking-wider text-[#14233a] text-sm">
                  SÂN {courtIdx + 1}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    isRolling
                      ? 'bg-[#f4ead2] text-[#c9a44c]'
                      : 'bg-[#e5f3ea] text-[#2f8f5b]'
                  }`}
                >
                  {isRolling ? (
                    <>
                      <Dices className="w-3.5 h-3.5 animate-spin" />
                      Đang bốc thăm…
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      Đang đấu · {formatElapsed(match.at)}
                    </>
                  )}
                </span>
              </div>

              {/* VS matchup display */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
                {/* Team 1 */}
                <div className="bg-[#f7f6f2] rounded-xl p-2.5 flex flex-col gap-2 min-w-0">
                  <span className="text-[10px] text-[#5b6676] font-bold uppercase tracking-wider">
                    Đội 1 · {getTeamType(match.t1)}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {p1 && <GroupBadge g={p1.g} />}
                      <span className="font-bold text-sm text-[#14233a] truncate">
                        {isRolling && rollData?.t1[0] ? rollData.t1[0] : p1?.name || '(Đã xóa)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {p2 && <GroupBadge g={p2.g} />}
                      <span className="font-bold text-sm text-[#14233a] truncate">
                        {isRolling && rollData?.t1[1] ? rollData.t1[1] : p2?.name || '(Đã xóa)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="self-center font-extrabold text-[#c9a44c] text-xs px-0.5">
                  VS
                </div>

                {/* Team 2 */}
                <div className="bg-[#f7f6f2] rounded-xl p-2.5 flex flex-col gap-2 min-w-0">
                  <span className="text-[10px] text-[#5b6676] font-bold uppercase tracking-wider">
                    Đội 2 · {getTeamType(match.t2)}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {p3 && <GroupBadge g={p3.g} />}
                      <span className="font-bold text-sm text-[#14233a] truncate">
                        {isRolling && rollData?.t2[0] ? rollData.t2[0] : p3?.name || '(Đã xóa)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {p4 && <GroupBadge g={p4.g} />}
                      <span className="font-bold text-sm text-[#14233a] truncate">
                        {isRolling && rollData?.t2[1] ? rollData.t2[1] : p4?.name || '(Đã xóa)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoring Controls when match is running */}
              {!isRolling && (
                <div className="space-y-2 pt-1">
                  {/* Score inputs */}
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      placeholder="0"
                      value={match.d1}
                      onChange={(e) => onScoreChange(courtIdx, 1, e.target.value)}
                      className="w-full text-center font-extrabold text-2xl py-2 px-3 rounded-xl border border-[#e3e0d8] bg-white focus:outline-none focus:border-[#c9a44c] focus:ring-2 focus:ring-[#c9a44c]/20"
                      aria-label="Điểm đội 1"
                    />
                    <span className="font-extrabold text-[#5b6676] text-xl">–</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      placeholder="0"
                      value={match.d2}
                      onChange={(e) => onScoreChange(courtIdx, 2, e.target.value)}
                      className="w-full text-center font-extrabold text-2xl py-2 px-3 rounded-xl border border-[#e3e0d8] bg-white focus:outline-none focus:border-[#c9a44c] focus:ring-2 focus:ring-[#c9a44c]/20"
                      aria-label="Điểm đội 2"
                    />
                  </div>

                  {/* Quick score buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onQuickScore(courtIdx, 1)}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-[#e3e0d8] text-[#14233a] hover:bg-[#f3f1ec] transition-colors"
                    >
                      Đội 1 chạm 15
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickScore(courtIdx, 2)}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-[#e3e0d8] text-[#14233a] hover:bg-[#f3f1ec] transition-colors"
                    >
                      Đội 2 chạm 15
                    </button>
                  </div>

                  {/* Finish & Cancel Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onCancelMatch(courtIdx)}
                      className="flex-[0.35] py-2.5 px-3 rounded-xl font-bold text-xs bg-[#fbeceb] hover:bg-[#f7d6d4] text-[#c2453b] transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => onFinishMatch(courtIdx)}
                      className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14233a] hover:bg-[#1f3a5f] text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#2f8f5b]" />
                      Lưu kết quả
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Waiting Queue section */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-xs font-extrabold tracking-wider uppercase text-[#5b6676] flex items-center gap-2">
            Hàng chờ bốc thăm
            <span className="bg-[#e3e0d8] text-[#14233a] rounded-full px-2 py-0.5 text-xs font-bold">
              {idle.length}
            </span>
          </h2>
          <span className="text-[11px] text-[#5b6676]">
            {genderCounts.A}A · {genderCounts.B}B · {genderCounts.N} Nữ
          </span>
        </div>

        {idle.length === 0 ? (
          <div className="text-xs text-[#5b6676] px-1 italic">
            Tất cả người có mặt đang trên sân thi đấu.
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {idle
                .slice()
                .sort((a, b) => a.turns - b.turns || a.last - b.last)
                .map((p) => {
                  const isPriority = p.turns === minTurns;
                  return (
                    <span
                      key={p.id}
                      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white text-xs font-semibold shadow-2xs border transition-all ${
                        isPriority
                          ? 'border-[#c9a44c] ring-1 ring-[#c9a44c]/30 text-[#14233a]'
                          : 'border-[#e3e0d8] text-[#5b6676]'
                      }`}
                    >
                      <GroupBadge g={p.g} className="text-[10px] min-w-4 h-4" />
                      <span>{p.name}</span>
                      <span className="text-[10px] text-[#5b6676] font-normal">
                        ({p.turns} lượt)
                      </span>
                    </span>
                  );
                })}
            </div>

            <p className="text-[12px] text-[#5b6676] px-1 leading-relaxed">
              <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-[#c9a44c] mr-1 align-middle"></span>
              <b>Viền vàng:</b> chưa ra sân ở lượt hiện tại, được ưu tiên bốc trước. Khi tất cả đã ra sân đủ lượt, app tự động sang lượt tiếp theo.
            </p>

            {genderCounts.N === 1 && sameType && (
              <div className="bg-[#fff6e0] text-[#7a5a12] rounded-xl p-2.5 text-xs flex items-start gap-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#c9a44c] mt-0.5" />
                <span>
                  Chỉ có 1 Nữ có mặt: cô ấy sẽ được ghép thành đội (Nam + Nữ) gặp đội (Nam A + Nam B) khi tới lượt ưu tiên.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
