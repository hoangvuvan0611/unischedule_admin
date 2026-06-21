'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertCircle, BarChart3, CalendarRange, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportApi } from "@/services/reportClient";
import { PageResponse } from "@/types/pagination";
import { UserAccessLogInfo } from "@/types/report";
import { formatDateTime, formatNullableText, formatNumber } from "@/lib/report";
import { cn } from "@/lib/utils";
import {
  buildTimeBuckets,
  getDefaultGranularityForPreset,
  getTimePresetRange,
  TimeGranularity,
  TimePreset,
  toDateTimeApiValue,
} from "@/lib/reportTime";

type QueryState = {
  username: string;
  osOfDevice: string;
  accountType: string;
  createdFrom: string;
  createdTo: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
};

const INITIAL_QUERY: QueryState = {
  username: "",
  osOfDevice: "",
  accountType: "",
  createdFrom: "",
  createdTo: "",
  page: 0,
  size: 20,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const granularityOptions: { value: TimeGranularity; label: string }[] = [
  { value: "hour", label: "Theo giờ" },
  { value: "day", label: "Theo ngày" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
];

const presetOptions: { value: TimePreset; label: string }[] = [
  { value: "today", label: "Hôm nay" },
  { value: "sevenDays", label: "7 ngày" },
  { value: "thirtyDays", label: "30 ngày" },
  { value: "thisMonth", label: "Tháng này" },
  { value: "thisYear", label: "Năm nay" },
];

const osColors = ["#2563eb", "#0f766e", "#f59e0b", "#e11d48", "#64748b", "#7c3aed"];

export default function LogsPage() {
  const [query, setQuery] = useState<QueryState>(INITIAL_QUERY);
  const [granularity, setGranularity] = useState<TimeGranularity>("hour");
  const [activePreset, setActivePreset] = useState<TimePreset | null>(null);
  const [selectedLog, setSelectedLog] = useState<UserAccessLogInfo | null>(null);
  const [data, setData] = useState<PageResponse<UserAccessLogInfo> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let alive = true;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await reportApi.queryUserAccessLogs({
          username: query.username || undefined,
          osOfDevice: query.osOfDevice || undefined,
          accountType: query.accountType || undefined,
          createdFrom: toDateTimeApiValue(query.createdFrom),
          createdTo: toDateTimeApiValue(query.createdTo),
          page: query.page,
          size: query.size,
          sortBy: query.sortBy,
          sortDirection: query.sortDirection,
        });
        if (!alive || requestId !== requestIdRef.current) return;

        if (response.status === 200) {
          setData(response.data);
        } else {
          setError(response.message || "Không tải được log truy cập");
        }
      } catch (err) {
        if (alive && requestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : "Không tải được log truy cập");
        }
      } finally {
        if (alive && requestId === requestIdRef.current) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [query]);

  const stats = useMemo(() => ({
    total: data?.totalElements ?? 0,
    current: data?.items?.length ?? 0,
    page: data?.page ?? 0,
    totalPages: data?.totalPages ?? 0,
  }), [data]);

  const timeBuckets = useMemo(() => {
    return buildTimeBuckets(data?.items ?? [], (item) => item.createdAt, granularity);
  }, [data, granularity]);

  const topTimeBuckets = useMemo(() => {
    return [...timeBuckets].sort((a, b) => b.total - a.total).slice(0, 6);
  }, [timeBuckets]);

  const timeChartKey = `${query.createdFrom}-${query.createdTo}-${granularity}-${query.page}-${query.size}`;

  const osBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of data?.items ?? []) {
      const key = log.osOfDevice || "Không xác định";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const userBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of data?.items ?? []) {
      counts.set(log.username, (counts.get(log.username) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([username, total]) => ({ username, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  function applyPreset(preset: TimePreset) {
    setActivePreset(preset);
    setGranularity(getDefaultGranularityForPreset(preset));
    setSelectedLog(null);
    setQuery((prev) => ({
      ...prev,
      ...getTimePresetRange(preset),
      page: 0,
    }));
  }

  return (
    <div className="min-h-full overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-slate-100">
            <Activity className="h-4 w-4" />
            Log truy cập
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Danh sách truy cập từ app mobile</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Lọc theo username, hệ điều hành thiết bị và khoảng thời gian để truy vết hành vi đăng nhập.
          </p>
        </section>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Filter trực tiếp qua endpoint user-access-logs, hỗ trợ soi chi tiết theo giờ, ngày, tháng hoặc năm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-2">
              {presetOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => applyPreset(item.value)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium hover:bg-white",
                    activePreset === item.value
                      ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  )}
                >
                  <CalendarRange className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-8">
              <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Username" value={query.username} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, username: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="OS / device" value={query.osOfDevice} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, osOfDevice: e.target.value }))} />
              <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Loại account" value={query.accountType} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, accountType: e.target.value }))} />
              <input type="datetime-local" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.createdFrom} onChange={(e) => { setActivePreset(null); setQuery((prev) => ({ ...prev, page: 0, createdFrom: e.target.value })); }} />
              <input type="datetime-local" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.createdTo} onChange={(e) => { setActivePreset(null); setQuery((prev) => ({ ...prev, page: 0, createdTo: e.target.value })); }} />
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={granularity} onChange={(e) => { setActivePreset(null); setGranularity(e.target.value as TimeGranularity); }}>
                {granularityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.size} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, size: Number(e.target.value) }))}>
                {[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}/trang</option>)}
              </select>
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800" onClick={() => setQuery((prev) => ({ ...prev, page: 0 }))}>
                <Search className="h-4 w-4" />
                Tải lại
              </button>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-700" />
                Thống kê truy cập theo thời gian
              </CardTitle>
              <CardDescription>Gom các log đang hiển thị theo giờ, ngày, tháng hoặc năm để soi nhịp truy cập.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px]">
                {timeBuckets.length > 0 ? (
                  <ResponsiveContainer key={timeChartKey} width="100%" height="100%">
                    <BarChart data={timeBuckets} margin={{ left: 0, right: 12, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis tickLine={false} axisLine={false} width={40} />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), "Lượt truy cập"]} />
                      <Bar dataKey="total" fill="#2563eb" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Chưa có dữ liệu phù hợp để thống kê theo thời gian.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Bucket truy cập nổi bật</CardTitle>
              <CardDescription>Các mốc có nhiều log nhất trong trang hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {topTimeBuckets.length > 0 ? topTimeBuckets.map((bucket) => (
                <div key={bucket.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-950">{bucket.label}</div>
                    <div className="text-lg font-semibold text-slate-950">{formatNumber(bucket.total)}</div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.min(100, (bucket.total / Math.max(1, stats.current)) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Chưa có bucket thời gian để hiển thị.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Phân bố thiết bị / OS</CardTitle>
              <CardDescription>Nhìn nhanh log theo hệ điều hành hoặc tên thiết bị backend ghi nhận.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 lg:grid-cols-[0.9fr_1fr]">
              <div className="h-[260px]">
                {osBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={osBreakdown} dataKey="value" nameKey="name" innerRadius={56} outerRadius={94} paddingAngle={4}>
                        {osBreakdown.map((entry, index) => (
                          <Cell key={entry.name} fill={osColors[index % osColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), "Log"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                    Chưa có dữ liệu thiết bị.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {osBreakdown.slice(0, 8).map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: osColors[index % osColors.length] }} />
                      {item.name}
                    </div>
                    <div className="font-semibold text-slate-950">{formatNumber(item.value)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>User truy cập nhiều</CardTitle>
              <CardDescription>Top username xuất hiện nhiều nhất trong trang log hiện tại.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {userBreakdown.length > 0 ? userBreakdown.map((item) => (
                <div key={item.username} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-slate-950">{item.username}</div>
                    <div className="text-lg font-semibold text-slate-950">{formatNumber(item.total)}</div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${Math.min(100, (item.total / Math.max(1, stats.current)) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Chưa có user để thống kê.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {selectedLog ? (
          <Card className="border-blue-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Chi tiết log truy cập</CardTitle>
              <CardDescription>Thông tin chi tiết của bản ghi đang chọn trong bảng.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">ID</div>
                <div className="mt-1 break-all font-medium text-slate-950">{selectedLog.id}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Username</div>
                <div className="mt-1 font-medium text-slate-950">{selectedLog.username}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Loại account</div>
                <div className="mt-1 font-medium text-slate-950">{formatNullableText(selectedLog.accountType)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Thiết bị / OS</div>
                <div className="mt-1 font-medium text-slate-950">{selectedLog.osOfDevice ?? "Không xác định"}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Thời điểm</div>
                <div className="mt-1 font-medium text-slate-950">{formatDateTime(selectedLog.createdAt)}</div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Bảng log</CardTitle>
            <CardDescription>{loading ? "Đang tải..." : `${formatNumber(stats.total)} log`}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Loại account</th>
                  <th className="px-4 py-3 font-medium">Thiết bị / OS</th>
                  <th className="px-4 py-3 font-medium">Thời điểm</th>
                  <th className="px-4 py-3 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(data?.items ?? []).map((item) => (
                  <tr key={item.id} className={cn("hover:bg-slate-50/80", selectedLog?.id === item.id && "bg-blue-50/60")}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950">{item.username}</div>
                      <div className="text-xs text-slate-500">{item.id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatNullableText(item.accountType)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.osOfDevice ?? "Không xác định"}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && (data?.items ?? []).length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={5}>
                      Không có log phù hợp.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <button type="button" disabled={loading || stats.page === 0} onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Trang trước
          </button>
          <div className="text-sm text-slate-600">Trang {stats.page + 1} / {Math.max(1, stats.totalPages)}</div>
          <button type="button" disabled={loading || (data?.last ?? false)} onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50">
            Trang sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
