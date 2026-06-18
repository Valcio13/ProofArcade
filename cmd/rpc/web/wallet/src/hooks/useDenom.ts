import { useConfig } from '@/app/providers/ConfigProvider';

export const useDenom = () => {
  const { chain } = useConfig();
  
  const symbol = chain?.denom?.symbol || 'CNPY';
  const decimals = chain?.denom?.decimals ?? 6;
  const divisor = Math.pow(10, decimals);
  const factor = divisor; // Alias for compatibility

  const formatAmount = (amount: number) => {
    return (amount / divisor).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return {
    symbol,
    decimals,
    divisor,
    factor,
    formatAmount,
  };
};
