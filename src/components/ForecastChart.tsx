import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';
import { Box } from '@mui/material';

interface ForecastPoint {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

interface ForecastChartProps {
  data: ForecastPoint[];
  title: string;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, title }) => {
  const chartData = data.map((point) => ({
    time: format(new Date(point.ds), 'HH:mm'),
    forecast: Math.round(point.yhat * 100) / 100,
    lower: Math.round(point.yhat_lower * 100) / 100,
    upper: Math.round(point.yhat_upper * 100) / 100,
  }));

  return (
    <Box sx={{ 
      width: '100%', 
      height: 400,
      position: 'relative',
      '& .recharts-cartesian-grid-horizontal line': {
        stroke: 'rgba(102, 126, 234, 0.1)',
        strokeDasharray: '3 3'
      },
      '& .recharts-cartesian-grid-vertical line': {
        stroke: 'rgba(102, 126, 234, 0.1)',
        strokeDasharray: '3 3'
      },
      '& .recharts-xAxis .recharts-cartesian-axis-tick-value': {
        fill: '#667eea',
        fontSize: '12px',
        fontWeight: 500
      },
      '& .recharts-yAxis .recharts-cartesian-axis-tick-value': {
        fill: '#667eea',
        fontSize: '12px',
        fontWeight: 500
      },
      '& .recharts-cartesian-axis-label': {
        fill: '#667eea',
        fontSize: '14px',
        fontWeight: 600
      },
      '& .recharts-legend-item-text': {
        fill: '#667eea',
        fontSize: '12px',
        fontWeight: 500
      },
      '& .recharts-tooltip-wrapper': {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            label={{ value: 'Vehicles Charged', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            labelFormatter={(value) => `Time: ${value}`}
            formatter={(value: number, name: string) => [
              Math.round(value * 100) / 100,
              name === 'forecast' ? 'Forecasted Demand' :
              name === 'lower' ? 'Lower Bound' : 'Upper Bound'
            ]}
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="upper"
            stackId="1"
            stroke="transparent"
            fill="rgba(102, 126, 234, 0.1)"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stackId="1"
            stroke="transparent"
            fill="rgba(255, 255, 255, 0.8)"
            fillOpacity={1}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="url(#gradient)"
            strokeWidth={3}
            dot={{ 
              fill: '#667eea', 
              strokeWidth: 2, 
              r: 4,
              stroke: 'white'
            }}
            activeDot={{ 
              r: 6, 
              stroke: '#667eea', 
              strokeWidth: 2,
              fill: 'white'
            }}
          />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ForecastChart;
