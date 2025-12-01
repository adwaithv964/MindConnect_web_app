import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const MoodTrendChart = ({ moodHistory }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const generateChartData = () => {
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90
    };

    const days = ranges?.[timeRange];
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date?.setDate(date?.getDate() - i);
      
      const dateStr = date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const moodValue = Math.floor(Math.random() * 5) + 1;
      
      data?.push({
        date: dateStr,
        mood: moodValue,
        intensity: Math.floor(Math.random() * 100)
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const moodLabels = ['', 'Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{payload?.[0]?.payload?.date}</p>
          <p className="text-sm text-muted-foreground">
            Mood: <span className="font-semibold text-primary">{moodLabels?.[payload?.[0]?.value]}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Intensity: <span className="font-semibold text-secondary">{payload?.[0]?.payload?.intensity}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Mood Trends
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartType === 'line' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Line chart view"
            >
              <Icon name="LineChart" size={16} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                chartType === 'bar' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Bar chart view"
            >
              <Icon name="BarChart3" size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {['week', 'month', 'quarter']?.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  timeRange === range 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Mood trend visualization chart">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="var(--color-primary)" 
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', r: 4 }}
                activeDot={{ r: 6 }}
                name="Mood Level"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                stroke="var(--color-muted-foreground)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="mood" 
                fill="var(--color-secondary)" 
                radius={[8, 8, 0, 0]}
                name="Mood Level"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">4.2</p>
          <p className="text-xs text-muted-foreground mt-1">Average Mood</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-secondary">78%</p>
          <p className="text-xs text-muted-foreground mt-1">Positive Days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">12</p>
          <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
        </div>
      </div>
    </div>
  );
};

export default MoodTrendChart;