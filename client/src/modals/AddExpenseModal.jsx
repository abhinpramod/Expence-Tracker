import { useEffect, useState } from "react";
import { Modal, Box, Button, TextField, MenuItem, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

export default function AddExpenseModal({ open, onClose, refresh }) {
  const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    note: "",
    date: new Date(),
  });

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 420,
    bgcolor: "white",
    borderRadius: 10,
    boxShadow: 24,
    p: 4,
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      axiosInstance

        .get("/categories", { withCredentials: true })
        .then((r) => {
          setCategories(r.data);
          setLoading(false);
          setForm({
            categoryId: "",
            amount: "",
            note: "",
            date: new Date(),
          });
        })
        .catch(() => {
          toast.error("Failed to load categories");
          setLoading(false);
        });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!form.categoryId || !form.amount)
      return toast.error("Please fill category and amount");

    try {
        setLoading(true);
      const res = await axiosInstance.post(
        "/expense",
        {
          categoryId: form.categoryId,
          amount: Number(form.amount),
          note: form.note,
          date: form.date,
        },
        { withCredentials: true }
      );

      const { over } = res.data;
      if (over) toast.error("Over budget!");

      else toast.success("Expense added");

      onClose();
      refresh()
      
      setLoading(false);
    } catch (err) {
      toast.error("Failed to add expense");
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle} className="relative">

        <IconButton
          onClick={onClose}
          size="small"
          className="absolute top-3 right-3"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <h2 className="text-xl font-semibold text-gray-800 mb-5 text-center">
          Add Expense
        </h2>

        <TextField
          select
          label="Category"
          fullWidth
          size="small"
          className="mb-4"
          value={form.categoryId}
          onChange={(e) =>
            setForm({ ...form, categoryId: e.target.value })
          }
        >
          {categories?.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Amount"
          type="number"
          fullWidth
          size="small"
          className="mb-4"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <DatePicker
            selected={new Date(form.date)}
            onChange={(d) => setForm({ ...form, date: d })}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <TextField
          label="Note"
          fullWidth
          size="small"
          className="mb-5"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ paddingY: 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Expense"}
        </Button>
      </Box>
    </Modal>
  );
}