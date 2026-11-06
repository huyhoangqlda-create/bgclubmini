import React, { useState, useEffect } from 'react';
import { X, Check, User } from 'lucide-react';
import { Player, GroupType, GROUP_LABELS } from '../types.ts';
import { GroupBadge } from './GroupBadge.tsx';

interface EditPlayerModalProps {
  isOpen: boolean;
  player: Player | null;
  onClose: () => void;
  onSave: (updated: Player) => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  isOpen,
  player,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState<GroupType>('A');
  const [turns, setTurns] = useState<number>(0);

  useEffect(() => {
    if (player) {
      setName(player.name);
      setGroup(player.g);
      setTurns(player.turns);
    }
  }, [player, isOpen]);

  if (!isOpen || !player) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...player,
      name: name.trim(),
      g: group,
      turns: Math.max(0, turns),
    });
    onClose();
  };

  const groups: GroupType[] = ['A', 'B', 'N'];

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
            <User className="w-4 h-4 text-[#c9a44c]" />
            <h3 className="font-extrabold text-[#14233a] text-sm">
              Chỉnh sửa người chơi
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
        <div className="p-5 space-y-4">
          {/* Name input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5b6676] block">
              Tên người chơi
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm font-bold p-2.5 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] focus:outline-none focus:border-[#c9a44c]"
              placeholder="Nhập tên"
            />
          </div>

          {/* Group selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5b6676] block">
              Rổ thăm (Trình độ)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {groups.map((g) => {
                const isSelected = group === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroup(g)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      isSelected
                        ? g === 'A'
                          ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-xs'
                          : g === 'B'
                          ? 'bg-[#3f7ab8] text-white border-[#3f7ab8] shadow-xs'
                          : 'bg-[#c0567a] text-white border-[#c0567a] shadow-xs'
                        : 'border-[#e3e0d8] text-[#5b6676] hover:bg-[#f3f1ec]'
                    }`}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Turns input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#5b6676] block">
                Số lượt đã ra sân (Turns)
              </label>
              <span className="text-[11px] text-[#5b6676]">
                Ưu tiên ai ít lượt hơn
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTurns(Math.max(0, turns - 1))}
                className="w-10 h-10 rounded-xl bg-[#eeece6] hover:bg-[#e3e0d8] font-bold text-lg flex items-center justify-center transition-colors text-[#14233a]"
              >
                −
              </button>
              <input
                type="number"
                min="0"
                value={turns}
                onChange={(e) => setTurns(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="flex-1 text-center font-extrabold text-lg p-2 rounded-xl border border-[#e3e0d8] bg-white text-[#14233a] font-mono"
              />
              <button
                type="button"
                onClick={() => setTurns(turns + 1)}
                className="w-10 h-10 rounded-xl bg-[#eeece6] hover:bg-[#e3e0d8] font-bold text-lg flex items-center justify-center transition-colors text-[#14233a]"
              >
                +
              </button>
            </div>
          </div>
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
            disabled={!name.trim()}
            className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-[#14233a] hover:bg-[#1f3a5f] disabled:opacity-40 text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5 text-[#2f8f5b]" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};
