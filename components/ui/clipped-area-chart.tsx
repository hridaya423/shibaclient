"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";

interface HoursPerDay {
  date: string;
  hours: number;
}

interface ClippedAreaChartProps {
  data?: HoursPerDay[];
}

const chartConfig = {
  hours: {
    label: "Hours",
    color: "#ec4899",
  },
} satisfies ChartConfig;

export function ClippedAreaChart({ data = [] }: ClippedAreaChartProps) {
  
  const chartData = useMemo(() => data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    hours: item.hours
  })), [data]);

  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [activeIndex, setActiveIndex] = useState(chartData.length - 1); 

  
  const percentageChange = useMemo(() => {
    if (chartData.length < 2 || activeIndex <= 0) return 0;
    const current = chartData[activeIndex]?.hours || 0;
    const previous = chartData[activeIndex - 1]?.hours || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, [chartData, activeIndex]);

  
  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  
  useEffect(() => {
    if (chartRef.current && chartData.length > 0) {
      const width = chartRef.current.getBoundingClientRect().width;
      const todayHours = chartData[chartData.length - 1]?.hours || 0;
      springX.set(width);
      springY.set(todayHours);
      setActiveIndex(chartData.length - 1);
    }
  }, [chartData, springX, springY]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {springY.get().toFixed(1)}h
          <Badge 
            variant="secondary" 
            className={`ml-2 ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            <TrendingDown className={`h-4 w-4 ${percentageChange >= 0 ? 'rotate-180' : ''}`} />
            <span>{percentageChange.toFixed(1)}%</span>
          </Badge>
        </CardTitle>
        <CardDescription>Hours logged over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          ref={chartRef}
          className="h-54 w-full"
          config={chartConfig}
        >
          <AreaChart
            className="overflow-visible"
            accessibilityLayer
            data={chartData}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = state.activePayload?.[0]?.value;
              const activePayload = state.activePayload?.[0]?.payload;
              if (x && dataValue !== undefined && activePayload) {
                springX.set(x);
                springY.set(dataValue);
                
                const index = chartData.findIndex(item => item.date === activePayload.date);
                if (index !== -1) {
                  setActiveIndex(index);
                }
              }
            }}
            onMouseLeave={() => {
              
            }}
            margin={{
              right: 0,
              left: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              horizontalCoordinatesGenerator={(props) => {
                const { height } = props;
                return [0, height - 30];
              }}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              className="text-xs"
              fontSize={10}
            />
            <Area
              dataKey="hours"
              type="monotone"
              fill="url(#gradient-cliped-area-hours)"
              fillOpacity={0.4}
              stroke="var(--color-hours)"
              clipPath={`inset(0 ${
                Number(chartRef.current?.getBoundingClientRect().width) - axis
              } 0 0)`}
            />
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2={"85%"}
              stroke="var(--color-hours)"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.2}
            />
            <rect
              x={axis - 50}
              y={0}
              width={50}
              height={18}
              fill="var(--color-hours)"
            />
            <text
              x={axis - 25}
              fontWeight={600}
              y={13}
              textAnchor="middle"
              fill="var(--primary-foreground)"
            >
              {springY.get().toFixed(1)}h
            </text>
            
            <Area
              dataKey="hours"
              type="monotone"
              fill="none"
              stroke="var(--color-hours)"
              strokeOpacity={0.1}
            />
            <defs>
              <linearGradient
                id="gradient-cliped-area-hours"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-hours)"
                  stopOpacity={0.2}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-hours)"
                  stopOpacity={0}
                />
                <mask id="mask-cliped-area-chart">
                  <rect
                    x={0}
                    y={0}
                    width={"50%"}
                    height={"100%"}
                    fill="white"
                  />
                </mask>
              </linearGradient>
            </defs>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
