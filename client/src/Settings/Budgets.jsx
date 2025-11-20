import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import Navbar from "../components/navbar";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function BudgetsSettings() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});

  const fetch = async () => {
    const [catsRes, budRes] = await Promise.all([
      axiosInstance.get("/categories", { withCredentials: true }),
      axiosInstance.get(`/budgets?month=${month}&year=${year}`, { withCredentials: true })
    ]);

    setCategories(catsRes.data);

    const map = {};
    budRes.data.forEach((b) => (map[b.categoryId] = b.amount));
    setBudgets(map);
  };

  useEffect(() => {
    fetch();
  }, [month, year]);

  const save = async () => {
    const payload = {
      month,
      year,
      budgets: categories.map((c) => ({
        categoryId: c._id,
        amount: Number(budgets[c._id] || 0),
      })),
    };

    await axiosInstance.post("/budgets", payload, { withCredentials: true });
    toast.success("Budgets Saved Successfully!");
  };

  return (
    <>
      <Navbar />
      <div className="p-5 max-w-2xl mx-auto">

        {/* Page Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Monthly Budget Settings
        </h1>

        {/* Month + Year Selectors */}
        <div className="flex gap-4 mb-6">

          {/* Month */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          {/* Year */}
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm w-28 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Category Budget List */}
        <div className="bg-white rounded-xl shadow p-5 space-y-4 border">

          {categories.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-4 py-2 border-b last:border-b-0"
            >
              <span
                className="w-5 h-5 rounded-full border"
                style={{ background: c.color }}
              ></span>

              <div className="flex-1 text-gray-800 text-lg font-medium">
                {c.name}
              </div>

              <input
                type="number"
                placeholder="0"
                value={budgets[c._id] ?? ""}
                onChange={(e) =>
                  setBudgets({ ...budgets, [c._id]: e.target.value })
                }
                className="border border-gray-300 px-3 py-2 rounded-lg w-32 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={save}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-lg text-lg shadow-md w-full"
          >
            Save Budgets
          </button>
        </div>
      </div>
    </>
  );
}
