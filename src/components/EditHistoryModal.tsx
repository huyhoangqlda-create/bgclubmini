import React, { useState, useEffect } from 'react';
import { X, Check, History } from 'lucide-react';
import { HistoryMatch, Player } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';

interface EditHistoryModalProps {
  isOpen: boolean;
  match: HistoryMatch | null;
  players: Player[];
  onClose: () => void;
  onSave: (updated: HistoryMatch) => void;
}

export const EditHistoryModal: React.FC<EditHistoryModalProps> = ({
  isOpen,
  match,
  players,
  onClose,
  onSave,
}) => {
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [t1p1, setT1p1] = useState<number>(0);
  const [t1p2, setT1p2] = useState<number>(0);
  const [t2p1, setT2p1] = useState<number>(0);
  const [t2p2, setT2p2] = useState<number>(0);

  useEffect(() => {
    if (match) {
      setS1(String(match.s1));
      setS2(String(match.s2));
      setT1p1(match.t1[0]);
      setT1p2(match.t1[1]);
      setT2p1(match.t2[0]);
      setT2p2(match.t2[1]);
    }
  }, [match, isOpen]);

  if (!isOpen || !match) return null;

  const getPlayer = (id: number): Player | undefined => players.find((p) => p.id === id);

  const handleSave = () => {
    const score1 = parseInt(s1, 10);
    const score2 = parseInt(s2, 10);
    if (isNaN(score1) || isNaN(score2)) return;
    if (score1 === score2) return;

    onSave({
      ...match,
      s1: score1,
      s2: score2,
      t1: [t1p1, t1p2],
      t2: [t2p1, t2p2],
    });
    onClose();
  };

  const selectedIds = [t1p1, t1p2, t2p1, t2p2];
  const hasDuplicates = new Set(selectedIds).size !== selectedIds.length;

  const renderSelect = (label: string, val: number, onChange: (id: number) => void) => {
    const p = getPlayer(val);
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#5b6676] block">{label}</label>
        <div className="flex items-center gap-1.5">
          {p && <GroupBadge g={p.g} />}
          <select
            value={val}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1 text-xs font-semibold p-2 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] focus:outline-none focus:border-[#c9a44c]"
          >
            {players.map((pl) => (
              <option key={pl.id} value={pl.id}>
                [{pl.g === 'N' ? 'Nữ' : pl.g}] {pl.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#0e1624]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#e3e0d8] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e3e0d8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#c9a44c]" />
            <h3 className="font-extrabold text-[#14233a] text-sm">
              Sửa kết quả trận đấu
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-[#eeece6] flex items-center justify-center text-[#5b6676] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Scores */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5b6676] block">
              Tỉ số trận đấu
            </label>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={s1}
                onChange={(e) => setS1(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-extrabold text-2xl py-2 px-3 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] focus:outline-none focus:border-[#c9a44c]"
                placeholder="0"
              />
              <span className="font-extrabold text-[#5b6676] text-xl">–</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={s2}
                onChange={(e) => setS2(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center font-extrabold text-2xl py-2 px-3 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] focus:outline-none focus:border-[#c9a44c]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Players */}
          <div className="space-y-3 pt-2">
            <span className="font-extrabold text-xs uppercase tracking-wider text-[#14233a] block">
              Đội 1
            </span>
            {renderSelect('Người 1 (Đội 1)', t1p1, setT1p1)}
            {renderSelect('Người 2 (Đội 1)', t1p2, setT1p2)}

            <div className="text-center font-bold text-xs text-[#c9a44c] py-0.5">
              VS
            </div>

            <span className="font-extrabold text-xs uppercase tracking-wider text-[#14233a] block">
              Đội 2
            </span>
            {renderSelect('Người 1 (Đội 2)', t2p1, setT2p1)}
            {renderSelect('Người 2 (Đội 2)', t2p2, setT2p2)}
          </div>

          {hasDuplicates && (
            <div className="text-xs text-[#c2453b] font-medium">
              * Không được chọn trùng lặp người chơi trong cùng một trận.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e3e0d8] bg-[#faf9f6] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl font-semibold text-xs border border-[#e3e0d8] text-[#5b6676] hover:bg-[#eeece6] transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!s1 || !s2 || s1 === s2 || hasDuplicates}
            className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-[#14233a] hover:bg-[#1f3a5f] disabled:opacity-40 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-[#2f8f5b]" />
            Lưu kết quả
          </button>
        </div>
      </div>
    </div>
  );
};
