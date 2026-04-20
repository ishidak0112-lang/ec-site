'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, BarChart2, CreditCard } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface Summary {
  totalRevenue: number;
  thisMonthRevenue: number;
  thisMonthCount: number;
  totalCount: number;
  avgOrderValue: number;
}

interface MonthlyData {
  month: number;
  revenue: number;
  count: number;
}

interface CategoryData {
  name: string;
  revenue: number;
  count: number;
}

interface StatusData {
  status: string;
  count: number;
  revenue: number;
}

interface SalesData {
  summary: Summary;
  monthly: MonthlyData[];
  byCategory: CategoryData[];
  byStatus: StatusData[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: '未払い',
  PAID: '支払済',
  SHIPPED: '発送済',
  DELIVERED: '配達完了',
  CANCELLED: 'キャンセル',
};

const PIE_COLORS = ['#111827', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const fmt = (n: number) => `¥${n.toLocaleString()}`;

function KpiCard({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

function MonthlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 p-3 text-sm shadow-md">
      <p className="font-medium mb-1">{label}月</p>
      <p className="text-gray-700">{fmt(payload[0]?.value ?? 0)}</p>
      <p className="text-gray-400">{payload[1]?.value ?? 0} 件</p>
    </div>
  );
}

export default function AdminSalesPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/sales?year=${year}`)
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [year]);

  const monthlyChartData = data?.monthly.map(m => ({
    name: `${m.month}`,
    売上: m.revenue,
    件数: m.count,
  })) ?? [];

  const categoryChartData = data?.byCategory.map(c => ({
    name: c.name,
    value: c.revenue,
  })) ?? [];

  const statusChartData = data?.byStatus.map(s => ({
    name: STATUS_LABELS[s.status] ?? s.status,
    value: s.count,
    revenue: s.revenue,
  })) ?? [];

  const yearRevenue = data?.monthly.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const yearCount = data?.monthly.reduce((s, m) => s + m.count, 0) ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl tracking-tight">売上管理</h1>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="累計売上"
          value={data ? fmt(data.summary.totalRevenue) : '—'}
          sub={`${data?.summary.totalCount ?? 0} 件`}
          icon={TrendingUp}
          color="text-blue-600"
        />
        <KpiCard
          label="今月売上"
          value={data ? fmt(data.summary.thisMonthRevenue) : '—'}
          sub={`${data?.summary.thisMonthCount ?? 0} 件`}
          icon={ShoppingBag}
          color="text-green-600"
        />
        <KpiCard
          label="平均注文額"
          value={data ? fmt(data.summary.avgOrderValue) : '—'}
          sub="全期間"
          icon={CreditCard}
          color="text-purple-600"
        />
        <KpiCard
          label={`${year}年 年間売上`}
          value={loading ? '…' : fmt(yearRevenue)}
          sub={`${yearCount} 件`}
          icon={BarChart2}
          color="text-orange-600"
        />
      </div>

      {/* 月別売上バーチャート */}
      <div className="bg-white border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">月別売上</h2>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {[currentYear, currentYear - 1, currentYear - 2].map(y => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyChartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tickFormatter={v => `${v}月`}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => v >= 10000 ? `¥${(v / 10000).toFixed(0)}万` : `¥${v}`}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<MonthlyTooltip />} />
              <Bar dataKey="売上" fill="#111827" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ別売上 円グラフ */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">カテゴリ別売上（累計）</h2>
          {loading ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
          ) : categoryChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">データなし</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <table className="w-full text-sm mt-2">
                <tbody className="divide-y divide-gray-50">
                  {data?.byCategory.map((c, i) => (
                    <tr key={c.name}>
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {c.name}
                      </td>
                      <td className="py-2 text-right font-medium">{fmt(c.revenue)}</td>
                      <td className="py-2 text-right text-gray-400">{c.count}点</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* ステータス別 ドーナツグラフ */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">ステータス別件数（累計）</h2>
          {loading ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">読み込み中...</div>
          ) : statusChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">データなし</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}件`} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <table className="w-full text-sm mt-2">
                <tbody className="divide-y divide-gray-50">
                  {data?.byStatus.map((s, i) => (
                    <tr key={s.status}>
                      <td className="py-2 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {STATUS_LABELS[s.status] ?? s.status}
                      </td>
                      <td className="py-2 text-right">{s.count}件</td>
                      <td className="py-2 text-right font-medium">{fmt(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
