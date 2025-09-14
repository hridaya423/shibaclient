/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartData {
  metric: string;
  score: number;
}

interface GlowingStrokeRadarChartProps {
  data: RadarChartData[];
  title?: string;
  className?: string;
  backgroundColor?: string;
  borderColor?: string;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  animate?: boolean;
  isMiniature?: boolean;
}

const RadarChart = ({
  data,
  title,
  className,
  backgroundColor = 'rgba(255, 255, 255, 0.2)',
  borderColor = 'rgba(255, 255, 255, 1)',
  pointBackgroundColor = 'rgba(255, 255, 255, 1)',
  pointBorderColor = 'rgba(255, 255, 255, 1)',
  width = 400,
  height = 400,
  style = {},
  animate = false,
  isMiniature = false
}: GlowingStrokeRadarChartProps) => {
  
  const createRainbowGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)');    
    gradient.addColorStop(0.2, 'rgba(255, 150, 100, 0.3)');  
    gradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.3)');  
    gradient.addColorStop(0.6, 'rgba(100, 255, 100, 0.3)');  
    gradient.addColorStop(0.8, 'rgba(100, 100, 255, 0.3)');  
    gradient.addColorStop(1, 'rgba(200, 100, 255, 0.3)');    
    return gradient;
  };

  
  const labels = data.map(item => item.metric);
  const scores = data.map(item => item.score);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Ratings',
        data: scores,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return backgroundColor;
          }
          return createRainbowGradient(ctx);
        },
        borderColor: borderColor,
        borderWidth: isMiniature ? 1 : 2,
        pointBackgroundColor: pointBackgroundColor,
        pointBorderColor: pointBorderColor,
        pointBorderWidth: isMiniature ? 1 : 2,
        pointRadius: isMiniature ? 2 : 4,
        pointHoverRadius: isMiniature ? 3 : 6,
        pointHoverBackgroundColor: pointBackgroundColor,
        pointHoverBorderColor: pointBorderColor,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: animate ? 2000 : 0,
      easing: 'easeOutQuart' as const
    },
    scales: {
      r: {
        angleLines: {
          color: isMiniature ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
          lineWidth: isMiniature ? 0.5 : 1
        },
        grid: {
          color: isMiniature ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)',
          lineWidth: isMiniature ? 0.5 : 1
        },
        pointLabels: {
          color: isMiniature ? 'rgba(100, 116, 139, 0.8)' : 'rgba(255, 255, 255, 1)',
          font: {
            size: isMiniature ? 8 : 14,
            weight: 'bold' as const
          }
        },
        ticks: {
          color: isMiniature ? 'rgba(100, 116, 139, 0.5)' : 'rgba(255, 255, 255, 0.7)',
          backdropColor: 'transparent',
          font: {
            size: isMiniature ? 6 : 12
          },
          min: 0,
          max: 5,
          beginAtZero: true,
          display: !isMiniature
        },
        suggestedMin: 0,
        suggestedMax: 5
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1
      }
    }
  };

  return (
    <div className={className} style={{ width, height, ...style }}>
      {title && (
        <h3 className="text-sm font-medium text-slate-700 mb-2 text-center">{title}</h3>
      )}
      <div style={{ width, height }}>
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
};

export { RadarChart as GlowingStrokeRadarChart };
