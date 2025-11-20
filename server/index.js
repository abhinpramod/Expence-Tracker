const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const categoriesRoutes = require('./routes/categories.routes');
const budgetRoutes = require('./routes/budget.routes');


const sendEmail = require('./lib/nodemailar');
const { connectDB } = require('./lib/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expenseRoutes = require('./routes/expense.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportsRoutes = require('./routes/reports.routes');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true,                
}));
app.use('/api/auth', (req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
}
);

app.use('/api/auth', authRoutes);

app.use('/api/categories', categoriesRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/report', reportsRoutes);


connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log("Database connection error:", error.message));

