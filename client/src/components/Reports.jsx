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
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(false);

  const normalizeReportResponse = (respData) => {
    if (!respData)
      return { rows: [], summary: { totalBudget: 0, totalSpent: 0, totalRemaining: 0 } };

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
      return {
        rows: r,
        summary: {
          totalBudget: r.reduce((s, x) => s + x.budget, 0),
          totalSpent: r.reduce((s, x) => s + x.spent, 0),
          totalRemaining: r.reduce((s, x) => s + x.remaining, 0),
        }
      };
    }

    return { rows: [], summary: { totalBudget: 0, totalSpent: 0, totalRemaining: 0 } };
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        `/reports/monthly?month=${month}&year=${year}`,
        { withCredentials: true }
      );
      const { rows: newRows, summary: newSummary } =
        normalizeReportResponse(res.data);

      setRows(newRows);
      setSummary({
        totalBudget:
          Number(newSummary.totalBudget) ??
          newRows.reduce((s, r) => s + r.budget, 0),
        totalSpent:
          Number(newSummary.totalSpent) ??
          newRows.reduce((s, r) => s + r.spent, 0),
        totalRemaining:
          Number(newSummary.totalRemaining) ??
          newRows.reduce((s, r) => s + r.remaining, 0),
      });
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        Monthly Expense Report
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white rounded-xl shadow p-4">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border px-4 py-2 rounded-lg w-28 text-sm sm:text-base"
        />

        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Refresh
        </button>

        {loading && (
          <span className="text-gray-500 text-sm ml-2">Loading...</span>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Total Budget", value: summary.totalBudget, color: "text-gray-900" },
          { title: "Total Spent", value: summary.totalSpent, color: "text-red-600" },
          {
            title: "Remaining",
            value: summary.totalRemaining,
            color: summary.totalRemaining < 0 ? "text-red-600" : "text-green-600",
          },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${card.color}`}>
              ₹{card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">
            Spent vs Remaining (per category)
          </h3>

          {barData.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v}`} />
                <Legend />
                <Bar dataKey="Spent" stackId="a" />
                <Bar dataKey="Remaining" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Overall Spent vs Remaining</h3>

          {pieData.reduce((a, b) => a + b.value, 0) === 0 ? (
            <p className="text-center text-gray-500 py-12">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-right">Budget</th>
              <th className="p-3 text-right">Spent</th>
              <th className="p-3 text-right">Remaining</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  No category data found
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={i}
                  className={`border-b ${r.remaining < 0 ? "bg-red-50" : ""}`}
                >
                  <td className="p-3">{r.category}</td>
                  <td className="p-3 text-right">₹{r.budget}</td>
                  <td className="p-3 text-right">₹{r.spent}</td>
                  <td
                    className={`p-3 text-right ${
                      r.remaining < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₹{r.remaining}
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
