import axiosInstance from '../utils/axiosInstance.js';  
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/userSlice.js";
import { useEffect, useState } from "react";

const useAuthCheak = () => {
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const checkAuth = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/auth/check-auth");
            if (res.data.success) {
                dispatch(loginUser(res.data.user));'../utils/axiosInstance.js';;
                
            }
        } catch (err) {

            console.log(err);

        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        checkAuth();
    }, []);
    return { loading };
};


export default useAuthCheak ;