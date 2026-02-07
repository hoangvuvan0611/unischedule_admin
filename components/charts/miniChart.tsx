'use client'
import {ChartConfig, ChartContainer} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid} from "recharts";

const chartData = [
  { month: "1", desktop: 186},
  { month: "2", desktop: 305},
  { month: "3", desktop: 237},
  { month: "4", desktop: 73},
  { month: "5", desktop: 29},
  { month: "6", desktop: 214},
  { month: "7", desktop: 50},
  { month: "8", desktop: 73},
  { month: "9", desktop: 209},
  { month: "10", desktop: 314},
];

export interface ChartData {
  month: string;
  day: string;
  desktop: number;
}

export interface MiniChartData {
  chartData: ChartData[];
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },

} satisfies ChartConfig;

interface MiniChartProps {
  height: string;
  width: string;
}

export default function MiniChart({height, width}: MiniChartProps,
                                  {chartData}: MiniChartData) {
  return (
    <ChartContainer config={chartConfig} className={`${height} ${width}`}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        {/*<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />*/}
      </BarChart>
    </ChartContainer>
  );
}