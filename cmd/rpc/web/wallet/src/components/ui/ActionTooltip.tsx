import React from 'react';

interface ActionTooltipProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

export const ActionTooltip: React.FC<ActionTooltipProps> = ({ children }) => {
  return <>{children}</>;
};
