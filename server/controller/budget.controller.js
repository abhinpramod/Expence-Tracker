const Budget = require("../models/budget.model");

/* ================================
   SAVE / UPDATE MONTHLY BUDGETS
================================ */
exports.setBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year, budgets } = req.body;

    if (month === undefined || !year || !budgets) {
      return res.status(400).json({
        success: false,
        message: "Month, Year & Budgets are required",
      });
    }

    // Prepare bulk update operations
    const ops = budgets.map((b) => ({
      updateOne: {
        filter: {
          userId,
          categoryId: b.categoryId,
          month,
          year,
        },
        update: {
          $set: {
            amount: Number(b.amount ?? 0),
          },
        },
        upsert: true,
      },
    }));

    await Budget.bulkWrite(ops);

    res.json({ success: true, message: "Budgets saved successfully" });
  } catch (error) {
    console.log("Budget Save Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save budgets",
    });
  }
};

/* ================================
   GET MONTHLY BUDGETS
================================ */
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (month === undefined || !year) {
      return res.status(400).json({
        success: false,
        message: "Month & Year are required",
      });
    }

    const budgets = await Budget.find({
      userId,
      month,
      year,
    });

    res.json(budgets);
  } catch (error) {
    console.log("Budget Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load budgets",
    });
  }
};
