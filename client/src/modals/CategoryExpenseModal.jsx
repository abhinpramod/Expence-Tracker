import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axiosInstance from "../utils/axiosInstance";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CategoryExpenseModal({ open, onClose, category, month, year }) {
  const [expenses, setExpenses] = useState([]);

  const fetchCategoryExpenses = async () => {
    if (!category) return;

    try {
      const res = await axiosInstance.get(
        `/categories/${category.id}?month=${month}&year=${year}`,
        { withCredentials: true }
      );

      setExpenses(res.data.expenses);
    } catch (err) {
      toast.error("Failed to load category expenses");
    }
  };

  useEffect(() => {
    if (open) fetchCategoryExpenses();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex justify-between items-center">
        <span className="font-bold text-lg">{category?.name} - Expenses</span>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary */}
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <p className="font-semibold">
            Spent: ₹{category?.spent} / ₹{category?.limit}
          </p>

          <p
            className={`font-bold ${
              category?.spent > category?.limit ? "text-red-600" : "text-green-600"
            }`}
          >
            Remaining: ₹{category?.limit - category?.spent}
          </p>
        </div>

        {/* Expenses List */}
        {expenses.length === 0 ? (
          <p className="text-center text-gray-600">No expenses found.</p>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {expenses.map((exp) => (
              <li
                key={exp._id}
                className="p-3 border rounded flex justify-between items-center bg-white shadow-sm"
              >
                <div>
                  <p className="font-medium">{exp.note || "No Note"}</p>

                  {/* 👇 UPDATED: Show Date + Time */}
                  <p className="text-sm text-gray-500">
                    {new Date(exp.date).toLocaleDateString()} •{" "}
                    {new Date(exp.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <p className="font-bold text-blue-600">₹{exp.amount}</p>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
