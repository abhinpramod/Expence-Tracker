import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  LinearProgress,
} from "@mui/material";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import axiosInstance from "./utils/axiosInstance";
import toast from "react-hot-toast";

import Navbar from "./components/navbar";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#F1948A"];

const Report = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState([]);

  const [loading, setLoading] = useState(false);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const years = [2023, 2024, 2025, 2026];

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/report?month=${month}&year=${year}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setReport(response.data.data);
      } else {
        toast.error("Failed to load report");
      }
    } catch (error) {
      toast.error("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const totalBudget = report.reduce((sum, r) => sum + r.budget, 0);
  const totalSpent = report.reduce((sum, r) => sum + r.spent, 0);
  const totalRemaining = report.reduce((sum, r) => sum + r.remaining, 0);

  return (
    <>
      <Navbar />

      <div className="p-4 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-bold">Monthly Expense Report</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <FormControl fullWidth>
            <InputLabel>Select Month</InputLabel>
            <Select value={month} label="Select Month" onChange={(e) => setMonth(e.target.value)}>
              {months.map((m, idx) => (
                <MenuItem key={m} value={idx + 1}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Select Year</InputLabel>
            <Select value={year} label="Select Year" onChange={(e) => setYear(e.target.value)}>
              {years.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {loading && (
          <div className="w-full">
            <LinearProgress />
          </div>
        )}

        <Card className="shadow-md">
          <CardContent>
            <h2 className="text-lg font-bold mb-4">Overall Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 text-center font-semibold gap-4">
              <div>
                <p className="text-gray-500">Total Budget</p>
                <p className="text-blue-600">₹{totalBudget}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Spent</p>
                <p className="text-orange-600">₹{totalSpent}</p>
              </div>
              <div>
                <p className="text-gray-500">Remaining</p>
                <p className={totalRemaining < 0 ? "text-red-600" : "text-green-600"}>
                  ₹{totalRemaining}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={report}
                  dataKey="spent"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {report.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>

            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Budget</th>
                    <th className="p-2 border">Spent</th>
                    <th className="p-2 border">Remaining</th>
                    <th className="p-2 border">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {report.map((item, i) => {
                    const percent = item.budget
                      ? Math.min((item.spent / item.budget) * 100, 100)
                      : 0;
                    return (
                      <tr key={i} className="text-center">
                        <td className="p-2 border">{item.category}</td>
                        <td className="p-2 border">₹{item.budget}</td>
                        <td className="p-2 border">₹{item.spent}</td>
                        <td
                          className={`p-2 border font-semibold ${
                            item.remaining < 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          ₹{item.remaining}
                        </td>
                        <td className="p-2 border">
                          <div className="w-32 mx-auto">
                            <LinearProgress variant="determinate" value={percent} />
                            <p className="text-xs mt-1">{percent.toFixed(0)}%</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Report;
