import React from 'react';
import { GroupType } from '../types.ts';

interface GroupBadgeProps {
  g: GroupType;
  className?: string;
}

export const GroupBadge: React.FC<GroupBadgeProps> = ({ g, className = '' }) => {
  const colors: Record<GroupType, string> = {
    A: 'bg-[#1f3a5f] text-white',
    B: 'bg-[#3f7ab8] text-white',
    N: 'bg-[#c0567a] text-white',
  };

  const label = g === 'N' ? 'Nữ' : g;

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded text-[11px] font-bold tracking-tight shadow-2xs select-none ${colors[g]} ${className}`}
    >
      {label}
    </span>
  );
};
