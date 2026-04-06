import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Cell,
} from 'recharts';

interface PredictionData {
  atmId: string;
  historical: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

interface ChartsProps {
  data: PredictionData[];
}

/* ─── Tooltip types & shared styles ─── */
interface TooltipEntry {
  name?: string;
  value?: string | number;
  color?: string;
  payload?: Record<string, unknown>;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '14px',
  border: 'none',
  boxShadow: '0 20px 40px -8px rgba(0,0,0,0.35)',
  padding: '14px 18px',
  color: '#f8fafc',
};

const tooltipLabel: React.CSSProperties = {
  fontWeight: 800,
  color: '#e2e8f0',
  marginBottom: '10px',
  fontSize: '13px',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

/* ─── Custom Tooltip: Comparison ─── */
const ComparisonTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle}>
      <p style={tooltipLabel}>{label}</p>
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 6 : 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{entry.name}:</span>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>${Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Custom Tooltip: Confidence Interval ─── */
const IntervalTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as unknown as PredictionData & { intervalRange?: number[] };
  return (
    <div style={tooltipStyle}>
      <p style={tooltipLabel}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Límite Superior:</span>
          <span style={{ fontWeight: 700, color: '#34d399', fontSize: 14 }}>${item?.upperBound?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Predicción:</span>
          <span style={{ fontWeight: 700, color: '#60a5fa', fontSize: 14 }}>${item?.predicted?.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>Límite Inferior:</span>
          <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: 14 }}>${item?.lowerBound?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Custom Tooltip: Lines ─── */
const LinesTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const colorMap: Record<string, string> = {
    'Límite Superior': '#34d399',
    'Predicción Central': '#60a5fa',
    'Límite Inferior': '#fbbf24',
  };
  return (
    <div style={tooltipStyle}>
      <p style={tooltipLabel}>{label}</p>
      {payload.map((entry: TooltipEntry, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 5 : 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colorMap[entry.name as string] || entry.color, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{entry.name}:</span>
          <span style={{ fontWeight: 700, color: colorMap[entry.name as string] || '#fff', fontSize: 14 }}>${Number(entry.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Shared axis config ─── */
const xAxisProps = {
  dataKey: 'atmId' as const,
  tick: { fill: '#475569', fontSize: 12, fontWeight: 600 },
  axisLine: { stroke: '#cbd5e1', strokeWidth: 1 },
  tickLine: false,
  dy: 8,
};

const yAxisProps = {
  tick: { fill: '#475569', fontSize: 12, fontWeight: 600 },
  axisLine: false as const,
  tickLine: false,
  tickFormatter: (value: number) => `$${value / 1000}k`,
  dx: -4,
};

/* ────────────────────────────────────────────────
   1. COMPARISON CHART (Bar)
   ──────────────────────────────────────────────── */
export const ComparisonChart = ({ data }: ChartsProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 16 }}>
        <defs>
          <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="gradHistorical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity={1} />
            <stop offset="100%" stopColor="#64748b" stopOpacity={1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<ComparisonTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        <Legend
          wrapperStyle={{ paddingTop: '16px', fontSize: '13px', fontWeight: 600 }}
          iconType="circle"
          iconSize={10}
        />
        <Bar
          dataKey="historical"
          name="Valor Histórico"
          fill="url(#gradHistorical)"
          radius={[8, 8, 0, 0]}
          barSize={24}
        />
        <Bar
          dataKey="predicted"
          name="Valor Predicho"
          fill="url(#gradPredicted)"
          radius={[8, 8, 0, 0]}
          barSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ────────────────────────────────────────────────
   2. CONFIDENCE INTERVAL CHART (Floating Bars)
   ──────────────────────────────────────────────── */
export const ConfidenceIntervalChart = ({ data }: ChartsProps) => {
  const transformedData = data.map(item => ({
    ...item,
    intervalRange: [item.lowerBound, item.upperBound],
  }));

  // Alternate bar colors for visual richness
  const barColors = ['#059669', '#0d9488', '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#e11d48', '#ea580c'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={transformedData} margin={{ top: 10, right: 20, left: 10, bottom: 16 }}>
        <defs>
          {barColors.map((color, i) => (
            <linearGradient key={i} id={`gradBar${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.85} />
              <stop offset="100%" stopColor={color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<IntervalTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '16px', fontSize: '13px', fontWeight: 600 }}
          iconType="circle"
          iconSize={10}
        />

        <Bar
          dataKey="intervalRange"
          name="Rango de Confianza"
          radius={[8, 8, 8, 8]}
          barSize={30}
        >
          {transformedData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={`url(#gradBar${index % barColors.length})`}
              stroke={barColors[index % barColors.length]}
              strokeWidth={1.5}
            />
          ))}
        </Bar>

        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicción Central"
          stroke="none"
          dot={{ r: 7, fill: '#0f172a', strokeWidth: 3, stroke: '#fff' }}
          activeDot={{ r: 9, strokeWidth: 0, fill: '#1e293b' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

/* ────────────────────────────────────────────────
   3. CONFIDENCE LINES CHART (Area + Lines)
   ──────────────────────────────────────────────── */
export const ConfidenceLinesChart = ({ data }: ChartsProps) => {
  // Stacked area to show the confidence band
  const transformedData = data.map(item => ({
    ...item,
    base: item.lowerBound,
    band: item.upperBound - item.lowerBound,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={transformedData} margin={{ top: 10, right: 20, left: 10, bottom: 16 }}>
        <defs>
          <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id="gradPredLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<LinesTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: '16px', fontSize: '13px', fontWeight: 600 }}
          iconType="circle"
          iconSize={10}
        />

        {/* Invisible base */}
        <Area
          type="monotone"
          dataKey="base"
          stackId="band"
          stroke="none"
          fill="transparent"
          activeDot={false}
          legendType="none"
        />
        {/* Shaded band */}
        <Area
          type="monotone"
          dataKey="band"
          stackId="band"
          stroke="none"
          fill="url(#gradBand)"
          activeDot={false}
          legendType="none"
        />

        <Line
          type="monotone"
          dataKey="upperBound"
          name="Límite Superior"
          stroke="#10b981"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7, strokeWidth: 0, fill: '#059669' }}
        />
        <Line
          type="monotone"
          dataKey="predicted"
          name="Predicción Central"
          stroke="url(#gradPredLine)"
          strokeWidth={3.5}
          dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#3b82f6' }}
          activeDot={{ r: 8, strokeWidth: 0, fill: '#1d4ed8' }}
        />
        <Line
          type="monotone"
          dataKey="lowerBound"
          name="Límite Inferior"
          stroke="#f59e0b"
          strokeWidth={2.5}
          strokeDasharray="6 3"
          dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 7, strokeWidth: 0, fill: '#d97706' }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
