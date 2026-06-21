'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, BarChart3, CalendarRange, ChevronLeft, ChevronRight, Eye, Search, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportApi } from "@/services/reportClient";
import { AccountReport } from "@/types/report";
import { PageResponse } from "@/types/pagination";
import { formatDateTime, formatNullableText, formatNumber, getAccountAgeDays, getStatusLabel, getStatusTone } from "@/lib/report";
import {
  buildTimeBuckets,
  getDefaultGranularityForPreset,
  getTimePresetRange,
  TimeGranularity,
  TimePreset,
  toDateTimeApiValue,
} from "@/lib/reportTime";
import { cn } from "@/lib/utils";

type QueryState = {
  username: string;
  createdFrom: string;
  createdTo: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
};

const INITIAL_QUERY: QueryState = {
  username: "",
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

export default function AccountsPage() {
  const [query, setQuery] = useState<QueryState>(INITIAL_QUERY);
  const [granularity, setGranularity] = useState<TimeGranularity>("day");
  const [activePreset, setActivePreset] = useState<TimePreset | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AccountReport | null>(null);
  const [data, setData] = useState<PageResponse<AccountReport> | null>(null);
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
        const response = await reportApi.queryAccounts({
          username: query.username || undefined,
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
          setError(response.message || "Không tải được danh sách account");
        }
      } catch (err) {
        if (alive && requestId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : "Không tải được danh sách account");
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

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    return {
      total: data?.totalElements ?? 0,
      current: items.length,
      page: data?.page ?? 0,
      totalPages: data?.totalPages ?? 0,
    };
  }, [data]);

  const timeBuckets = useMemo(() => {
    return buildTimeBuckets(data?.items ?? [], (item) => item.createdAt, granularity);
  }, [data, granularity]);

  const topTimeBuckets = useMemo(() => {
    return [...timeBuckets].sort((a, b) => b.total - a.total).slice(0, 6);
  }, [timeBuckets]);

  const timeChartKey = `${query.createdFrom}-${query.createdTo}-${granularity}-${query.page}-${query.size}`;
  const selectedStatusTone = selectedAccount ? getStatusTone(selectedAccount.accountStatus) : "";
  const selectedAccountAge = selectedAccount ? getAccountAgeDays(selectedAccount.createdAt, selectedAccount.daysSinceCreated) : null;

  function applyPreset(preset: TimePreset) {
    setActivePreset(preset);
    setGranularity(getDefaultGranularityForPreset(preset));
    setSelectedAccount(null);
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-slate-100">
                <Users className="h-4 w-4" />
                Danh sách account
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">Tra cứu account theo filter</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Dùng để tìm theo username, thời gian tạo và xem paging trả về từ backend.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-slate-300">Tổng account</div>
                <div className="mt-1 text-2xl font-semibold">{formatNumber(stats.total)}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-slate-300">Trang hiện tại</div>
                <div className="mt-1 text-2xl font-semibold">{stats.page + 1}</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <div className="text-slate-300">Tổng trang</div>
                <div className="mt-1 text-2xl font-semibold">{formatNumber(stats.totalPages)}</div>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Thay đổi filter sẽ tải lại dữ liệu từ API. Có thể chọn nhanh theo ngày, tháng hoặc năm.</CardDescription>
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
            <div className="grid gap-4 xl:grid-cols-7">
              <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Username" value={query.username} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, username: e.target.value }))} />
              <input type="datetime-local" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.createdFrom} onChange={(e) => { setActivePreset(null); setQuery((prev) => ({ ...prev, page: 0, createdFrom: e.target.value })); }} />
              <input type="datetime-local" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.createdTo} onChange={(e) => { setActivePreset(null); setQuery((prev) => ({ ...prev, page: 0, createdTo: e.target.value })); }} />
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={granularity} onChange={(e) => { setActivePreset(null); setGranularity(e.target.value as TimeGranularity); }}>
                {granularityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.size} onChange={(e) => setQuery((prev) => ({ ...prev, page: 0, size: Number(e.target.value) }))}>
                {[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}/trang</option>)}
              </select>
              <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm" value={query.sortDirection} onChange={(e) => setQuery((prev) => ({ ...prev, sortDirection: e.target.value }))}>
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
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
                Thống kê account theo thời gian
              </CardTitle>
              <CardDescription>Gom các account đang hiển thị theo mức giờ, ngày, tháng hoặc năm.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[320px]">
                {timeBuckets.length > 0 ? (
                  <ResponsiveContainer key={timeChartKey} width="100%" height="100%">
                    <BarChart data={timeBuckets} margin={{ left: 0, right: 12, top: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis tickLine={false} axisLine={false} width={40} />
                      <Tooltip formatter={(value) => [formatNumber(Number(value)), "Account"]} />
                      <Bar dataKey="total" fill="#0f766e" radius={[10, 10, 0, 0]} />
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
              <CardTitle>Bucket nổi bật</CardTitle>
              <CardDescription>Các mốc thời gian có nhiều account nhất trong trang hiện tại.</CardDescription>
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
                      className="h-full rounded-full bg-teal-700"
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

        {selectedAccount ? (
          <Card className="border-teal-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Chi tiết account {selectedAccount.username}</CardTitle>
              <CardDescription>Thông tin chi tiết của bản ghi đang chọn trong bảng.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">ID</div>
                <div className="mt-1 break-all font-medium text-slate-950">{selectedAccount.id}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Username</div>
                <div className="mt-1 font-medium text-slate-950">{selectedAccount.username}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Loại account</div>
                <div className="mt-1 font-medium text-slate-950">{formatNullableText(selectedAccount.accountType)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Ngày tạo</div>
                <div className="mt-1 font-medium text-slate-950">{formatDateTime(selectedAccount.createdAt)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Ngày cập nhật</div>
                <div className="mt-1 font-medium text-slate-950">{formatDateTime(selectedAccount.updatedAt)}</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Trạng thái</div>
                <span className={cn("mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", selectedStatusTone)}>
                  {getStatusLabel(selectedAccount.accountStatus)}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Tuổi account</div>
                <div className="mt-1 font-medium text-slate-950">
                  {selectedAccountAge === null ? "Không xác định" : `${formatNumber(selectedAccountAge)} ngày`}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Bảng account</CardTitle>
            <CardDescription>{loading ? "Đang tải..." : `${stats.current} bản ghi trên trang này`}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Username</th>
                  <th className="px-4 py-3 font-medium">Loại account</th>
                  <th className="px-4 py-3 font-medium">Ngày tạo</th>
                  <th className="px-4 py-3 font-medium">Ngày cập nhật</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium">Tuổi account</th>
                  <th className="px-4 py-3 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(data?.items ?? []).map((item) => (
                  <tr key={item.id} className={cn("hover:bg-slate-50/80", selectedAccount?.id === item.id && "bg-teal-50/60")}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-950">{item.username}</div>
                      <div className="text-xs text-slate-500">{item.id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatNullableText(item.accountType)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getStatusTone(item.accountStatus))}>
                        {getStatusLabel(item.accountStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getAccountAgeDays(item.createdAt, item.daysSinceCreated) === null
                        ? "Không xác định"
                        : `${formatNumber(getAccountAgeDays(item.createdAt, item.daysSinceCreated))} ngày`}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelectedAccount(item)}
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
                    <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={7}>
                      Không có dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading || stats.page === 0}
            onClick={() => setQuery((prev) => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Trang trước
          </button>
          <div className="text-sm text-slate-600">
            Trang {stats.page + 1} / {Math.max(1, stats.totalPages)}
          </div>
          <button
            type="button"
            disabled={loading || (data?.last ?? false)}
            onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            Trang sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
