const express = require("express");
const router = express.Router();
const protectRoute = require("../middleware/protectRoute");
const ctrl = require("../controller/categories.controller");

router.get("/", protectRoute, ctrl.list);
router.post("/", protectRoute, ctrl.create);
router.put("/:id", protectRoute, ctrl.update);
router.delete("/:id", protectRoute, ctrl.remove);
router.get("/:id", protectRoute, ctrl.getCategoryExpenses);

module.exports = router;
