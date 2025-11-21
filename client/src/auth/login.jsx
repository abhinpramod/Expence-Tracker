import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/userSlice";


const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
    toast.error("Please enter a valid email address");
    return;
}


    try {
      const res = await axiosInstance.post("/auth/login", { email: formData.email, password: formData.password });

      if (res.data.success) {
        dispatch(loginUser(res.data.user));
        toast.success("Login successful");
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      console.log(err);
      
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>


        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-5 text-gray-600">
          Don’t have an account?{" "}
          <Link to="/" className="text-blue-600 font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
