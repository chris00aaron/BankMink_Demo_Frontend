import { formatCurrency } from "../utils/format";

interface Payload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload[];
  label?: string;
}



export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  // Verificación limpia
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
      <p className="font-semibold text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-mono font-bold">{entry.value}%</span>
        </p>
      ))}
    </div>
  );
};


  // Custom Tooltip para los gráficos de dashboard
  export const CustomTooltipDashboard = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: Payload, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );;
  };
