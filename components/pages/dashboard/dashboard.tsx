'use client';

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Download,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  Square,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { reportApi } from "@/services/reportClient";
import { AccountReport, ReportDashboard, UserAccessLogInfo } from "@/types/report";
import { formatNullableText, formatNumber, getAccountAgeDays } from "@/lib/report";
import { cn } from "@/lib/utils";

type DashboardState = {
  dashboard: ReportDashboard | null;
  recentLogs: UserAccessLogInfo[];
  loading: boolean;
  error: string | null;
};

type UserRow = {
  id: string;
  username: string;
  initials: string;
  createdAt: string;
  lastLoginLabel: string;
  status: string;
  accountType: string;
};

const statusPalette: Record<string, { label: string; dot: string; pill: string; fill: string }> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700",
    fill: "#22a77a",
  },
  inactive: {
    label: "Không HĐ",
    dot: "bg-stone-400",
    pill: "bg-stone-100 text-stone-700",
    fill: "#8b8a83",
  },
  dormant: {
    label: "Mới",
    dot: "bg-indigo-500",
    pill: "bg-indigo-50 text-indigo-700",
    fill: "#8277dc",
  },
  unknown: {
    label: "Chờ xác thực",
    dot: "bg-indigo-200",
    pill: "bg-indigo-50 text-indigo-700",
    fill: "#ebe8ff",
  },
  locked: {
    label: "Bị khoá",
    dot: "bg-red-500",
    pill: "bg-red-50 text-red-700",
    fill: "#ef4e4e",
  },
};

const avatarColors = [
  "bg-indigo-50 text-indigo-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
];

function normalizeStatus(status?: string | null) {
  const value = (status ?? "unknown").toLowerCase();
  if (value.includes("lock")) return "locked";
  if (value === "inactive") return "inactive";
  if (value === "dormant") return "dormant";
  if (value === "active") return "active";
  return "unknown";
}

function initials(username: string) {
  return username
    .split(/[._\-\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "US";
}

function relativeTime(value?: string | null) {
  if (!value) return "chưa có";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "chưa có";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function shortDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}

function KpiCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-[10px] border border-neutral-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <div className={cn("mt-1", tone)}>{icon}</div>
        <div>
          <div className="text-[15px] font-semibold leading-5 text-neutral-700">{title}</div>
          <div className="mt-4 text-4xl font-semibold tracking-normal text-neutral-950">{value}</div>
          <div className="mt-3 text-sm font-semibold text-emerald-700">{detail}</div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[10px] border border-neutral-200 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)]", className)}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-normal text-neutral-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const key = normalizeStatus(status);
  const item = statusPalette[key] ?? statusPalette.unknown;
  return (
    <span className={cn("inline-flex min-w-[92px] items-center justify-center gap-2 rounded-[8px] px-3 py-2 text-sm font-semibold", item.pill)}>
      <span className={cn("h-2 w-2 rounded-full", item.dot)} />
      {item.label}
    </span>
  );
}

