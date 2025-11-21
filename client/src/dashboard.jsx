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
  const [loading, setLoading] = useState(false); // 🔥 added loading state

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      setLoading(true); // 🔥 start loader
      const res = await axiosInstance.get(
        `/dashboard?month=${month}&year=${year}`,
        { withCredentials: true }
      );
      setCategories(res.data.categories);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false); // 🔥 stop loader
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

      <div className="p-4 sm:p-6 max-w-6xl mx-auto">

        {/* Month-Year Selector */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">
            {months[month]} {year}
          </h1>

          <div className="flex gap-3 justify-center">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border px-3 py-2 rounded w-36"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border px-3 py-2 rounded w-28"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 🔥 Loading Indicator */}
        {loading && (
          <div className="w-full py-10 flex justify-center">
            <LinearProgress className="w-1/2" />
          </div>
        )}

        {/* Category Cards (hidden while loading) */}
        {!loading && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-5
            "
          >
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
                    p-4 rounded-xl shadow border bg-white cursor-pointer
                    hover:shadow-lg transition
                  "
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ background: cat.color }}
                      />
                      <h2 className="font-semibold">{cat.name}</h2>
                    </div>

                    {cat.spent > cat.limit && (
                      <span className="text-red-600 text-sm font-bold">
                        OVER BUDGET
                      </span>
                    )}
                  </div>

                  <LinearProgress
                    variant="determinate"
                    value={percent > 100 ? 100 : percent}
                  />

                  <p className="mt-2 text-sm text-gray-600">
                    Spent: ₹{cat.spent} / ₹{cat.limit}
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
        )}

        {/* Floating Add Button */}
        <Fab
          color="primary"
          aria-label="add"
          className="!fixed bottom-10 right-10 sm:bottom-10 sm:right-10"
          onClick={() => setOpenModal(true)}
        >
          <AddIcon />
        </Fab>

        <AddExpenseModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          refresh={fetchDashboard}
        />
      </div>

      <CategoryExpenseModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        category={selectedCategory}
        month={month}
        year={year}
      />
    </>
  );
}
