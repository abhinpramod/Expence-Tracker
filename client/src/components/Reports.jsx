import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const months = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#F1948A", "#7FB3D5", "#76D7C4"];

export default function Reports() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(false);

  const normalizeReportResponse = (respData) => {
    if (!respData) return { rows: [], summary: { totalBudget: 0, totalSpent: 0, totalRemaining: 0 } };

    // shape: { rows, summary }
    if (respData.rows) {
      const r = respData.rows.map((it) => ({
        category: it.category ?? it.name ?? (it.categoryId?.name ?? "Unknown"),
        budget: Number(it.budget ?? 0),
        spent: Number(it.spent ?? 0),
        remaining: Number(it.remaining ?? (Number(it.budget ?? 0) - Number(it.spent ?? 0))),
      }));
      return { rows: r, summary: respData.summary ?? {} };
    }

    // shape: { data: [...] }
    if (Array.isArray(respData.data)) {
      const r = respData.data.map((it) => ({
        category: it.category ?? it.name ?? "Unknown",
        budget: Number(it.budget ?? 0),
        spent: Number(it.spent ?? 0),
        remaining: Number(it.remaining ?? (Number(it.budget ?? 0) - Number(it.spent ?? 0))),
      }));
      const summary = {
        totalBudget: r.reduce((s, x) => s + x.budget, 0),
        totalSpent: r.reduce((s, x) => s + x.spent, 0),
        totalRemaining: r.reduce((s, x) => s + x.remaining, 0),
      };
      return { rows: r, summary };
    }

    // fallback array directly
    if (Array.isArray(respData)) {
      const r = respData.map((it) => ({
        category: it.category ?? it.name ?? "Unknown",
        budget: Number(it.budget ?? 0),
        spent: Number(it.spent ?? 0),
        remaining: Number(it.remaining ?? (Number(it.budget ?? 0) - Number(it.spent ?? 0))),
      }));
      const summary = {
        totalBudget: r.reduce((s, x) => s + x.budget, 0),
        totalSpent: r.reduce((s, x) => s + x.spent, 0),
        totalRemaining: r.reduce((s, x) => s + x.remaining, 0),
      };
      return { rows: r, summary };
    }

    return { rows: [], summary: { totalBudget: 0, totalSpent: 0, totalRemaining: 0 } };
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/reports/monthly?month=${month}&year=${year}`, { withCredentials: true });
      const { rows: newRows, summary: newSummary } = normalizeReportResponse(res.data);

      const totalBudget = Number(newSummary.totalBudget ?? newRows.reduce((s, r) => s + r.budget, 0));
      const totalSpent = Number(newSummary.totalSpent ?? newRows.reduce((s, r) => s + r.spent, 0));
      const totalRemaining = Number(newSummary.totalRemaining ?? newRows.reduce((s, r) => s + r.remaining, 0));

      setRows(newRows);
      setSummary({ totalBudget, totalSpent, totalRemaining });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load report");
      setRows([]);
      setSummary({ totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Chart data
  const barData = rows.map((r) => ({
    category: r.category,
    Spent: Number(r.spent),
    Remaining: Number(r.remaining),
  }));

  const pieData = [
    { name: "Spent", value: Number(summary.totalSpent) },
    { name: "Remaining", value: Math.max(Number(summary.totalRemaining), 0) },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">Monthly Expense Report</h1>

        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <label className="sr-only">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-2 w-28 text-sm"
          />

          <button
            onClick={fetchReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
            aria-label="Refresh report"
          >
            Refresh
          </button>

          {loading && <span className="text-sm text-gray-500 ml-2">Loading...</span>}
        </div>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="mt-2 text-xl font-semibold">₹{summary.totalBudget}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="mt-2 text-xl font-semibold text-red-600">₹{summary.totalSpent}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-500">Remaining</div>
          <div className={`mt-2 text-xl font-semibold ${summary.totalRemaining < 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{summary.totalRemaining}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-3">Spent vs Remaining (per category)</h3>
          {barData.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No data for selected month</div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v}`} />
                  <Legend />
                  <Bar dataKey="Spent" stackId="a" fill="#ef4444" />
                  <Bar dataKey="Remaining" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-3">Overall Spent vs Remaining</h3>
          {pieData.reduce((s, p) => s + p.value, 0) === 0 ? (
            <div className="text-center text-gray-500 py-12">No data for selected month</div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {pieData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Desktop table (md+) */}
      <section className="hidden md:block bg-white rounded-lg shadow p-4 overflow-x-auto">
        <table className="w-full table-auto min-w-[640px]">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-right">Spent</th>
              <th className="px-4 py-3 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">No data available</td>
              </tr>
            ) : rows.map((r, i) => (
              <tr key={i} className={`border-b ${r.remaining < 0 ? "bg-red-50" : ""}`}>
                <td className="px-4 py-3">{r.category}</td>
                <td className="px-4 py-3 text-right">₹{r.budget}</td>
                <td className="px-4 py-3 text-right">₹{r.spent}</td>
                <td className={`px-4 py-3 text-right ${r.remaining < 0 ? "text-red-600" : "text-green-600"}`}>₹{r.remaining}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Mobile cards (sm & below) */}
      <section className="md:hidden space-y-3">
        {rows.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">No data available</div>
        ) : rows.map((r, i) => (
          <article key={i} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium">{r.category}</h4>
              <div className="text-sm text-gray-500">Budget: ₹{r.budget}</div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Spent</div>
              <div className="text-right font-medium text-red-600">₹{r.spent}</div>

              <div className="text-gray-600">Remaining</div>
              <div className={`text-right font-medium ${r.remaining < 0 ? "text-red-600" : "text-green-600"}`}>₹{r.remaining}</div>
            </div>

            {/* small progress bar */}
            <div className="mt-3 bg-gray-100 h-2 rounded-full overflow-hidden">
              {/* percent spent relative to budget */}
              <div
                className="h-full"
                style={{
                  width: `${r.budget ? Math.min((r.spent / r.budget) * 100, 100) : 0}%`,
                  background: r.spent / (r.budget || 1) > 1 ? "#ef4444" : "#3b82f6",
                }}
                aria-hidden
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
