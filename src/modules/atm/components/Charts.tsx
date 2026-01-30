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
  ErrorBar
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

export const ComparisonChart = ({ data }: ChartsProps) => {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
            dataKey="atmId" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={false}
            tickFormatter={(value) => `$${value/1000}k`}
        />
        <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend />
        <Bar dataKey="historical" name="Valor Histórico" fill="#94a3b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="predicted" name="Valor Predicho" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ConfidenceIntervalChart = ({ data }: ChartsProps) => {
    // Transform data for ErrorBar usage
    // We want to show a point for the predicted value, and error bars extending to lower and upper bounds
    // ErrorBar expects 'error' which is [minus, plus] relative to value.
    const transformedData = data.map(item => ({
        ...item,
        error: [item.predicted - item.lowerBound, item.upperBound - item.predicted]
    }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart
        data={transformedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
            dataKey="atmId" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={{ stroke: '#cbd5e1' }}
        />
        <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            axisLine={false}
            tickFormatter={(value) => `$${value/1000}k`}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend />
        
        {/* We use a Bar to show the range implicitly or just Line with ErrorBar */}
        {/* Let's try a visual representation where we show the range as a floating bar or just Error Bars on a point */}
        
        <Bar dataKey="predicted" barSize={20} fill="transparent" stroke="none">
            <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#2563eb" direction="y" />
        </Bar>
        
        <Line type="monotone" dataKey="predicted" name="Predicción Central" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} />
        <Line type="monotone" dataKey="upperBound" name="Límite Superior" stroke="#10b981" strokeDasharray="5 5" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="lowerBound" name="Límite Inferior" stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={2} dot={false} />

      </ComposedChart>
    </ResponsiveContainer>
  );
};
