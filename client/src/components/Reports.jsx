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
  // Use 1-12 for month to match backend (avoid confusion)
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState([]); // per-category: { category, budget, spent, remaining }
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(false);

  const normalizeReportResponse = (respData) => {
    // Accept either { rows, summary } or { success, data } (where data = report array)
    if (!respData) return { rows: [], summary: { totalBudget: 0, totalSpent: 0, totalRemaining: 0 } };

    if (respData.rows) {
      return {
        rows: respData.rows.map((r) => ({
          category: r.category ?? r.name ?? r.categoryId ?? "Unknown",
          budget: Number(r.budget ?? 0),
          spent: Number(r.spent ?? 0),
          remaining: Number(r.remaining ?? (Number(r.budget ?? 0) - Number(r.spent ?? 0))),
        })),
        summary: respData.summary ?? {}
      };
    }

    if (respData.data && Array.isArray(respData.data)) {
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

    // fallback if backend returned array directly
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
      const payload = res.data;
      const { rows: newRows, summary: newSummary } = normalizeReportResponse(payload);
      setRows(newRows);
      // ensure numeric summary fields exist
      setSummary({
        totalBudget: Number(newSummary.totalBudget ?? newRows.reduce((s, r) => s + r.budget, 0)),
        totalSpent: Number(newSummary.totalSpent ?? newRows.reduce((s, r) => s + r.spent, 0)),
        totalRemaining: Number(newSummary.totalRemaining ?? newRows.reduce((s, r) => s + r.remaining, 0)),
      });
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

  // Prepare data for charts
  const barData = rows.map((r) => ({
    category: r.category,
    Spent: Number(r.spent),
    Remaining: Number(r.remaining),
  }));

  const pieData = [
    { name: "Spent", value: Number(summary.totalSpent) },
    { name: "Remaining", value: Number(summary.totalRemaining) >= 0 ? Number(summary.totalRemaining) : 0 },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">Monthly Expense Report</h1>

      {/* Selectors */}
      <div className="flex gap-4 items-center">
        <div>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-3 py-2 rounded w-28"
          />
        </div>

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Refresh
        </button>

        {loading && <span className="ml-3 text-sm text-gray-500">Loading...</span>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Total Budget</div>
          <div className="text-2xl font-semibold">₹{summary.totalBudget}</div>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Total Spent</div>
          <div className="text-2xl font-semibold text-red-600">₹{summary.totalSpent}</div>
        </div>
        <div className="p-4 bg-white rounded shadow text-center">
          <div className="text-sm text-gray-500">Remaining</div>
          <div className={`text-2xl font-semibold ${summary.totalRemaining < 0 ? "text-red-600" : "text-green-600"}`}>
            ₹{summary.totalRemaining}
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-2 gap-6">
        {/* Bar chart: Spent vs Remaining per category */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Spent vs Remaining (per category)</h3>
          {barData.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No data for selected month</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="Spent" stackId="a" />
                <Bar dataKey="Remaining" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: overall spent vs remaining */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Overall Spent vs Remaining</h3>
          {pieData.reduce((s, p) => s + p.value, 0) === 0 ? (
            <div className="text-center text-gray-500 py-12">No data for selected month</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded shadow">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-right">Budget</th>
              <th className="p-2 text-right">Spent</th>
              <th className="p-2 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No rows</td></tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className={r.remaining < 0 ? "bg-red-50" : ""}>
                  <td className="p-2">{r.category}</td>
                  <td className="p-2 text-right">₹{Number(r.budget)}</td>
                  <td className="p-2 text-right">₹{Number(r.spent)}</td>
                  <td className="p-2 text-right">
                    <span className={r.remaining < 0 ? "text-red-600" : "text-green-600"}>
                      ₹{Number(r.remaining)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
