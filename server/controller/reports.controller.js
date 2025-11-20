const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");
const Category = require("../models/category.model");
const mongoose = require("mongoose");

exports.monthlyReport = async (req, res) => {
  const userId = req.user._id;
  const month = Number(req.query.month ?? (new Date().getMonth()));
  const year = Number(req.query.year ?? (new Date().getFullYear()));

  // reuse logic: categories + budgets + spent agg
  const categories = await Category.find({ userId });

  const budgets = await Budget.find({ userId, month, year });
  const budgetMap = {};
  budgets.forEach(b => budgetMap[b.categoryId.toString()] = b.amount);

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  const spentAgg = await Expense.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: "$categoryId", spent: { $sum: "$amount" } } }
  ]);
  const spentMap = {};
  spentAgg.forEach(s => spentMap[s._id.toString()] = s.spent);

  const rows = categories.map(c => {
    const cid = c._id.toString();
    const budget = budgetMap[cid] ?? 0;
    const spent = spentMap[cid] ?? 0;
    return {
      categoryId: cid,
      name: c.name,
      color: c.color,
      budget,
      spent,
      remaining: budget - spent
    };
  });

  res.json({ month, year, rows });
};
