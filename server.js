import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import transactionsRoutes from './routes/transactions.js';
import expenseRoutes from './routes/expenses.js'; 
import goalRoutes from './routes/goals.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined. Please check your .env file.');
  process.exit(1); // Exit the application
}

// MongoDB connection
mongoose.connect(MONGO_URI, {
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

 // Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Personal Finance Tracker API');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

