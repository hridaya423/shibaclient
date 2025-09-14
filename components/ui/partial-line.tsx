"use client";

import { CartesianGrid, Line, LineChart, XAxis, Customized } from "recharts";
import { useCallback, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { HoursPerDay, DailyActiveUsers } from "@/types";

const chartConfig = {
  hours: {
    label: "Hours",
    color: "#ec4899", 
  },
  users: {
    label: "Active Users",
    color: "#60a5fa", 
  },
} satisfies ChartConfig;

interface PartialLineChartProps {
  hoursData?: HoursPerDay[];
  activeUsersData?: DailyActiveUsers[];
}

export function PartialLineChart({ hoursData = [], activeUsersData = [] }: PartialLineChartProps) {
  const [activeIndex, setActiveIndex] = useState(-1); 
  
  const chartData = useMemo(() => {
    const maxLength = Math.max(hoursData.length, activeUsersData.length);
    if (maxLength === 0) return [];

    
    const dataPoints = [];
    for (let i = 0; i < maxLength; i++) {
      const hoursEntry = hoursData[i];
      const usersEntry = activeUsersData[i];

      dataPoints.push({
        date: hoursEntry?.date || usersEntry?.date || new Date().toISOString(),
        hours: hoursEntry?.hours || 0,
        users: usersEntry?.userCount || 0,
        displayDate: new Date(hoursEntry?.date || usersEntry?.date || new Date()).toLocaleDateString('en', {
          month: 'short',
          day: 'numeric'
        })
      });
    }
    
    if (dataPoints.length >= 2) {
      const lastPoint = dataPoints[dataPoints.length - 1];
      const nextDate = new Date(lastPoint.date);
      nextDate.setDate(nextDate.getDate() + 1);

      
      const avgHours = dataPoints.reduce((sum, point) => sum + point.hours, 0) / dataPoints.length;
      const avgUsers = Math.round(dataPoints.reduce((sum, point) => sum + point.users, 0) / dataPoints.length);

      dataPoints.push({
        date: nextDate.toISOString(),
        hours: Math.max(0, avgHours),
        users: Math.max(0, avgUsers),
        displayDate: nextDate.toLocaleDateString('en', {
          month: 'short',
          day: 'numeric'
        }),
        isProjection: true
      });
    }
    
    return dataPoints;
  }, [hoursData, activeUsersData]);

  const [DasharrayCalculator, lineDasharrays] = useDynamicDasharray({
    splitIndex: chartData.length - 2, 
    lineConfigs: [
      { name: 'hours', dashPattern: [5, 3] },
      { name: 'users', dashPattern: [5, 3] }
    ]
  });

  
  const hoursChange = useMemo(() => {
    const index = activeIndex >= 0 ? activeIndex : chartData.length - 2; 
    if (chartData.length < 2 || index <= 0) return 0;
    const current = chartData[index]?.hours || 0;
    const previous = chartData[index - 1]?.hours || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, [chartData, activeIndex]);

  const usersChange = useMemo(() => {
    const index = activeIndex >= 0 ? activeIndex : chartData.length - 2; 
    if (chartData.length < 2 || index <= 0) return 0;
    const current = chartData[index]?.users || 0;
    const previous = chartData[index - 1]?.users || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, [chartData, activeIndex]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Hours & Active Users
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className={`${hoursChange >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} border-none cursor-help`}
              title="Hours logged per day - percentage change from previous day"
            >
              <TrendingUp className={`h-4 w-4 ${hoursChange >= 0 ? '' : 'rotate-180'}`} />
              <span>{hoursChange.toFixed(1)}%</span>
            </Badge>
            <Badge
              variant="outline"
              className={`${usersChange >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} border-none cursor-help`}
              title="Daily active users - percentage change from previous day"
            >
              <TrendingUp className={`h-4 w-4 ${usersChange >= 0 ? '' : 'rotate-180'}`} />
              <span>{usersChange.toFixed(1)}%</span>
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>Daily trends with next-day projection</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-54 w-full" config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            onMouseMove={(state) => {
              const activePayload = state.activePayload?.[0]?.payload;
              if (activePayload) {
                const index = chartData.findIndex(item => item.date === activePayload.date);
                if (index !== -1) {
                  setActiveIndex(index);
                }
              }
            }}
            onMouseLeave={() => {
              setActiveIndex(-1); 
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
              className="text-xs"
              fontSize={9}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            {Object.entries(chartConfig).map(([key, value]) => (
              <Line
                key={key}
                dataKey={key}
                type="linear"
                stroke={value.color}
                dot={{
                  r: 2.5,
                  fill: value.color,
                }}
                strokeDasharray={
                  lineDasharrays.find((line) => line.name === key)
                    ?.strokeDasharray || "0 0"
                }
              />
            ))}
            <Customized component={DasharrayCalculator} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface ChartDataPoint {
  x?: number;
  y?: number;
  value?: number | string;
  payload?: Record<string, unknown>;
}

interface ChartLineData {
  item: {
    props: {
      dataKey: string;
    };
  };
  props: {
    points: ChartDataPoint[];
  };
}

interface CustomizedChartProps {
  formattedGraphicalItems?: ChartLineData[];
}

interface LineConfig {
  name: string;
  splitIndex?: number;
  dashPattern?: number[];
  curveAdjustment?: number;
}

interface UseDynamicDasharrayProps {
  lineConfigs?: LineConfig[];
  splitIndex?: number;
  defaultDashPattern?: number[];
  curveAdjustment?: number;
}

type LineDasharray = {
  name: string;
  strokeDasharray: string;
}[];

export function useDynamicDasharray({
  lineConfigs = [],
  splitIndex = -2,
  defaultDashPattern: dashPattern = [5, 3],
  curveAdjustment = 1,
}: UseDynamicDasharrayProps): [
  (props: CustomizedChartProps) => null,
  LineDasharray
] {
  const [lineDasharrays, setLineDasharrays] = useState<LineDasharray>([]);

  const DasharrayCalculator = useCallback(
    (props: CustomizedChartProps): null => {
      const chartLines = props?.formattedGraphicalItems;
      const newLineDasharrays: LineDasharray = [];

      const calculatePathLength = (points: ChartDataPoint[]) => {
        return (
          points?.reduce((acc, point, index) => {
            if (index === 0) return acc;

            const prevPoint = points[index - 1];

            const dx = (point.x || 0) - (prevPoint.x || 0);
            const dy = (point.y || 0) - (prevPoint.y || 0);

            acc += Math.sqrt(dx * dx + dy * dy);
            return acc;
          }, 0) || 0
        );
      };

      chartLines?.forEach((line) => {
        const points = line?.props?.points;
        const totalLength = calculatePathLength(points || []);

        const lineName = line?.item?.props?.dataKey;
        const lineConfig = lineConfigs?.find(
          (config) => config?.name === lineName
        );
        const lineSplitIndex = lineConfig?.splitIndex ?? splitIndex;
        const dashedSegment = points?.slice(lineSplitIndex);
        const dashedLength = calculatePathLength(dashedSegment || []);

        if (!totalLength || !dashedLength) return;

        const solidLength = totalLength - dashedLength;
        const curveCorrectionFactor =
          lineConfig?.curveAdjustment ?? curveAdjustment;
        const adjustment = (solidLength * curveCorrectionFactor) / 100;
        const solidDasharrayPart = solidLength + adjustment;

        const targetDashPattern = lineConfig?.dashPattern || dashPattern;
        const patternSegmentLength =
          (targetDashPattern?.[0] || 0) + (targetDashPattern?.[1] || 0) || 1;
        const repetitions = Math.ceil(dashedLength / patternSegmentLength);
        const dashedPatternSegments = Array.from({ length: repetitions }, () =>
          targetDashPattern.join(" ")
        );

        const finalDasharray = `${solidDasharrayPart} ${dashedPatternSegments.join(
          " "
        )}`;
        newLineDasharrays.push({
          name: lineName!,
          strokeDasharray: finalDasharray,
        });
      });

      if (
        JSON.stringify(newLineDasharrays) !== JSON.stringify(lineDasharrays)
      ) {
        setTimeout(() => setLineDasharrays(newLineDasharrays), 0);
      }

      return null;
    },
    [splitIndex, curveAdjustment, lineConfigs, dashPattern, lineDasharrays]
  );

  return [DasharrayCalculator, lineDasharrays];
}
