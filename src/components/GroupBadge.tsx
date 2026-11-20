import React from 'react';
import { Basket, DEFAULT_BASKETS, GroupType } from '../types.ts';

interface GroupBadgeProps {
  g: GroupType;
  baskets?: Basket[];
  className?: string;
}

export const GroupBadge: React.FC<GroupBadgeProps> = ({
  g,
  baskets = DEFAULT_BASKETS,
  className = '',
}) => {
  const basket = baskets.find((b) => b.id === g) || DEFAULT_BASKETS.find((b) => b.id === g);

  const bgColor = basket?.color || '#5b6676';
  const label = basket?.shortLabel || g;

  return (
    <span
      style={{ backgroundColor: bgColor }}
      className={`inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded text-[11px] font-bold tracking-tight text-white shadow-2xs select-none whitespace-nowrap shrink-0 ${className}`}
    >
      {label}
    </span>
  );
};
