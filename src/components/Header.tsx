import React from 'react';
import { Settings } from 'lucide-react';
import { Player } from '../types.ts';
import { getPresentPlayers } from '../utils/drawLogic.ts';

interface HeaderProps {
  players: Player[];
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ players, onOpenSettings }) => {
  const present = getPresentPlayers(players);
  let roundText = '';

  if (present.length > 0) {
    const minTurns = Math.min(...present.map((p) => p.turns));
    const doneCount = present.filter((p) => p.turns > minTurns).length;
    roundText = `Lượt ${minTurns + 1} · ${doneCount}/${present.length} đã ra sân`;
  }

  return (
    <header className="sticky top-0 z-30 bg-[#14233a] text-white px-4 py-3 shadow-md border-b border-white/10 flex items-center justify-between gap-3">
      <div className="flex flex-col">
        <div className="text-lg font-extrabold tracking-wider leading-none">
          <span className="text-[#c9a44c]">BG</span> CLUB
        </div>
        <span className="text-xs text-[#c8cfda] font-medium tracking-normal mt-1">
          Mini Game · bốc thăm xoay vòng
        </span>
      </div>

      <div className="flex items-center gap-2">
        {roundText && (
          <div className="text-right text-xs text-[#c8cfda] hidden sm:block">
            <span className="block font-bold text-sm text-white">
              {roundText.split(' · ')[0]}
            </span>
            <span>{roundText.split(' · ')[1]}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
          aria-label="Cài đặt"
          title="Cài đặt giải đấu"
        >
          <Settings className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
};
