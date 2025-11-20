const Category = require("../models/category.model");
const Expense = require("../models/expense.model");
const Budget = require("../models/budget.model");
const mongoose = require("mongoose");

exports.getDashboard = async (req, res) => {
  const userId = req.user._id;
  const month = Number(req.query.month ?? new Date().getMonth());
  const year = Number(req.query.year ?? new Date().getFullYear());

  // fetch categories
  const categories = await Category.find({ userId });

  // budgets for month
  const budgets = await Budget.find({ userId, year, month });
  const budgetMap = {};
  budgets.forEach(b => (budgetMap[b.categoryId.toString()] = b.amount));

  // monthly range
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  // aggregate spending
  const spentAgg = await Expense.aggregate([
    {
      $match: {
        userId: userId, // ✔ FIXED — NO ObjectId() needed
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: "$categoryId",
        spent: { $sum: "$amount" }
      }
    }
  ]);

  const spentMap = {};
  spentAgg.forEach(s => (spentMap[s._id.toString()] = s.spent));

  const result = categories.map(c => {
    const cid = c._id.toString();
    const limit = budgetMap[cid] ?? 0;
    const spent = spentMap[cid] ?? 0;

    return {
      id: cid,
      name: c.name,
      color: c.color,
      limit,
      spent,
      remaining: limit - spent
    };
  });

  res.json({ month, year, categories: result });
};

