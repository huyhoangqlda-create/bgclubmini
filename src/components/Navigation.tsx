import React from 'react';
import { LayoutGrid, Users, Trophy, History } from 'lucide-react';
import { TabType } from '../types.ts';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeMatchCount: number;
  playerCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeMatchCount,
  playerCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'courts',
      label: 'Sân đấu',
      icon: <LayoutGrid className="w-5 h-5" />,
      badge: activeMatchCount > 0 ? activeMatchCount : undefined,
    },
    {
      id: 'players',
      label: 'Người chơi',
      icon: <Users className="w-5 h-5" />,
      badge: playerCount > 0 ? playerCount : undefined,
    },
    {
      id: 'rank',
      label: 'Xếp hạng',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'history',
      label: 'Lịch sử',
      icon: <History className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed left-0 right-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e3e0d8] flex px-2 py-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] shadow-lg">
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-xs font-semibold transition-all relative ${
                isActive
                  ? 'text-[#14233a] bg-[#f4ead2]'
                  : 'text-[#5b6676] hover:text-[#14233a] hover:bg-[#f3f1ec]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.id === 'courts' && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-[#2f8f5b] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
