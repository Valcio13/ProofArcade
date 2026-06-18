import React from 'react';

interface ActionTooltipProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
