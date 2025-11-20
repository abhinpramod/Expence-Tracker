import React, { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/userSlice";
const OtpInputBox = ({ formData }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e, i) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    let temp = [...otp];
    temp[i] = value;
    setOtp(temp);

    if (value && i < 5) inputs.current[i + 1].focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");

    try {
      const res = await axiosInstance.post("/auth/verify-otp", {
        ...formData,
        otp: code,
      });

      if (res.data.success) {
        toast.success("User Registered Successfully");
        navigate("/dashboard");
        dispatch(loginUser(res.data.user));
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("OTP verification failed");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-96 text-center">

      <h2 className="text-xl font-bold mb-4">Enter OTP</h2>

      <div className="flex justify-between mb-6">
        {otp.map((v, i) => (
          <input
            key={i}
            maxLength="1"
            ref={(el) => (inputs.current[i] = el)}
            value={v}
            onChange={(e) => handleChange(e, i)}
            className="w-10 h-12 border rounded text-center text-xl"
          />
        ))}
      </div>

      <button onClick={handleVerify} className="w-full bg-green-600 text-white p-3 rounded">
        Verify OTP
      </button>

    </div>
  );
};

export default OtpInputBox;
