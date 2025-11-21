import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import Navbar from "../components/navbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { LinearProgress } from "@mui/material";

export default function CategoriesSettings() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: "", color: "#60a5fa" });

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [loading, setLoading] = useState(false); 

  const fetch = async () => {
    try {
      setLoading(true); 
      const response = await axiosInstance.get("/categories", {
        withCredentials: true,
      });

      setList(response.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const add = async () => {
    if (!form.name.trim()) return toast.error("Enter category name");

    await axiosInstance.post("/categories", form, { withCredentials: true });
    toast.success("Category Added");

    fetch();
    setForm({ name: "", color: "#60a5fa" });
  };

  const handleDelete = async () => {
    await axiosInstance.delete(`/categories/${deleteId}`, {
      withCredentials: true,
    });
    toast.success("Category Deleted");
    fetch();
    setConfirmOpen(false);
  };

  return (
    <>
      <Navbar />

      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Category Settings</h2>

        <div className="bg-white shadow-md rounded-xl p-5 mb-6 border">
          <h3 className="font-semibold text-lg mb-4">Add New Category</h3>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category Name"
              className="border px-4 py-2 rounded-lg w-full focus:ring focus:ring-blue-200 outline-none"
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Category Color</label>

              <div className="relative">
                <div
                  className="w-14 h-14 rounded-xl border shadow-sm flex items-center justify-center transition-all duration-200"
                  style={{ backgroundColor: form.color }}
                >
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={add}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5 border">
          <h3 className="font-semibold text-lg mb-4">Your Categories</h3>

          {loading && (
            <div className="w-full py-6 flex justify-center">
              <LinearProgress className="w-1/2" />
            </div>
          )}

          {!loading && (
            <>
              {list.length === 0 && (
                <p className="text-gray-600 text-center py-3">
                  No categories added yet
                </p>
              )}

              <ul className="space-y-3">
                {list?.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded-full border"
                        style={{ background: c.color }}
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>

                    <button
                      onClick={() => {
                        setDeleteId(c._id);
                        setConfirmOpen(true);
                      }}
                      className="text-red-600 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Category?"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
