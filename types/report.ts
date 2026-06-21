export interface AccountStatistics {
  totalAccounts: number;
  accountsCreatedToday: number;
  accountsCreatedThisWeek: number;
  accountsCreatedThisMonth: number;
  accountsCreatedThisYear: number;
  lastAccountCreated: string | null;
  oldestAccountCreated: string | null;
}

export interface CategoryCount {
  label: string;
  value: number;
}

export interface PeriodGrowth {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentCount: number;
  previousCount: number;
  difference: number;
  growthRatePercent: number;
}

export interface AccountAnalytics {
  generatedAt: string;
  totalAccounts: number;
  accountTypeChart: CategoryCount[];
  dailyChart: CategoryCount[];
  hourlyChart: CategoryCount[];
  growth: PeriodGrowth | null;
  statistics: AccountStatistics | null;
}

export interface AccessLogAnalytics {
  generatedAt: string;
  totalAccessLogs: number;
  accountTypeChart: CategoryCount[];
  dailyChart: CategoryCount[];
  hourlyChart: CategoryCount[];
  growth: PeriodGrowth | null;
}

export interface AccountReport {
  id: string;
  username: string;
  accountType?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  daysSinceCreated?: number | null;
  accountStatus?: string | null;
}

export interface AccountBatchReport {
  batchCode: string;
  batchName: string;
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  dormantAccounts: number;
  unknownAccounts: number;
  oldestAccountInBatch: string | null;
  newestAccountInBatch: string | null;
  accounts?: AccountReport[];
}

export interface AccountBatchSummary {
  totalAccounts: number;
  totalBatches: number;
  largestBatch: string | null;
  smallestBatch: string | null;
  batchReports: AccountBatchReport[];
}

export interface AccountBatchStats {
  batchCode: string;
  batchName: string;
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  dormantAccounts: number;
  unknownAccounts: number;
  oldestAccountInBatch: string | null;
  newestAccountInBatch: string | null;
}

export interface AccountBatchStatsSummary {
  totalAccounts: number;
  totalBatches: number;
  largestBatch: string | null;
  smallestBatch: string | null;
  totalActiveAccounts: number;
  totalInactiveAccounts: number;
  totalDormantAccounts: number;
  totalUnknownAccounts: number;
  batchStats: AccountBatchStats[];
}

export interface UserAccessLogInfo {
  id: string;
  username: string;
  osOfDevice: string | null;
  accountType?: string | null;
  createdAt: string;
}

export interface ReportDashboard {
  generatedAt: string;
  accountStatistics: AccountStatistics | null;
  accountBatchSummary: AccountBatchSummary | null;
  accountBatchStatsSummary: AccountBatchStatsSummary | null;
  totalReviews: number;
  totalDevices: number;
  totalAccessLogs: number;
  recentAccounts: AccountReport[];
  allAccounts: AccountReport[];
  accountBatches: AccountBatchReport[];
  accountBatchStats: AccountBatchStats[];
  accountStatusChart: CategoryCount[];
  accountCreationChart: CategoryCount[];
  accessLogOsChart: CategoryCount[];
  deviceOsChart: CategoryCount[];
  reviewTimelineChart: CategoryCount[];
  accessLogAnalytics: AccessLogAnalytics | null;
  accountAnalytics: AccountAnalytics | null;
}
