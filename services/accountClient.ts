import {ApiResponseData} from "@/types/response";
import appClient from "@/services/appClient";
import {FullInfoReportOverview} from "@/types/FullInfoReportOverview";

export const accountApi = {
  fullInfoReportOverview: (): Promise<ApiResponseData<FullInfoReportOverview>> => appClient.post(`/account/fullInfoReportOverview`),
}