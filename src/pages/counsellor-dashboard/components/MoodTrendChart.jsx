import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const MoodTrendChart = ({ data, patientName, chartType = 'line' }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              <span style={{ color: entry?.color }}>{entry?.name}: </span>
              <span className="font-medium">{entry?.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground">Mood Trend Analysis</h3>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <span className="text-sm text-muted-foreground">Last 30 Days</span>
        </div>
      </div>
      <div className="w-full h-80" aria-label={`${patientName} mood trend chart`}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                domain={[0, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="moodScore" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Mood Score"
              />
              <Line 
                type="monotone" 
                dataKey="anxietyLevel" 
                stroke="var(--color-warning)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-warning)', r: 4 }}
                name="Anxiety Level"
              />
              <Line 
                type="monotone" 
                dataKey="stressLevel" 
                stroke="var(--color-error)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-error)', r: 4 }}
                name="Stress Level"
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
                domain={[0, 10]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
                iconType="square"
              />
              <Bar dataKey="moodScore" fill="var(--color-primary)" name="Mood Score" />
              <Bar dataKey="anxietyLevel" fill="var(--color-warning)" name="Anxiety Level" />
              <Bar dataKey="stressLevel" fill="var(--color-error)" name="Stress Level" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Average Mood</p>
          <p className="text-2xl font-bold text-primary">
            {(data?.reduce((sum, item) => sum + item?.moodScore, 0) / data?.length)?.toFixed(1)}
          </p>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Avg Anxiety</p>
          <p className="text-2xl font-bold text-warning">
            {(data?.reduce((sum, item) => sum + item?.anxietyLevel, 0) / data?.length)?.toFixed(1)}
          </p>
        </div>
        <div className="text-center p-3 bg-error/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Avg Stress</p>
          <p className="text-2xl font-bold text-error">
            {(data?.reduce((sum, item) => sum + item?.stressLevel, 0) / data?.length)?.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodTrendChart;