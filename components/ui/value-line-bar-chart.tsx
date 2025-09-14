/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Bar, BarChart, Cell, XAxis, ReferenceLine, LabelList } from "recharts";
import React, { useMemo } from "react";
import { AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { JetBrains_Mono } from "next/font/google";
import { useMotionValueEvent, useSpring } from "framer-motion";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const CHART_MARGIN = 35;

interface SignupData {
  totalSignups: number;
  hackClubCommunity: number;
  referrals: number;
}

interface FunnelData {
  signedUp: number;
  onboarded: number;
  slack: number;
  connectedHackatime: number;
  logged10Hours: number;
  logged20Hours: number;
  logged30Hours: number;
  logged40Hours: number;
  logged50Hours: number;
  logged60Hours: number;
  logged70Hours: number;
  logged80Hours: number;
  logged90Hours: number;
  logged100Hours: number;
}

interface ValueLineBarChartProps {
  data?: SignupData | FunnelData | any;
  title?: string;
  description?: string;
  type?: 'signup' | 'funnel';
}

export function ValueLineBarChart({ data, title = "Analytics", description = "Data breakdown", type = 'signup' }: ValueLineBarChartProps) {
  
  const chartData = React.useMemo(() => {
    if (!data) return [];
    
    if (type === 'signup') {
      const signupData = data as SignupData;
      return [
        { name: "Total", value: signupData.totalSignups || 0 },
        { name: "Hack Club", value: signupData.hackClubCommunity || 0 },
        { name: "Referrals", value: signupData.referrals || 0 },
      ];
    } else {
      const funnelData = data as FunnelData;
      const allStepsData = [
        { name: "Signed Up", value: funnelData.signedUp || 0, prev: null },
        { name: "Onboarded", value: funnelData.onboarded || 0, prev: funnelData.signedUp || 0 },
        { name: "Slack", value: funnelData.slack || 0, prev: funnelData.onboarded || 0 },
        { name: "Hackatime", value: funnelData.connectedHackatime || 0, prev: funnelData.slack || 0 },
        { name: "10h+", value: funnelData.logged10Hours || 0, prev: funnelData.connectedHackatime || 0 },
        { name: "20h+", value: funnelData.logged20Hours || 0, prev: funnelData.logged10Hours || 0 },
        { name: "30h+", value: funnelData.logged30Hours || 0, prev: funnelData.logged20Hours || 0 },
        { name: "40h+", value: funnelData.logged40Hours || 0, prev: funnelData.logged30Hours || 0 },
        { name: "50h+", value: funnelData.logged50Hours || 0, prev: funnelData.logged40Hours || 0 },
        { name: "60h+", value: funnelData.logged60Hours || 0, prev: funnelData.logged50Hours || 0 },
        { name: "70h+", value: funnelData.logged70Hours || 0, prev: funnelData.logged60Hours || 0 },
        { name: "80h+", value: funnelData.logged80Hours || 0, prev: funnelData.logged70Hours || 0 },
        { name: "90h+", value: funnelData.logged90Hours || 0, prev: funnelData.logged80Hours || 0 },
        { name: "100h+", value: funnelData.logged100Hours || 0, prev: funnelData.logged90Hours || 0 },
      ];
      
      
      let lastNonZeroIndex = -1;
      for (let i = allStepsData.length - 1; i >= 0; i--) {
        if (allStepsData[i].value > 0) {
          lastNonZeroIndex = i;
          break;
        }
      }
      
      const hackatimeIndex = 3; 
      const finalSteps = allStepsData.slice(0, lastNonZeroIndex + 1);
      
      
      return finalSteps.map((step, index) => {
        let conversionRate = '';
        
        if (index > 0) {
          const prevConversion = step.prev && step.prev > 0 ? ((step.value / step.prev) * 100).toFixed(1) : '0.0';
          const signupsConversion = funnelData.signedUp > 0 ? ((step.value / funnelData.signedUp) * 100).toFixed(1) : '0.0';
          conversionRate = `${prevConversion}% | ${signupsConversion}%`;
        }

        return {
          name: step.name,
          value: step.value,
          conversionRate
        };
      });
    }
  }, [data, type]);

const chartConfig = {
  value: {
    label: type === 'signup' ? "Signups" : "Users",
    color: "#60a5fa",
  },
} satisfies ChartConfig;
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined
  );

  const maxValueIndex = React.useMemo(() => {
    
    if (activeIndex !== undefined) {
      return { index: activeIndex, value: chartData[activeIndex]?.value || 0 };
    }
    
    return chartData.reduce(
      (max, data, index) => {
        return data.value > max.value ? { index, value: data.value } : max;
      },
      { index: 0, value: 0 }
    );
  }, [activeIndex, chartData]);

  const maxValueIndexSpring = useSpring(maxValueIndex.value, {
    stiffness: 100,
    damping: 20,
  });

  const [springyValue, setSpringyValue] = React.useState(maxValueIndex.value);

  useMotionValueEvent(maxValueIndexSpring, "change", (latest) => {
    setSpringyValue(Number(latest.toFixed(0)));
  });

  React.useEffect(() => {
    maxValueIndexSpring.set(maxValueIndex.value);
  }, [maxValueIndex.value, maxValueIndexSpring]);

  
  const formatPercentageNonZero = (value: number): string => {
    if (value === 0) return '0.0';
    if (value < 0.1) return '0.1'; 
    return value.toFixed(1);
  };

  
  const dynamicConversions = useMemo(() => {
    if (type !== 'funnel' || !data) return null;

    const currentIndex = activeIndex !== undefined ? activeIndex : maxValueIndex.index;
    const currentItem = chartData[currentIndex];

    if (!currentItem || currentIndex === 0) {
      return null; 
    }

    const currentData = data as FunnelData;
    const currentValue = currentItem.value;

    
    const prevIndex = currentIndex - 1;
    const prevItem = chartData[prevIndex];
    const prevConversionRaw = prevItem && prevItem.value > 0
      ? (currentValue / prevItem.value) * 100
      : 0;
    const prevConversion = formatPercentageNonZero(prevConversionRaw);

    
    const signupsConversionRaw = currentData.signedUp > 0
      ? (currentValue / currentData.signedUp) * 100
      : 0;
    const signupsConversion = formatPercentageNonZero(signupsConversionRaw);

    
    const hackatimeIndex = 4; 
    let hackatimeConversion = null;
    if (currentIndex >= hackatimeIndex && currentData.connectedHackatime > 0) {
      const hackatimeConversionRaw = (currentValue / currentData.connectedHackatime) * 100;
      hackatimeConversion = formatPercentageNonZero(hackatimeConversionRaw);
    }

    return {
      fromPrevious: prevConversion,
      fromSignups: signupsConversion,
      fromHackatime: hackatimeConversion,
      previousStepName: prevItem ? prevItem.name : 'Previous'
    };
  }, [activeIndex, maxValueIndex.index, chartData, data, type]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex flex-col">
            <div className="flex items-center">
              <span
                className={cn(jetBrainsMono.className, "text-2xl tracking-tighter")}
              >
                {maxValueIndex.value.toLocaleString()}
              </span>
            </div>
            
            {dynamicConversions && (
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-emerald-600 bg-emerald-600/10 border-none text-xs px-2 py-1"
                  title={`Conversion from ${dynamicConversions.previousStepName}`}
                >
                  <span>{dynamicConversions.fromPrevious}% from {dynamicConversions.previousStepName}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="text-violet-600 bg-violet-600/10 border-none text-xs px-2 py-1"
                  title="Conversion from total signups"
                >
                  <span>{dynamicConversions.fromSignups}% from Signups</span>
                </Badge>
                
                {dynamicConversions.fromHackatime && (
                  <Badge
                    variant="outline"
                    className="text-blue-600 bg-blue-600/10 border-none text-xs px-2 py-1"
                    title="Conversion from Hackatime users"
                  >
                    <span>{dynamicConversions.fromHackatime}% from Hackatime</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              onMouseLeave={() => setActiveIndex(undefined)}
              margin={{
                left: CHART_MARGIN,
                bottom: 20, 
              }}
              barCategoryGap="10%"
            >
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={8}
                axisLine={false}
                tickFormatter={(value) => value}
                className="text-xs"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={4}
                minPointSize={8}
              >
                {chartData.map((_, index) => (
                  <Cell
                    className="duration-200 cursor-pointer"
                    opacity={index === maxValueIndex.index ? 1 : 0.2}
                    key={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    style={{
                      minHeight: '12px' 
                    }}
                  />
                ))}
              </Bar>
              <ReferenceLine
                opacity={0.4}
                y={springyValue}
                stroke="var(--secondary-foreground)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={<CustomReferenceLabel value={maxValueIndex.value} />}
              />
            </BarChart>
          </ChartContainer>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

interface CustomReferenceLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
  };
  value: number;
}

const CustomReferenceLabel: React.FC<CustomReferenceLabelProps> = (props) => {
  const { viewBox, value } = props;
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;

  
  const width = React.useMemo(() => {
    const characterWidth = 8; 
    const padding = 10;
    return value.toString().length * characterWidth + padding;
  }, [value]);

  return (
    <>
      <rect
        x={x - CHART_MARGIN}
        y={y - 9}
        width={width}
        height={18}
        fill="var(--secondary-foreground)"
        rx={4}
      />
      <text
        fontWeight={600}
        x={x - CHART_MARGIN + 6}
        y={y + 4}
        fill="var(--primary-foreground)"
      >
        {value}
      </text>
    </>
  );
};
