'use client';

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Database } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { reportApi } from "@/services/reportClient";
import { AccountBatchStatsSummary, AccountBatchSummary } from "@/types/report";
import { formatDateTime, formatNumber } from "@/lib/report";

export default function BatchesPage() {
  const [summary, setSummary] = useState<AccountBatchSummary | null>(null);
  const [statsSummary, setStatsSummary] = useState<AccountBatchStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        reportApi.getAccountBatchSummary(),
        reportApi.getAccountBatchStatsSummary(),
      ]);
      if (!alive) return;
      const [summaryResult, statsResult] = results;
      let errorMessage = "";
      if (summaryResult.status === "fulfilled" && summaryResult.value.status === 200) {
        setSummary(summaryResult.value.data ?? null);
      } else {
        errorMessage = "Không tải được batch summary";
      }
      if (statsResult.status === "fulfilled" && statsResult.value.status === 200) {
        setStatsSummary(statsResult.value.data ?? null);
      } else {
        errorMessage = errorMessage ? `${errorMessage} • Không tải được batch stats` : "Không tải được batch stats";
      }
      if (errorMessage) {
        setError(errorMessage);
      }
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const batches = useMemo(() => {
    const primary = summary?.batchReports ?? [];
    const secondary = statsSummary?.batchStats ?? [];
    return (primary.length > 0 ? primary : secondary).slice().sort((a, b) => b.totalAccounts - a.totalAccounts);
  }, [summary, statsSummary]);

  const chartData = batches.slice(0, 10);

  return (
    <div className="min-h-full overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-slate-100">
            <Database className="h-4 w-4" />
            Batch report
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Danh sách batch và phân bổ account</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Xem tổng account, trạng thái và thời gian tạo sớm nhất/mới nhất của từng batch.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Tổng account", value: formatNumber(statsSummary?.totalAccounts ?? summary?.totalAccounts) },
            { label: "Tổng batch", value: formatNumber(statsSummary?.totalBatches ?? summary?.totalBatches) },
            { label: "Active", value: formatNumber(statsSummary?.totalActiveAccounts) },
            { label: "Inactive", value: formatNumber(statsSummary?.totalInactiveAccounts) },
          ].map((item) => (
            <Card key={item.label} className="border-white/70 bg-white/90 shadow-sm">
              <CardContent className="p-5">
                <div className="text-sm text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Top batch theo số account</CardTitle>
              <CardDescription>10 batch lớn nhất.</CardDescription>
            </CardHeader>
            <CardContent className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="batchCode" tickLine={false} axisLine={false} interval={0} />
                  <YAxis tickLine={false} axisLine={false} width={40} />
                  <Tooltip />
                  <Bar dataKey="totalAccounts" fill="#0f766e" radius={[10, 10, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.batchCode} fill={entry.totalAccounts > 0 ? "#0f766e" : "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/90 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Batch nổi bật</CardTitle>
              <CardDescription>Khoanh vùng batch để xem nhanh thống kê.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(summary?.batchReports ?? statsSummary?.batchStats ?? []).slice(0, 8).map((batch) => (
                <div key={batch.batchCode} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-950">{batch.batchCode}</div>
                      <div className="text-sm text-slate-500">{batch.batchName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-slate-950">{formatNumber(batch.totalAccounts)}</div>
                      <div className="text-xs text-slate-500">account</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-center">A {formatNumber(batch.activeAccounts)}</span>
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-center">I {formatNumber(batch.inactiveAccounts)}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-center">D {formatNumber(batch.dormantAccounts)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-center">U {formatNumber(batch.unknownAccounts)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="border-white/70 bg-white/90 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Bảng batch đầy đủ</CardTitle>
            <CardDescription>{loading ? "Đang tải..." : `${batches.length} batch`}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Batch code</th>
                  <th className="px-4 py-3 font-medium">Tên batch</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Active / Inactive / Dormant / Unknown</th>
                  <th className="px-4 py-3 font-medium">Oldest</th>
                  <th className="px-4 py-3 font-medium">Newest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {batches.map((batch) => (
                  <tr key={batch.batchCode} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-950">{batch.batchCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{batch.batchName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(batch.totalAccounts)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {formatNumber(batch.activeAccounts)} / {formatNumber(batch.inactiveAccounts)} / {formatNumber(batch.dormantAccounts)} / {formatNumber(batch.unknownAccounts)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(batch.oldestAccountInBatch)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(batch.newestAccountInBatch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
