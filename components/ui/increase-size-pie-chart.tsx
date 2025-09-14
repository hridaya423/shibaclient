"use client";

import { LabelList, Pie, PieChart, Cell } from "recharts";

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
import { TrendingDown } from "lucide-react";

interface ReviewBacklogItem {
  label: string;
  value: number;
  color: string;
}

interface IncreaseSizePieChartProps {
  data?: ReviewBacklogItem[];
  title?: string;
  description?: string;
}

export function IncreaseSizePieChart({ 
  data = [], 
  title = "Review Backlog", 
  description = "Current review status breakdown" 
}: IncreaseSizePieChartProps) {
  
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    fill: item.color
  }));

  
  const sortedChartData = [...chartData].sort((a, b) => a.value - b.value);


const BASE_RADIUS = 50; 
const SIZE_INCREMENT = 10; 

const chartConfig = {
  value: {
    label: "Reviews",
  },
} satisfies ChartConfig;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>
          {title}
          <Badge
            variant="outline"
            className="text-slate-500 bg-slate-500/10 border-none ml-2"
          >
            <span>Total: {total}</span>
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {data.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: `${item.color}20`, color: item.color }}
            >
              {item.label}: {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" labelKey="name" />}
            />
            {sortedChartData.map((entry, index) => (
              <Pie
                key={`pie-${index}`}
                data={[entry]}
                innerRadius={30}
                outerRadius={BASE_RADIUS + index * SIZE_INCREMENT}
                dataKey="value"
                cornerRadius={4}
                startAngle={
                  
                  (sortedChartData
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.value, 0) /
                    sortedChartData.reduce((sum, d) => sum + d.value, 0)) *
                  360
                }
                endAngle={
                  
                  (sortedChartData
                    .slice(0, index + 1)
                    .reduce((sum, d) => sum + d.value, 0) /
                    sortedChartData.reduce((sum, d) => sum + d.value, 0)) *
                  360
                }
              >
                <Cell fill={entry.fill} />
                <LabelList
                  dataKey="value"
                  stroke="none"
                  fontSize={12}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => value.toString()}
                />
              </Pie>
            ))}
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
