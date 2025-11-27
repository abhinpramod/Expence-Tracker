import { useEffect, useState } from "react";
import axiosInstance from "./utils/axiosInstance";
import { LinearProgress, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddExpenseModal from "./modals/AddExpenseModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/navbar";
import CategoryExpenseModal from "./modals/CategoryExpenseModal";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function Dashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true); 
      const res = await axiosInstance.get(
        `/dashboard?month=${month}&year=${year}`,
        { withCredentials: true }
      );
      setCategories(res.data.categories);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [month, year]);

  const years = [];
  for (let y = 2020; y <= 2035; y++) years.push(y);

  return (
   <>
  <Navbar />

  <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
    
    {/* Header */}
    <div className="bg-white shadow-sm p-5 rounded-xl mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          {months[month]} {year}
        </h1>

        <div className="flex gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg shadow-sm"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-3 py-2 rounded-lg shadow-sm"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* Loading */}
    {loading && (
      <div className="w-full py-10 flex justify-center">
        <LinearProgress className="w-1/2" />
      </div>
    )}

    {/* Content */}
    {!loading && (
      <>
        {categories.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-gray-600 text-lg">
              No categories found for this month.
            </p>
            <p className="text-gray-500 mt-1">
              Click the menu button and add category .
            </p>
          </div>
        )}

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {categories?.map((cat) => {
            const percent = cat.limit ? (cat.spent / cat.limit) * 100 : 0;
            const remaining = cat.limit - cat.spent;

            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenCategoryModal(true);
                }}
                className="
                  bg-white p-5 rounded-xl shadow-sm border hover:shadow-lg 
                  transition-all cursor-pointer
                "
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ background: cat.color }}
                    />
                    <h2 className="font-bold text-gray-800">{cat.name}</h2>
                  </div>

                  {cat.spent > cat.limit && (
                    <span className="text-red-600 text-sm font-bold">
                      OVER 🔥
                    </span>
                  )}
                </div>

                <LinearProgress
                  variant="determinate"
                  value={percent > 100 ? 100 : percent}
                />

                <p className="mt-3 text-sm text-gray-700">
                  Spent:{" "}
                  <span className="font-semibold">₹{cat.spent}</span> /{" "}
                  <span className="font-semibold">₹{cat.limit}</span>
                </p>

                {remaining < 0 ? (
                  <p className="font-bold mt-1 text-red-600">
                    Exceeded by: ₹{Math.abs(remaining)}
                  </p>
                ) : (
                  <p className="font-bold mt-1 text-green-600">
                    Remaining: ₹{remaining}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}

    {/* Add Button */}
    <Fab
      color="primary"
      aria-label="add"
      className="!fixed bottom-10 right-10 shadow-xl"
      onClick={() => setOpenModal(true)}
    >
      <AddIcon />
    </Fab>

    <AddExpenseModal
      open={openModal}
      onClose={() => setOpenModal(false)}
      refresh={fetchDashboard}
    />

    <CategoryExpenseModal
      open={openCategoryModal}
      onClose={() => setOpenCategoryModal(false)}
      category={selectedCategory}
      month={month}
      year={year}
    />
  </div>
</>

  );
}
