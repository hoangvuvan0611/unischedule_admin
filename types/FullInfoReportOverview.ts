import {TotalVisitInfo} from "@/types/totalVisitInfo";
import {VisitDayInfo} from "@/types/visitsDayInfo";

export interface FullInfoReportOverview {
  totalVisits: TotalVisitInfo;
  visitsDayInfoDTO: VisitDayInfo;
}