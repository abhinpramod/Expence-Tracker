import React, { useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (loading) return;

    // VALIDATIONS
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.name.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // API CALL
    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        toast.success("Signup successful");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }

    } catch (err) {
      toast.error("Signup failed");
      console.log(err);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">

        <h2 className="text-xl font-bold text-center">Create Account</h2>

        <form onSubmit={handleSignup} className="space-y-4">

          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full border p-3 rounded"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded"
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full border p-3 rounded"
            onChange={handleChange}
          />

          <button
            disabled={loading}
            className={`w-full p-3 rounded text-white
              ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Please wait..." : "Signup"}
          </button>

        </form>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Signup;
