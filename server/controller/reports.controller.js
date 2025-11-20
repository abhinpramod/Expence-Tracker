const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model"); // Assuming you have budgets per category

exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: "Month & year required" });

    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);

    // Fetch all expenses in that month
    const expenses = await Expense.find({
      date: {
        $gte: new Date(yearNum, monthNum, 1),
        $lt: new Date(yearNum, monthNum + 1, 1)
      }
    }).populate("categoryId", "name");

    // Fetch budgets (assuming Budget model has {categoryId, amount})
    const budgets = await Budget.find({}).populate("categoryId", "name");

    // Build report per category
    const report = budgets.map(b => {
      const spent = expenses
        .filter(e => e.categoryId._id.equals(b.categoryId._id))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        category: b.categoryId.name,
        budget: b.amount,
        spent,
        remaining: b.amount - spent
      };
    });

    res.status(200).json({ success: true, data: report });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch report" });
  }
};
