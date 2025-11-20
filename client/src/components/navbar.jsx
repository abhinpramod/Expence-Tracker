import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogActions,
  Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Confirmation Dialog State
  const [openConfirm, setOpenConfirm] = useState(false);

  const showBack = location.pathname !== "/";

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Logged out successfully");
        dispatch(logoutUser());
        navigate("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <>
      <AppBar position="static" className="bg-blue-600">
        <Toolbar className="flex justify-between">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-2">
            {/* BACK BUTTON */}
            {showBack && (
              <IconButton color="inherit" onClick={() => navigate(-1)}>
                <ArrowBackIcon />
              </IconButton>
            )}

            {/* APP TITLE */}
            <Typography variant="h6" className="font-bold">
              Expense Tracker
            </Typography>
          </div>

          {/* MENU ICON */}
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <MenuIcon fontSize="large" />
          </IconButton>

          {/* MENU DROPDOWN */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                navigate("/budgets");
                setAnchorEl(null);
              }}
            >
              Add Budget
            </MenuItem>

            <MenuItem
              onClick={() => {
                navigate("/categories");
                setAnchorEl(null);
              }}
            >
              Add Category
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate("/report");
                setAnchorEl(null);
              }}
            >
              Report
            </MenuItem>

            <MenuItem
              onClick={() => {
                setOpenConfirm(true);
                setAnchorEl(null);
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* CONFIRM LOGOUT DIALOG */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle className="text-lg font-semibold">
          Are you sure you want to logout?
        </DialogTitle>

        <DialogActions className="p-4">
          <Button
            onClick={() => setOpenConfirm(false)}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>

          <Button
            onClick={() => {
              setOpenConfirm(false);
              handleLogout();
            }}
            variant="contained"
            color="error"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
