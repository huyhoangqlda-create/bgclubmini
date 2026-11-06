import React, { useState, useEffect } from 'react';
import { X, ArrowLeftRight, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Player, ActiveMatch } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';
import { getBusySet, getTeamTypeLabel, isValidTeam } from '../utils/drawLogic.ts';

interface ManualMatchModalProps {
  isOpen: boolean;
  courtIndex: number;
  existingMatch?: ActiveMatch;
  players: Player[];
  activeMatches: Record<number, ActiveMatch>;
  onClose: () => void;
  onSave: (
    courtIndex: number,
    t1: [number, number],
    t2: [number, number],
    isEdit: boolean
  ) => void;
}

export const ManualMatchModal: React.FC<ManualMatchModalProps> = ({
  isOpen,
  courtIndex,
  existingMatch,
  players,
  activeMatches,
  onClose,
  onSave,
}) => {
  const [t1p1, setT1p1] = useState<number | ''>('');
  const [t1p2, setT1p2] = useState<number | ''>('');
  const [t2p1, setT2p1] = useState<number | ''>('');
  const [t2p2, setT2p2] = useState<number | ''>('');

  const busy = getBusySet(activeMatches);
  const isEdit = Boolean(existingMatch);

  // If editing an existing match, exclude its current 4 players from the busy check
  const currentMatchPlayerIds = existingMatch
    ? new Set([...existingMatch.t1, ...existingMatch.t2])
    : new Set<number>();

  useEffect(() => {
    if (existingMatch) {
      setT1p1(existingMatch.t1[0]);
      setT1p2(existingMatch.t1[1]);
      setT2p1(existingMatch.t2[0]);
      setT2p2(existingMatch.t2[1]);
    } else {
      setT1p1('');
      setT1p2('');
      setT2p1('');
      setT2p2('');
    }
  }, [existingMatch, isOpen]);

  if (!isOpen) return null;

  const getPlayer = (id: number | ''): Player | undefined => {
    if (id === '') return undefined;
    return players.find((p) => p.id === id);
  };

  const selectedIds = [t1p1, t1p2, t2p1, t2p2].filter((id) => id !== '') as number[];
  const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;
  const isFilled = t1p1 !== '' && t1p2 !== '' && t2p1 !== '' && t2p2 !== '';

  const p1_1 = getPlayer(t1p1);
  const p1_2 = getPlayer(t1p2);
  const p2_1 = getPlayer(t2p1);
  const p2_2 = getPlayer(t2p2);

  const t1Label = p1_1 && p1_2 ? getTeamTypeLabel(p1_1, p1_2) : 'Chưa đủ người';
  const t2Label = p2_1 && p2_2 ? getTeamTypeLabel(p2_1, p2_2) : 'Chưa đủ người';

  const t1Valid = p1_1 && p1_2 ? isValidTeam([p1_1, p1_2]) : false;
  const t2Valid = p2_1 && p2_2 ? isValidTeam([p2_1, p2_2]) : false;

  const handleSwapTeams = () => {
    const oldT1p1 = t1p1;
    const oldT1p2 = t1p2;
    setT1p1(t2p1);
    setT1p2(t2p2);
    setT2p1(oldT1p1);
    setT2p2(oldT1p2);
  };

  const handleSave = () => {
    if (!isFilled || hasDuplicates) return;
    onSave(
      courtIndex,
      [t1p1 as number, t1p2 as number],
      [t2p1 as number, t2p2 as number],
      isEdit
    );
    onClose();
  };

  // Filter available players: active present players
  const availablePlayers = players
    .filter((p) => p.on && !p.del)
    .sort((a, b) => a.turns - b.turns || a.name.localeCompare(b.name, 'vi'));

  const renderPlayerSelect = (
    label: string,
    currentValue: number | '',
    onChange: (val: number | '') => void
  ) => {
    const curr = getPlayer(currentValue);

    return (
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#5b6676] block">{label}</label>
        <div className="flex items-center gap-1.5">
          {curr && <GroupBadge g={curr.g} />}
          <select
            value={currentValue}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="flex-1 text-sm font-semibold p-2.5 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] focus:outline-none focus:border-[#c9a44c]"
          >
            <option value="">-- Chọn người chơi --</option>
            {availablePlayers.map((p) => {
              const isPlayerBusy = busy.has(p.id) && !currentMatchPlayerIds.has(p.id);
              const isAlreadySelected = selectedIds.includes(p.id) && p.id !== currentValue;

              let suffix = '';
              if (isPlayerBusy) suffix = ' (đang ở sân khác)';
              else if (isAlreadySelected) suffix = ' (đã chọn)';
              else suffix = ` (${p.turns} lượt)`;

              return (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={isPlayerBusy || isAlreadySelected}
                >
                  [{p.g === 'N' ? 'Nữ' : p.g}] {p.name} {suffix}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#0e1624]/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-[#f3f1ec] w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#e3e0d8] max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-[#e3e0d8] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[#14233a] text-base">
              {isEdit ? `Chỉnh sửa Sân ${courtIndex + 1}` : `Ghép cặp thủ công Sân ${courtIndex + 1}`}
            </h3>
            <p className="text-xs text-[#5b6676] mt-0.5">
              Quy ước: Nam A + Nữ, Nam B + Nữ, hoặc Nữ + Nữ
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#eeece6] flex items-center justify-center text-[#5b6676] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Swap Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSwapTeams}
              disabled={!isFilled}
              className="text-xs font-bold text-[#14233a] hover:bg-[#eeece6] px-3 py-1.5 rounded-lg border border-[#e3e0d8] flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#c9a44c]" />
              Đổi Đội 1 ⇄ Đội 2
            </button>
          </div>

          {/* Team 1 Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-[#14233a]">
                Đội 1
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  t1Valid
                    ? 'bg-[#e5f3ea] text-[#2f8f5b]'
                    : p1_1 && p1_2
                    ? 'bg-[#fff6e0] text-[#7a5a12]'
                    : 'bg-[#eeece6] text-[#5b6676]'
                }`}
              >
                {t1Label} {t1Valid ? '✓' : ''}
              </span>
            </div>

            {renderPlayerSelect('Người chơi 1 (Đội 1)', t1p1, setT1p1)}
            {renderPlayerSelect('Người chơi 2 (Đội 1)', t1p2, setT1p2)}
          </div>

          {/* VS Indicator */}
          <div className="text-center font-extrabold text-[#c9a44c] text-xs">
            VS
          </div>

          {/* Team 2 Card */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#e3e0d8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-[#14233a]">
                Đội 2
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  t2Valid
                    ? 'bg-[#e5f3ea] text-[#2f8f5b]'
                    : p2_1 && p2_2
                    ? 'bg-[#fff6e0] text-[#7a5a12]'
                    : 'bg-[#eeece6] text-[#5b6676]'
                }`}
              >
                {t2Label} {t2Valid ? '✓' : ''}
              </span>
            </div>

            {renderPlayerSelect('Người chơi 1 (Đội 2)', t2p1, setT2p1)}
            {renderPlayerSelect('Người chơi 2 (Đội 2)', t2p2, setT2p2)}
          </div>

          {/* Warning / Error messages */}
          {hasDuplicates && (
            <div className="bg-[#fbeceb] text-[#c2453b] p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Có người chơi bị chọn trùng lặp giữa các đội. Vui lòng chọn 4 người khác nhau.</span>
            </div>
          )}

          {isFilled && (!t1Valid || !t2Valid) && (
            <div className="bg-[#fff6e0] text-[#7a5a12] p-3 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#c9a44c]" />
              <span>
                <b>Lưu ý:</b> Quy tắc thông thường yêu cầu mỗi cặp là (Nam A + Nữ, Nam B + Nữ, hoặc Nữ + Nữ). Với tư cách người quản lý, bạn vẫn có thể bấm Lưu để sắp xếp trận này.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-3 border-t border-[#e3e0d8] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm border border-[#e3e0d8] text-[#5b6676] hover:bg-[#eeece6] transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isFilled || hasDuplicates}
            className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm bg-[#14233a] hover:bg-[#1f3a5f] disabled:opacity-40 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4 text-[#2f8f5b]" />
            {isEdit ? 'Lưu thay đổi' : 'Vào sân thi đấu'}
          </button>
        </div>
      </div>
    </div>
  );
};
