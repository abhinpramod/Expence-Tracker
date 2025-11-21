import { useEffect, useState } from "react";
import axiosInstance from "../axios";

export default function Reports() {

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1); // 👈 backend expects 1–12
  const [year, setYear] = useState(today.getFullYear());
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchData = async () => {
    const r = await axiosInstance.get(
      `/reports/monthly?month=${month}&year=${year}`,
      { withCredentials: true }
    );

    setRows(r.data.rows);
    setSummary(r.data.summary);
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

  return (
    <div className="p-4">

      {/* Title */}
      <h2 className="text-xl mb-4 font-semibold">
        Monthly Report — {month}/{year}
      </h2>

      {/* Month & Year selection */}
      <div className="mb-4 flex gap-2">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border px-3 py-2 rounded"
        >
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
            .map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>

        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border px-3 py-2 rounded w-28"
        />
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-100 rounded shadow">
            <h3 className="font-semibold">Total Budget</h3>
            <p className="text-xl font-bold">₹{summary.totalBudget}</p>
          </div>
          <div className="p-4 bg-red-100 rounded shadow">
            <h3 className="font-semibold">Total Spent</h3>
            <p className="text-xl font-bold">₹{summary.totalSpent}</p>
          </div>
          <div className="p-4 bg-green-100 rounded shadow">
            <h3 className="font-semibold">Remaining</h3>
            <p className="text-xl font-bold">₹{summary.totalRemaining}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Category</th>
            <th>Budget</th>
            <th>Spent</th>
            <th>Remaining</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.category} className={r.remaining < 0 ? "bg-red-50" : ""}>
              <td className="p-2">{r.category}</td>
              <td className="p-2">₹{r.budget}</td>
              <td className="p-2">₹{r.spent}</td>
              <td className="p-2">
                {r.remaining < 0
                  ? <span className="text-red-600">₹{r.remaining}</span>
                  : `₹${r.remaining}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ⬇️ CHART (OPTIONAL) */}
      {/* <MonthlyChart rows={rows} /> */}
    </div>
  );
}
