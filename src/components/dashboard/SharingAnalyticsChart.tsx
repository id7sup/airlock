"use client";

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface AnalyticsData {
  date: string;
  views: number;
  downloads: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.03] p-4 rounded-[24px] shadow-2xl">
        <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em] mb-3">
          {new Date(label).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-black" />
              <p className="text-[13px] font-medium text-black/60">Vues</p>
            </div>
            <p className="text-[13px] font-bold text-black">{payload[0].value}</p>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#96A982]" />
                <p className="text-[13px] font-medium text-black/60">Downloads</p>
              </div>
              <p className="text-[13px] font-bold text-[#96A982]">{payload[1].value}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function SharingAnalyticsChart({ data }: { data: AnalyticsData[] }) {
  // Normaliser les données - s'assurer qu'elles ont le bon format
  const normalizedData = (data || []).map(item => ({
    date: item.date || new Date().toISOString().split('T')[0],
    views: typeof item.views === 'number' ? item.views : 0,
    downloads: typeof item.downloads === 'number' ? item.downloads : 0,
  }));
  
  const filledData = [...normalizedData];
  if (filledData.length < 7) {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      if (!filledData.find(item => item.date === dateStr)) {
        filledData.push({ date: dateStr, views: 0, downloads: 0 });
      }
    }
  }
  
  filledData.sort((a, b) => a.date.localeCompare(b.date));
  
  // Debug: afficher les données dans la console
  console.log('[SharingAnalyticsChart] Data:', filledData);

  return (
    <div className="h-full w-full min-h-[200px] min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200}>
        <AreaChart data={filledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#000000" stopOpacity={0.15}/>
              <stop offset="50%" stopColor="#000000" stopOpacity={0.08}/>
              <stop offset="95%" stopColor="#000000" stopOpacity={0.02}/>
            </linearGradient>
            <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#96A982" stopOpacity={0.25}/>
              <stop offset="50%" stopColor="#96A982" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#96A982" stopOpacity={0.03}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="4 4" 
            vertical={false} 
            stroke="#00000005" 
          />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(0,0,0,0.2)' }}
            tickFormatter={(str) => {
              const d = new Date(str);
              return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(0,0,0,0.3)' }}
            width={35}
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(0,0,0,0.05)', strokeWidth: 1 }}
          />
          <Area 
            isAnimationActive={true}
            animationDuration={2000}
            type="monotone" 
            dataKey="views" 
            stroke="#000000" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorViews)" 
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff', fill: '#000000' }}
            dot={{ r: 3, fill: '#000000', strokeWidth: 0 }}
          />
          <Area 
            isAnimationActive={true}
            animationDuration={2500}
            type="monotone" 
            dataKey="downloads" 
            stroke="#96A982" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorDownloads)" 
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff', fill: '#96A982' }}
            dot={{ r: 3, fill: '#96A982', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
