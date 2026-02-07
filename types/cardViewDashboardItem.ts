import {LucideIcon} from "lucide-react";
import {ChartData} from "@/components/charts/miniChart";

export interface CardViewDashboardItem {
  title: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
  mainValue: number;
  chartData: ChartData[];
}