export default function DashBoard() {
  const [state, setState] = useState<DashboardState>({
    dashboard: null,
    recentLogs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const [dashboardResult, logsResult] = await Promise.allSettled([
        reportApi.getDashboard(),
        reportApi.getRecentUserAccessLogs(30),
      ]);

      if (!alive) return;

      const dashboard = dashboardResult.status === "fulfilled" && dashboardResult.value.status === 200
        ? dashboardResult.value.data
        : null;
      const recentLogs = logsResult.status === "fulfilled" && logsResult.value.status === 200
        ? logsResult.value.data ?? []
        : [];

      setState({
        dashboard,
        recentLogs,
        loading: false,
        error: dashboard ? null : "Không tải được dữ liệu dashboard",
      });
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const dashboard = state.dashboard;
  const stats = dashboard?.accountStatistics;
  const batchStats = dashboard?.accountBatchStatsSummary;
  const allAccounts = dashboard?.allAccounts ?? [];

  const statusData = useMemo(() => {
    const source = dashboard?.accountStatusChart?.length
      ? dashboard.accountStatusChart.map((item) => ({ name: item.label, value: item.value }))
      : [
          { name: "Active", value: batchStats?.totalActiveAccounts ?? 0 },
          { name: "Không hoạt động", value: batchStats?.totalInactiveAccounts ?? 0 },
          { name: "Bị khoá", value: 0 },
          { name: "Chờ xác thực", value: batchStats?.totalUnknownAccounts ?? 0 },
        ];

    const total = source.reduce((sum, item) => sum + item.value, 0);
    return source
      .filter((item) => item.value > 0)
      .map((item, index) => ({
        ...item,
        percent: total ? (item.value / total) * 100 : 0,
        color: [statusPalette.active.fill, statusPalette.inactive.fill, statusPalette.locked.fill, statusPalette.unknown.fill][index % 4],
      }));
  }, [dashboard, batchStats]);

  const registrationChart = useMemo(() => {
    const source = dashboard?.accountAnalytics?.dailyChart?.length
      ? dashboard.accountAnalytics.dailyChart
      : dashboard?.accountCreationChart ?? [];
    const data = source.slice(-7);
    return data.length ? data : [
      { label: "T2", value: 0 },
      { label: "T3", value: 0 },
      { label: "T4", value: 0 },
      { label: "T5", value: 0 },
      { label: "T6", value: 0 },
      { label: "T7", value: 0 },
      { label: "CN", value: 0 },
    ];
  }, [dashboard]);

  const userRows = useMemo<UserRow[]>(() => {
    const logByUsername = new Map<string, UserAccessLogInfo>();
    for (const log of state.recentLogs) {
      if (!logByUsername.has(log.username)) logByUsername.set(log.username, log);
    }

    const accounts = dashboard?.recentAccounts?.length ? dashboard.recentAccounts : dashboard?.allAccounts ?? [];
    return accounts.slice(0, 8).map((account) => {
      const lastLog = logByUsername.get(account.username);
      return {
        id: account.id,
        username: account.username,
        initials: initials(account.username),
        createdAt: account.createdAt,
        lastLoginLabel: relativeTime(lastLog?.createdAt),
        status: normalizeStatus(account.accountStatus),
        accountType: formatNullableText(account.accountType),
      };
    });
  }, [dashboard, state.recentLogs]);

  const hourlyData = useMemo(() => {
    const data = dashboard?.accessLogAnalytics?.hourlyChart ?? [];
    if (data.length > 0) return data.slice(0, 24);
    const counts = new Map<string, number>();
    for (const log of state.recentLogs) {
      const date = new Date(log.createdAt);
      if (Number.isNaN(date.getTime())) continue;
      const key = `${String(date.getHours()).padStart(2, "0")}:00`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from({ length: 24 }, (_, hour) => {
      const label = `${String(hour).padStart(2, "0")}:00`;
      return { label, value: counts.get(label) ?? 0 };
    });
  }, [dashboard, state.recentLogs]);

  const peakHours = useMemo(() => {
    return [...hourlyData].sort((a, b) => b.value - a.value).slice(0, 3);
  }, [hourlyData]);

  const inactiveCount = batchStats?.totalInactiveAccounts ?? allAccounts.filter((item) => normalizeStatus(item.accountStatus) === "inactive").length;
  const dormantCount = batchStats?.totalDormantAccounts ?? allAccounts.filter((item) => normalizeStatus(item.accountStatus) === "dormant").length;
  const oldestAccount = allAccounts.reduce<AccountReport | null>((oldest, account) => {
    if (!oldest) return account;
    return new Date(account.createdAt).getTime() < new Date(oldest.createdAt).getTime() ? account : oldest;
  }, null);

  const alerts = [
    {
      title: `Không hoạt động lâu - ${formatNumber(inactiveCount)} tài khoản cần rà soát`,
      detail: "Hôm nay · Tự động phát hiện",
      icon: <ShieldAlert className="h-4 w-4" />,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      title: `IP lạ - ${state.recentLogs[0]?.username ?? "người dùng"} đăng nhập từ thiết bị mới`,
      detail: `${relativeTime(state.recentLogs[0]?.createdAt)} · Cần xem xét`,
      icon: <AlertTriangle className="h-4 w-4" />,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: `Tài khoản cũ - ${oldestAccount?.username ?? "chưa có dữ liệu"} đã tạo ${formatNumber(getAccountAgeDays(oldestAccount?.createdAt) ?? 0)} ngày`,
      detail: "Theo dõi vòng đời account",
      icon: <LockKeyhole className="h-4 w-4" />,
      tone: "bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="min-h-full bg-[#f7f6f1] px-5 py-6 text-neutral-950 lg:px-8">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        {state.error ? (
          <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {state.error}
          </div>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Tổng tài khoản"
            value={formatNumber(stats?.totalAccounts ?? batchStats?.totalAccounts)}
            detail={`+${formatNumber(stats?.accountsCreatedThisMonth)} tháng này`}
            icon={<Square className="h-4 w-4" />}
            tone="text-indigo-500"
          />
          <KpiCard
            title="Đang hoạt động"
            value={formatNumber(batchStats?.totalActiveAccounts)}
            detail="DAU 7 ngày qua"
            icon={<Square className="h-4 w-4" />}
            tone="text-emerald-600"
          />
          <KpiCard
            title="Đăng ký hôm nay"
            value={formatNumber(stats?.accountsCreatedToday)}
            detail="+12% vs hôm qua"
            icon={<Square className="h-4 w-4" />}
            tone="text-indigo-600"
          />
          <KpiCard
            title="Tài khoản khoá"
            value={formatNumber(dormantCount)}
            detail="+5 trong 24h"
            icon={<Square className="h-4 w-4" />}
            tone="text-red-500"
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <Panel
            title="Đăng ký theo ngày"
            action={
              <div className="flex gap-2">
                {["7N", "30N", "90N"].map((item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={cn(
                      "rounded-[10px] border px-3 py-1 text-sm font-semibold",
                      index === 0 ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-neutral-200 bg-[#f7f6f1] text-neutral-600"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-[190px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={registrationChart} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), "Đăng ký"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {registrationChart.map((entry, index) => (
                      <Cell key={entry.label} fill={index === registrationChart.length - 1 ? "#7b71d8" : "#c9c5f2"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Trạng thái tài khoản">
            <div className="grid items-center gap-6 md:grid-cols-[0.85fr_1fr]">
              <div className="h-[190px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={2}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatNumber(Number(value)), "Tài khoản"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-start gap-3 text-sm font-medium text-neutral-700">
                    <span className="mt-1.5 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name} - {item.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <Panel
          title="Danh sách người dùng"
          action={
            <div className="flex flex-wrap gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-neutral-200 bg-[#f7f6f1] px-3 py-2 text-sm font-semibold text-neutral-700">
                <Download className="h-4 w-4" />
                Xuất CSV
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-[10px] border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                <Plus className="h-4 w-4" />
                Thêm user
              </button>
            </div>
          }
        >
          <div className="mb-6 flex flex-wrap gap-2">
            {["Tất cả", "Active", "Không hoạt động", "Bị khoá", "Mới 7 ngày"].map((item, index) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold",
                  index === 0 ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-neutral-200 bg-white text-neutral-700"
                )}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left">
              <thead className="text-sm uppercase tracking-normal text-neutral-600">
                <tr className="border-b border-neutral-200">
                  <th className="px-3 py-4 font-semibold">ID</th>
                  <th className="px-3 py-4 font-semibold">Username</th>
                  <th className="px-3 py-4 font-semibold">Ngày tạo</th>
                  <th className="px-3 py-4 font-semibold">Đăng nhập gần nhất</th>
                  <th className="px-3 py-4 font-semibold">Trạng thái</th>
                  <th className="px-3 py-4 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {userRows.map((item, index) => (
                  <tr key={item.id} className="border-b border-neutral-200 last:border-b-0">
                    <td className="px-3 py-5 text-sm font-medium text-neutral-500">{item.id.slice(0, 10)}</td>
                    <td className="px-3 py-5">
                      <div className="flex items-center gap-3">
                        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold", avatarColors[index % avatarColors.length])}>
                          {item.initials}
                        </span>
                        <div>
                          <div className="font-semibold text-neutral-950">{item.username}</div>
                          <div className="text-xs font-medium text-neutral-500">{item.accountType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-5 text-sm font-medium text-neutral-700">{shortDate(item.createdAt)}</td>
                    <td className="px-3 py-5 text-sm font-semibold text-neutral-950">{item.lastLoginLabel}</td>
                    <td className="px-3 py-5"><StatusPill status={item.status} /></td>
                    <td className="px-3 py-5">
                      <button type="button" className="inline-flex h-10 w-14 items-center justify-center rounded-[10px] border border-neutral-300 bg-white text-neutral-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!state.loading && userRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-sm font-medium text-neutral-500">
                      Chưa có dữ liệu người dùng.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.7fr]">
          <Panel title="Cảnh báo bất thường">
            <div className="space-y-0">
              {alerts.map((item) => (
                <div key={item.title} className="grid grid-cols-[48px_1fr] gap-4 border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-[10px]", item.tone)}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold leading-6 text-neutral-950">{item.title}</div>
                    <div className="mt-1 text-sm font-medium text-neutral-500">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Hoạt động theo giờ">
            <div className="mb-5 text-sm font-medium text-neutral-600">Hôm nay - số lượt đăng nhập</div>
            <div className="flex h-16 items-end gap-1">
              {hourlyData.slice(0, 24).map((item, index) => {
                const max = Math.max(...hourlyData.map((hour) => hour.value), 1);
                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="w-full rounded-full bg-indigo-300"
                    style={{
                      height: `${18 + (item.value / max) * 42}px`,
                      opacity: index % 3 === 0 ? 0.95 : 0.45,
                    }}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-xs font-semibold text-neutral-500">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
            <div className="mt-7 text-sm font-semibold text-neutral-700">Giờ cao điểm</div>
            <div className="mt-4 space-y-3">
              {peakHours.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-neutral-200 pb-3 text-sm last:border-b-0">
                  <span className="font-medium text-neutral-600">{item.label}</span>
                  <span className="font-semibold text-neutral-950">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Thiết bị">
            <div className="flex items-center gap-3 text-3xl font-semibold">
              <Activity className="h-6 w-6 text-cyan-700" />
              {formatNumber(dashboard?.totalDevices)}
            </div>
            <div className="mt-3 text-sm font-medium text-neutral-500">Thiết bị đã ghi nhận</div>
          </Panel>
          <Panel title="Review">
            <div className="flex items-center gap-3 text-3xl font-semibold">
              <BarChart3 className="h-6 w-6 text-amber-700" />
              {formatNumber(dashboard?.totalReviews)}
            </div>
            <div className="mt-3 text-sm font-medium text-neutral-500">Phản hồi từ người dùng</div>
          </Panel>
          <Panel title="Tổng log">
            <div className="flex items-center gap-3 text-3xl font-semibold">
              <Users className="h-6 w-6 text-indigo-700" />
              {formatNumber(dashboard?.totalAccessLogs)}
            </div>
            <div className="mt-3 text-sm font-medium text-neutral-500">Phiên truy cập đã lưu</div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
