import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const PatientEngagementMetrics = ({ engagementData, complianceData }) => {
  const COLORS = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)', 'var(--color-warning)'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="glass-card p-3 border border-border shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload?.[0]?.name}</p>
          <p className="text-xs text-muted-foreground">
            Value: <span className="font-medium">{payload?.[0]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalEngagement = engagementData?.reduce((sum, item) => sum + item?.value, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground">Patient Engagement</h3>
            <p className="text-sm text-muted-foreground">Activity & Compliance Metrics</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Weekly Activity Distribution</h4>
          <div className="w-full h-64" aria-label="Weekly activity distribution pie chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {engagementData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {engagementData?.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                ></div>
                <span className="text-xs text-muted-foreground">{item?.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Treatment Compliance Rate</h4>
          <div className="w-full h-64" aria-label="Treatment compliance rate bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="category" 
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="rate" fill="var(--color-primary)" name="Compliance %" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center p-4 bg-primary/10 rounded-lg">
          <Icon name="Users" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {complianceData?.reduce((sum, item) => sum + item?.rate, 0) / complianceData?.length}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Avg Compliance</p>
        </div>
        <div className="text-center p-4 bg-secondary/10 rounded-lg">
          <Icon name="TrendingUp" size={24} className="text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalEngagement}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Activities</p>
        </div>
        <div className="text-center p-4 bg-accent/10 rounded-lg">
          <Icon name="Target" size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {complianceData?.filter(item => item?.rate >= 80)?.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">High Performers</p>
        </div>
        <div className="text-center p-4 bg-warning/10 rounded-lg">
          <Icon name="AlertCircle" size={24} className="text-warning mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {complianceData?.filter(item => item?.rate < 60)?.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Need Attention</p>
        </div>
      </div>
    </div>
  );
};

export default PatientEngagementMetrics;