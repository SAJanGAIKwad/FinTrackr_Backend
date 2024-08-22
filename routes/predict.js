// routes/predict.js
import express from 'express';
import auth from '../middleware/auth.js';
import Expense from '../models/Expense.js';
import { execSync } from 'child_process';
import fs from 'fs';

const router = express.Router();

// Load the model (you can load it into memory or dynamically in the route)
const modelPath = 'expense_predictor.pkl';

router.post('/predict', auth, async (req, res) => {
  const { date, category, description, currency } = req.body;

  try {
    // Prepare the input features
    const input = {
      date: new Date(date),
      category,
      description,
      currency,
      userId: req.user.id
    };

    // Save input as a temporary file to pass to Python script
    fs.writeFileSync('temp_input.json', JSON.stringify(input));

    // Call the Python script for prediction
    const output = execSync('python3 predict_expense.py').toString();

    // Parse the result and send it back to the client
    const predictedAmount = JSON.parse(output);
    res.status(200).json({ predictedAmount });

  } catch (error) {
    console.error('Error predicting expense:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/export', auth, async (req, res) => {
    try {
      const expenses = await Expense.find({ userId: req.user.id });
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error exporting expenses:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

export default router;
