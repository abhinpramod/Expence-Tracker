const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const { getDashboard } = require("../controller/dashboard.controller");

router.get("/", protectRoute, getDashboard);
module.exports = router;
