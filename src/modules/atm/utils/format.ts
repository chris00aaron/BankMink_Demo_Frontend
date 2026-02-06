  // Formatear números a moneda
  export function formatCurrency(value: number) {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

    // Formatear números grandes de forma compacta
  export function formatCompact(value: number) {
    if (value >= 1000000) {
      return `S/ ${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `S/ ${(value / 1000).toFixed(1)}K`;
    }
    return formatCurrency(value);
  };
