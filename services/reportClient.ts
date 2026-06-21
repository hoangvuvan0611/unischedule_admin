import appClient from "@/services/appClient";
import { ApiResponseData } from "@/types/response";
import { PageResponse } from "@/types/pagination";
import {
  AccessLogAnalytics,
  AccountBatchStatsSummary,
  AccountBatchSummary,
  AccountAnalytics,
  AccountReport,
  AccountStatistics,
  ReportDashboard,
  UserAccessLogInfo,
} from "@/types/report";

export const reportApi = {
  getDashboard: (): Promise<ApiResponseData<ReportDashboard>> =>
    appClient.get("/report/dashboard"),

  getAccountStatistics: (): Promise<ApiResponseData<AccountStatistics>> =>
    appClient.get("/report/accounts/statistics"),

  getAccountBatchSummary: (): Promise<ApiResponseData<AccountBatchSummary>> =>
    appClient.get("/report/accounts/batches/summary"),

  getAccountBatchStatsSummary: (): Promise<ApiResponseData<AccountBatchStatsSummary>> =>
    appClient.get("/report/accounts/batches/stats/summary"),

  getAccountAnalytics: (
    days = 30
  ): Promise<ApiResponseData<AccountAnalytics>> =>
    appClient.get("/report/accounts/analytics", {
      params: { days },
    }),

  getAccessLogAnalytics: (
    days = 30
  ): Promise<ApiResponseData<AccessLogAnalytics>> =>
    appClient.get("/report/access-logs/analytics", {
      params: { days },
    }),

  getRecentAccounts: (
    limit = 10
  ): Promise<ApiResponseData<AccountReport[]>> =>
    appClient.get("/report/accounts/recent", {
      params: { limit },
    }),

  getRecentUserAccessLogs: (
    limit = 10
  ): Promise<ApiResponseData<UserAccessLogInfo[]>> =>
    appClient.get("/user-access-logs/recent", {
      params: { limit },
    }),

  getAllAccounts: (): Promise<ApiResponseData<AccountReport[]>> =>
    appClient.get("/report/accounts/all"),

  getAllBatches: (): Promise<ApiResponseData<AccountBatchSummary["batchReports"]>> =>
    appClient.get("/report/accounts/batches/all"),

  queryAccounts: (params?: Record<string, string | number | undefined>): Promise<ApiResponseData<PageResponse<AccountReport>>> =>
    appClient.get("/account/query", { params }),

  queryUserAccessLogs: (
    params?: Record<string, string | number | undefined>
  ): Promise<ApiResponseData<PageResponse<UserAccessLogInfo>>> =>
    appClient.get("/user-access-logs", { params }),
};
