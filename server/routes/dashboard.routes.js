const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectroute");
const { getDashboard } = require("../controller/dashboard.controller");

router.get("/", protectRoute, getDashboard);
module.exports = router;
